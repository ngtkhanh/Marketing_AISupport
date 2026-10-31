import { GoogleGenAI, Type } from '@google/genai';
import { CampaignInput, MarketingIdea } from '@/types/marketing';
import { buildSystemPrompt, buildUserPrompt } from './prompt';
import { rawAIResponseSchema } from '../schemas';
import { validateMarketingOutput } from './validate-output';

export interface GeminiCallSuccess {
  ok: true;
  source: 'ai';
  model: string;
  ideas: MarketingIdea[];
}

export interface GeminiCallError {
  ok: false;
  code: 'CONFIG_ERROR' | 'SAFETY_BLOCKED' | 'RATE_LIMITED' | 'TIMEOUT' | 'SCHEMA_ERROR' | 'API_ERROR';
  message: string;
  canFallback: boolean; // true nếu là lỗi hạ tầng (429/5xx/timeout/schema), false nếu là lỗi cấu hình/bảo mật
}

const GEMINI_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          channels: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          mainContent: { type: Type.STRING },
          estimatedBudget: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.INTEGER },
                title: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['week', 'title', 'activities']
            }
          }
        },
        required: [
          'title',
          'tagline',
          'channels',
          'mainContent',
          'estimatedBudget',
          'targetAudience',
          'timeline'
        ]
      }
    }
  },
  required: ['ideas']
};

/**
 * Gọi Gemini API với timeout 20 giây và 3 lớp kiểm soát đầu ra
 */
async function callGeminiOnce(
  ai: GoogleGenAI,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 20000
): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const err = new Error('Gemini API request timed out');
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
  });

  const apiPromise = ai.models.generateContent({
    model: modelName,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: GEMINI_SCHEMA,
      temperature: 0.8
    }
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response.text || '';
}

/**
 * Điều phối gọi AI với cơ chế 3 lớp kiểm soát và retry 1 lần
 */
export async function generateMarketingIdeasWithGemini(
  input: CampaignInput
): Promise<GeminiCallSuccess | GeminiCallError> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return {
      ok: false,
      code: 'CONFIG_ERROR',
      message: 'Hệ thống chưa được cấu hình GEMINI_API_KEY hợp lệ trong biến môi trường.',
      canFallback: false
    };
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = buildSystemPrompt(input);
  const baseUserPrompt = buildUserPrompt(input);

  // Thử gọi tối đa 2 lần (1 lần gọi chính + 1 lần retry nếu lỗi schema/nghiệp vụ)
  let lastErrorMsg = '';

  for (let attempt = 1; attempt <= 2; attempt++) {
    const userPrompt =
      attempt === 1
        ? baseUserPrompt
        : `${baseUserPrompt}\n\n[LƯU Ý KHẨN CẤP CHO LẦN THỬ LẠI]: Lần tạo trước bị lỗi: "${lastErrorMsg}". Hãy sửa triệt để: đúng 5 ý tưởng, mỗi ý tưởng đúng 4 tuần (week 1 đến 4), không dùng kênh bị cấm.`;

    try {
      const rawText = await callGeminiOnce(ai, modelName, systemPrompt, userPrompt);
      if (!rawText) {
        throw new Error('Gemini API trả về nội dung rỗng');
      }

      // Lớp 1: Parse JSON
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (jsonErr) {
        lastErrorMsg = 'Định dạng JSON không hợp lệ';
        if (attempt === 1) continue;
        throw jsonErr;
      }

      // Lớp 2: Zod Schema Parse
      const zodResult = rawAIResponseSchema.safeParse(parsedJson);
      if (!zodResult.success) {
        lastErrorMsg = zodResult.error.errors.map((e) => e.message).join(', ');
        if (attempt === 1) continue;
        return {
          ok: false,
          code: 'SCHEMA_ERROR',
          message: `Dữ liệu AI không khớp cấu trúc: ${lastErrorMsg}`,
          canFallback: true
        };
      }

      // Server tự sinh UUID cho từng ý tưởng
      const ideasWithId: MarketingIdea[] = zodResult.data.ideas.map((item) => ({
        ...item,
        id: crypto.randomUUID()
      }));

      // Lớp 3: Kiểm tra Logic Nghiệp vụ (Forbidden channels & 4 weeks)
      const logicResult = validateMarketingOutput(ideasWithId, input);
      if (!logicResult.valid) {
        lastErrorMsg = logicResult.errors.join('; ');
        if (attempt === 1) continue;
        return {
          ok: false,
          code: 'SCHEMA_ERROR',
          message: `Vi phạm logic nghiệp vụ marketing: ${lastErrorMsg}`,
          canFallback: true
        };
      }

      // Thành công cả 3 lớp!
      return {
        ok: true,
        source: 'ai',
        model: modelName,
        ideas: ideasWithId
      };
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string; status?: number; code?: string };
      const errMsg = error.message || '';

      // Kiểm tra lỗi Timeout
      if (error.name === 'TimeoutError' || errMsg.includes('timed out')) {
        lastErrorMsg = 'Quá hạn 20 giây phản hồi';
        if (attempt === 1) continue;
        return {
          ok: false,
          code: 'TIMEOUT',
          message: 'Hệ thống AI mất quá nhiều thời gian phản hồi (quá 20s).',
          canFallback: true
        };
      }

      // Kiểm tra lỗi Key / Quyền hạn (401, 403, API_KEY_INVALID)
      if (
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('401') ||
        errMsg.includes('403') ||
        errMsg.includes('unregistered')
      ) {
        return {
          ok: false,
          code: 'CONFIG_ERROR',
          message: 'GEMINI_API_KEY không hợp lệ hoặc đã hết hạn quyền truy cập.',
          canFallback: false
        };
      }

      // Kiểm tra lỗi Bộ lọc an toàn (Safety block)
      if (errMsg.includes('SAFETY') || errMsg.includes('blocked') || errMsg.includes('harmful')) {
        return {
          ok: false,
          code: 'SAFETY_BLOCKED',
          message: 'Yêu cầu bị bộ lọc an toàn của Google từ chối. Vui lòng điều chỉnh mô tả sản phẩm/mục tiêu.',
          canFallback: false
        };
      }

      // Kiểm tra lỗi Quota / Rate limit (429 / RESOURCE_EXHAUSTED)
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
        return {
          ok: false,
          code: 'RATE_LIMITED',
          message: 'Hạn mức gọi Gemini API tạm thời bị vượt quá (Rate limit 429).',
          canFallback: true
        };
      }

      // Lỗi hạ tầng khác
      lastErrorMsg = errMsg;
      if (attempt === 1) continue;

      return {
        ok: false,
        code: 'API_ERROR',
        message: `Lỗi kết nối AI: ${errMsg || 'Không xác định'}`,
        canFallback: true
      };
    }
  }

  return {
    ok: false,
    code: 'API_ERROR',
    message: `Thử lại 2 lần không thành công: ${lastErrorMsg}`,
    canFallback: true
  };
}


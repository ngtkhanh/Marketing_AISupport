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
          },
          marketingLogic: {
            type: Type.OBJECT,
            properties: {
              customerBarrierOrNeed: { type: Type.STRING },
              productBenefitAndProof: { type: Type.STRING },
              campaignMechanism: { type: Type.STRING },
              desiredAction: { type: Type.STRING },
              successRequirements: { type: Type.STRING }
            },
            required: [
              'customerBarrierOrNeed',
              'productBenefitAndProof',
              'campaignMechanism',
              'desiredAction',
              'successRequirements'
            ]
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

// Ngân sách thời gian toàn cục để không bao giờ bị Vercel 60s timeout đập chết tiến trình
const GLOBAL_DEADLINE_MS = 48000; // 48 giây (dành biên an toàn 12s cho route maxDuration = 60s)
const SINGLE_CALL_TIMEOUT_MS = 20000; // 20 giây tối đa cho 1 lượt gọi model
const MIN_REMAINING_FOR_CALL_MS = 8000; // Dưới 8s không đủ để sinh 5 ý tưởng, ngắt ngay để kịp fallback

/**
 * Gọi Gemini API với timeout linh hoạt và 3 lớp kiểm soát đầu ra
 */
async function callGeminiOnce(
  ai: GoogleGenAI,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = SINGLE_CALL_TIMEOUT_MS
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
      temperature: 0.7
    }
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response.text || '';
}

/**
 * Điều phối gọi AI với cơ chế 3 lớp kiểm soát, model failover và retry 1 lần
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

  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  // Chuỗi failover dự phòng nếu model chính gặp 503 High Demand hoặc 404/429 Quota Exceeded
  const candidateModels = [
    preferredModel,
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.8-flash'
  ].filter((v, i, a) => a.indexOf(v) === i);

  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = buildSystemPrompt(input);
  const baseUserPrompt = buildUserPrompt(input);

  const startTime = Date.now();
  let lastErrorMsg = '';
  let activeModel = preferredModel;

  for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
    activeModel = candidateModels[modelIdx];

    for (let attempt = 1; attempt <= 2; attempt++) {
      const elapsed = Date.now() - startTime;
      const remainingTime = GLOBAL_DEADLINE_MS - elapsed;

      // Kiểm tra ngân sách thời gian: Nếu không còn đủ thời gian an toàn, ngắt để fallback ngay
      if (remainingTime < MIN_REMAINING_FOR_CALL_MS) {
        console.warn(
          `[GEMINI DEADLINE] Ngân sách thời gian cạn (${remainingTime}ms còn lại). Kích hoạt ngắt an toàn để fallback trước khi Vercel timeout.`
        );
        return {
          ok: false,
          code: 'TIMEOUT',
          message: 'Thời gian gọi AI vượt quá ngân sách an toàn của máy chủ.',
          canFallback: true
        };
      }

      // Đặt timeout cho lần gọi này dựa trên thời gian còn lại (tối đa SINGLE_CALL_TIMEOUT_MS)
      const callTimeout = Math.min(SINGLE_CALL_TIMEOUT_MS, Math.max(5000, remainingTime - 1500));

      const userPrompt =
        attempt === 1
          ? baseUserPrompt
          : `${baseUserPrompt}\n\n[LƯU Ý KHẨN CẤP CHO LẦN THỬ LẠI - SỬA LỖI NGHIỆP VỤ]:\nLần tạo trước bị vi phạm lỗi sau: "${lastErrorMsg}".\nHÃY SỬA TRIỆT ĐỂ:\n1. Mọi kênh trong mảng 'channels' của mỗi ý tưởng BẮT BUỘC phải có hoạt động triển khai cụ thể trong 4 tuần timeline (hãy ghi rõ tên kênh ở đầu hoạt động, ví dụ: '[Tên kênh] Hoạt động...'). Tuyệt đối không để kênh nào bị bỏ quên.\n2. Đảm bảo đúng 5 ý tưởng khác biệt, mỗi ý tưởng có đủ 4 tuần tuần tự (week 1 đến 4).\n3. Không dùng bất kỳ kênh bị cấm nào đối với mức ngân sách đã chọn.`;

      try {
        const rawText = await callGeminiOnce(ai, activeModel, systemPrompt, userPrompt, callTimeout);
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
          model: activeModel,
          ideas: ideasWithId
        };
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string; status?: number; code?: string };
        const errMsg = error.message || '';

        // Lỗi 503 (High Demand) hoặc 404 (Not Found): Chuyển ngay sang candidate model tiếp theo
        const isUnavailable =
          errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');
        const isNotFound = errMsg.includes('404');

        if (isUnavailable || isNotFound) {
          const reason = isUnavailable ? '503 (Quá tải tạm thời/High Demand)' : '404 (Model không tồn tại)';
          console.warn(`[GEMINI MODEL SPIKE] Model "${activeModel}" gặp sự cố ${reason}. Tự động chuyển model dự phòng...`);
          break; // Thoát vòng lặp attempt để nhảy sang candidate model tiếp theo
        }

        // Kiểm tra lỗi Timeout
        if (error.name === 'TimeoutError' || errMsg.includes('timed out')) {
          lastErrorMsg = 'Quá hạn phản hồi';
          if (GLOBAL_DEADLINE_MS - (Date.now() - startTime) < MIN_REMAINING_FOR_CALL_MS) {
            break;
          }
          if (attempt === 1) continue;
          break;
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

        // Kiểm tra lỗi Quota (429 / RESOURCE_EXHAUSTED)
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
          lastErrorMsg = 'Hạn mức gọi Gemini API tạm thời bị vượt quá (Rate limit 429).';
          break;
        }

        lastErrorMsg = errMsg;
        if (attempt === 1) continue;
        break;
      }
    }
  }

  const isTimeout =
    lastErrorMsg === 'Quá hạn phản hồi' ||
    Date.now() - startTime >= GLOBAL_DEADLINE_MS - MIN_REMAINING_FOR_CALL_MS;

  return {
    ok: false,
    code: isTimeout ? 'TIMEOUT' : 'API_ERROR',
    message: isTimeout
      ? 'Thời gian gọi AI vượt quá giới hạn an toàn máy chủ.'
      : `Thử nghiệm các model AI không thành công: ${lastErrorMsg}`,
    canFallback: true
  };
}


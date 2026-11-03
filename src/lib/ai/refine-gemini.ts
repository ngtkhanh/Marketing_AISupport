import { GoogleGenAI, Type } from '@google/genai';
import { CampaignInput, MarketingIdea } from '@/types/marketing';
import { refineAIOutputSchema } from '../schemas';
import { validateSingleIdeaMarketingOutput } from './validate-output';
import { BUDGET_CONFIGS } from '../config/budget';

export interface RefineCallSuccess {
  ok: true;
  source: 'ai';
  model: string;
  refinedIdea: MarketingIdea;
  changeReason: string;
  changesSummary: string[];
}

export interface RefineCallError {
  ok: false;
  code: 'CONFIG_ERROR' | 'SAFETY_BLOCKED' | 'RATE_LIMITED' | 'TIMEOUT' | 'SCHEMA_ERROR' | 'API_ERROR';
  message: string;
  canFallback: boolean;
}

const REFINEMENT_GEMINI_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    refinedIdea: {
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
    },
    changeReason: { type: Type.STRING },
    changesSummary: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['refinedIdea', 'changeReason', 'changesSummary']
};

function buildRefinementSystemPrompt(
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
): string {
  const budgetConfig = BUDGET_CONFIGS[context.budgetLevel];

  return `Bạn là Giám đốc Marketing (CMO) cấp cao kiêm Chuyên gia Chiến lược Tăng trưởng Thực chiến tại thị trường Việt Nam.

NHIỆM VỤ CỦA BẠN:
Người dùng đang có một ý tưởng chiến dịch marketing đã tạo trước đó và muốn TINH CHỈNH (Refine) ý tưởng này theo một yêu cầu cụ thể bằng ngôn ngữ tự nhiên.

QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. NGUYÊN TẮC ĐỒNG BỘ LAN TỎA TOÀN DIỆN (HOLISTIC & CASCADE ALIGNMENT):
   Một chiến dịch marketing là một thể thống nhất hữu cơ. Bạn không được chỉ sửa một trường đơn lẻ mà để các trường khác bị khập khiễng. Khi người dùng đưa ra một yêu cầu, bạn PHẢI rà soát và điều chỉnh đồng bộ TẤT CẢ các mục liên quan để toàn bộ chiến dịch đạt độ logic và tính khả thi thực tế 100%:
   - Khi thay đổi NGÂN SÁCH (ví dụ giảm chi phí): Bắt buộc phải điều chỉnh lại KÊNH (loại bỏ kênh đắt tiền, ưu tiên organic/seeding/barter), tinh gọn NỘI DUNG CHIẾN LƯỢC và rút gọn các hoạt động tốn kém trong TIMELINE 4 TUẦN; đồng thời tập trung TỆP KHÁCH HÀNG vào nhóm dễ chuyển đổi nhất.
   - Khi thay đổi KÊNH (ví dụ ưu tiên TikTok/Reels): Bắt buộc điều chỉnh SLOGAN (bắt trend, ngắn gọn, dễ nhớ), NỘI DUNG CHIẾN LƯỢC (tập trung visual/video ngắn) và TIMELINE (bổ sung kịch bản video, booking KOC, minigame/challenge).
   - Khi thay đổi ĐỐI TƯỢNG MỤC TIÊU (ví dụ sang Gen Z hoặc sinh viên): Bắt buộc điều chỉnh Tone of voice trong SLOGAN, KÊNH tiếp cận (nơi đối tượng tập trung đông) và các hoạt động tương tác trong TIMELINE.
   - Khi yêu cầu ĐƠN GIẢN HÓA: Cắt giảm các khâu vận hành cồng kềnh trong TIMELINE và NỘI DUNG CHIẾN LƯỢC.
2. BẢO TOÀN LÕI SẢN PHẨM: Giữ vững bản sắc sản phẩm/dịch vụ (${context.productName}) và ngành hàng (${context.industry}), tránh việc thay đổi làm mất gốc của đề bài.
3. NGÂN SÁCH VÀ KÊNH:
   - Mức ngân sách: ${budgetConfig.label} (${budgetConfig.rangeText}).
   - Kênh tối ưu: ${budgetConfig.recommendedChannels.join(', ')}.
   - TUYỆT ĐỐI KHÔNG ĐƯA CÁC KÊNH BỊ CẤM: ${budgetConfig.forbiddenChannels.length > 0 ? budgetConfig.forbiddenChannels.join(', ') : 'Không có'}.
4. TIMELINE: Bắt buộc giữ cấu trúc ĐÚNG 4 TUẦN (week 1, 2, 3, 4). Mỗi tuần có 2–4 hoạt động cụ thể, khả thi phù hợp với ngân sách và kênh mới.
5. MINH BẠCH VỀ SỰ THAY ĐỔI:
   - "changeReason": Giải thích góc nhìn chiến lược CMO: tại sao lại điều chỉnh đồng bộ các mục như vậy để đáp ứng yêu cầu người dùng.
   - "changesSummary": Danh sách 2-5 gạch đầu dòng nêu rõ các khía cạnh đã được tinh chỉnh đồng bộ (Ngân sách, Kênh, Nội dung, Timeline...).

Trả về định dạng JSON thuần tuý khớp với schema được yêu cầu.`;
}

function buildRefinementUserPrompt(
  currentIdea: MarketingIdea,
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>,
  instruction: string
): string {
  return `THÔNG TIN NGỮ CẢNH DOANH NGHIỆP:
- Ngành hàng: ${context.industry}
- Sản phẩm/Dịch vụ: ${context.productName}
- Mức ngân sách: ${context.budgetLevel}
- Mục tiêu ban đầu: ${context.objective}

CHIẾN DỊCH HIỆN TẠI CẦN TINH CHỈNH:
${JSON.stringify(
  {
    title: currentIdea.title,
    tagline: currentIdea.tagline,
    channels: currentIdea.channels,
    mainContent: currentIdea.mainContent,
    estimatedBudget: currentIdea.estimatedBudget,
    targetAudience: currentIdea.targetAudience,
    timeline: currentIdea.timeline
  },
  null,
  2
)}

YÊU CẦU TINH CHỈNH TỪ NGƯỜI DÙNG:
"${instruction}"

Hãy phân tích yêu cầu trên và cập nhật lại chiến dịch. Nêu rõ lý do thay đổi và tóm tắt những điểm mới trong JSON trả về.`;
}

async function callRefineGeminiOnce(
  ai: GoogleGenAI,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 35000
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
      responseSchema: REFINEMENT_GEMINI_SCHEMA,
      temperature: 0.7
    }
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response.text || '';
}

export async function refineMarketingIdeaWithGemini(
  currentIdea: MarketingIdea,
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>,
  instruction: string
): Promise<RefineCallSuccess | RefineCallError> {
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
  const candidateModels = [
    preferredModel,
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.8-flash'
  ].filter((v, i, a) => a.indexOf(v) === i);

  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = buildRefinementSystemPrompt(context);
  const baseUserPrompt = buildRefinementUserPrompt(currentIdea, context, instruction);

  let lastErrorMsg = '';
  let activeModel = preferredModel;

  for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
    activeModel = candidateModels[modelIdx];

    for (let attempt = 1; attempt <= 2; attempt++) {
      const userPrompt =
        attempt === 1
          ? baseUserPrompt
          : `${baseUserPrompt}\n\n[LƯU Ý LẦN THỬ LẠI]: Lần trước gặp lỗi "${lastErrorMsg}". Hãy đảm bảo: đúng 4 tuần timeline, không dùng kênh bị cấm, chỉ sửa các trường cần thiết.`;

      try {
        const rawText = await callRefineGeminiOnce(ai, activeModel, systemPrompt, userPrompt);
        if (!rawText) throw new Error('Gemini API trả về nội dung rỗng');

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
        const zodResult = refineAIOutputSchema.safeParse(parsedJson);
        if (!zodResult.success) {
          lastErrorMsg = zodResult.error.errors.map((e) => e.message).join(', ');
          if (attempt === 1) continue;
          return {
            ok: false,
            code: 'SCHEMA_ERROR',
            message: `Dữ liệu tinh chỉnh không khớp cấu trúc: ${lastErrorMsg}`,
            canFallback: true
          };
        }

        const { refinedIdea, changeReason, changesSummary } = zodResult.data;

        // Giữ nguyên ID, tăng version
        const newVersion = (currentIdea.version || 1) + 1;
        const previousSnapshot = {
          title: currentIdea.title,
          tagline: currentIdea.tagline,
          channels: currentIdea.channels,
          mainContent: currentIdea.mainContent,
          estimatedBudget: currentIdea.estimatedBudget,
          targetAudience: currentIdea.targetAudience,
          timeline: currentIdea.timeline
        };

        const existingHistory = currentIdea.refinementHistory || [];
        const newHistoryEntry = {
          version: newVersion,
          refinedAt: new Date().toISOString(),
          instruction,
          changeReason,
          changesSummary,
          previousIdea: previousSnapshot
        };

        const finalIdea: MarketingIdea = {
          ...refinedIdea,
          id: currentIdea.id,
          version: newVersion,
          refinementHistory: [newHistoryEntry, ...existingHistory]
        };

        // Lớp 3: Logic nghiệp vụ (4 tuần, không có kênh cấm)
        const logicResult = validateSingleIdeaMarketingOutput(finalIdea, context.budgetLevel);
        if (!logicResult.valid) {
          lastErrorMsg = logicResult.errors.join('; ');
          if (attempt === 1) continue;
          return {
            ok: false,
            code: 'SCHEMA_ERROR',
            message: `Vi phạm logic nghiệp vụ khi tinh chỉnh: ${lastErrorMsg}`,
            canFallback: true
          };
        }

        return {
          ok: true,
          source: 'ai',
          model: activeModel,
          refinedIdea: finalIdea,
          changeReason,
          changesSummary
        };
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string; status?: number; code?: string };
        const errMsg = error.message || '';

        if (
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('404')
        ) {
          console.warn(`[REFINE SPIKE] Model "${activeModel}" lỗi 503/404. Chuyển model dự phòng...`);
          break;
        }

        if (error.name === 'TimeoutError' || errMsg.includes('timed out')) {
          lastErrorMsg = 'Quá hạn phản hồi';
          if (attempt === 1) continue;
          break;
        }

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

        if (errMsg.includes('SAFETY') || errMsg.includes('blocked') || errMsg.includes('harmful')) {
          return {
            ok: false,
            code: 'SAFETY_BLOCKED',
            message: 'Yêu cầu tinh chỉnh bị bộ lọc an toàn từ chối.',
            canFallback: false
          };
        }

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

  return {
    ok: false,
    code: 'API_ERROR',
    message: `Không thể tinh chỉnh ý tưởng: ${lastErrorMsg}`,
    canFallback: true
  };
}

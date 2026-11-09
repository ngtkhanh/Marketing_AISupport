import { GoogleGenAI, Type } from '@google/genai';
import { ShortlistEntry, AICMOVerdict } from '@/types/marketing';
import { compareStrategiesOutputSchema } from '../schemas';

export interface CompareCallSuccess {
  ok: true;
  source: 'ai';
  model: string;
  verdict: AICMOVerdict;
}

export interface CompareCallError {
  ok: false;
  code: 'CONFIG_ERROR' | 'SAFETY_BLOCKED' | 'RATE_LIMITED' | 'TIMEOUT' | 'SCHEMA_ERROR' | 'API_ERROR';
  message: string;
  canFallback: boolean;
}

const COMPARE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headToHeadAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          campaignId: { type: Type.STRING },
          title: { type: Type.STRING },
          version: { type: Type.INTEGER },
          keyAdvantage: { type: Type.STRING },
          biggestTradeOff: { type: Type.STRING },
          bestSuitedFor: { type: Type.STRING }
        },
        required: ['campaignId', 'title', 'version', 'keyAdvantage', 'biggestTradeOff', 'bestSuitedFor']
      }
    },
    recommendedWinner: {
      type: Type.OBJECT,
      properties: {
        campaignId: { type: Type.STRING },
        title: { type: Type.STRING },
        version: { type: Type.INTEGER },
        verdictReason: { type: Type.STRING }
      },
      required: ['campaignId', 'title', 'version', 'verdictReason']
    },
    hybridStrategyTip: { type: Type.STRING }
  },
  required: ['headToHeadAnalysis', 'recommendedWinner', 'hybridStrategyTip']
};

function buildCompareSystemPrompt(): string {
  return `Bạn là Giám đốc Marketing (CMO) cấp cao kiêm Cố vấn Chiến lược Tăng trưởng Thực chiến tại thị trường Việt Nam.

NHIỆM VỤ CỦA BẠN:
Người dùng đang phân vân giữa 2 hoặc 3 phương án chiến lược marketing khác nhau (hoặc các phiên bản tinh chỉnh của cùng một chiến dịch). Bạn cần đưa ra PHÁN QUYẾT & LỜI KHUYÊN ĐỘC LẬP (CMO VERDICT).

QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. PHÂN TÍCH ĐÁNH ĐỔI TRỰC DIỆN (TRADE-OFF ANALYSIS):
   - Không có chiến dịch nào là hoàn hảo 100%. Mỗi lựa chọn đều phải đánh đổi (ví dụ: muốn viral nhanh trên TikTok thì phải chấp nhận lượt xem trồi sụt; muốn an toàn bền vững thì chi phí cao và tốc độ chậm).
   - "keyAdvantage": Nêu điểm vượt trội lớn nhất và sắc bén nhất của phương án này.
   - "biggestTradeOff": Nêu rõ điểm phải hy sinh hoặc rủi ro lớn nhất nếu chọn phương án này.
   - "bestSuitedFor": Doanh nghiệp nên chọn phương án này trong hoàn cảnh nào? (ví dụ: cần ra số gấp, hay cần xây dựng thương hiệu).
2. QUYẾT ĐOÁN CHỌN PHƯƠNG ÁN TỐI ƯU (RECOMMENDED WINNER):
   - Đưa ra 1 phương án thắng cuộc rõ ràng phù hợp nhất với mục tiêu ban đầu của doanh nghiệp kèm lý do thuyết phục, đanh thép (verdictReason).
3. MẸO CHIẾN LƯỢC LAI (HYBRID STRATEGY TIP):
   - Gợi ý cách "lai ghép" thông minh: Làm sao để lấy điểm sáng nhất của phương án này kết hợp với điểm mạnh của phương án kia để đạt ROI tối đa.
4. MINH BẠCH VÀ TRUNG THỰC:
   - TUYỆT ĐỐI KHÔNG sinh điểm số ảo ("Tỷ lệ thành công 95%"). Mọi nhận xét phải dựa trên logic kênh, timeline, tệp khách và ngân sách.

Trả về định dạng JSON thuần tuý khớp với schema được cung cấp.`;
}

function buildCompareUserPrompt(entries: ShortlistEntry[]): string {
  const context = entries[0].context;

  const strategiesData = entries.map((entry, idx) => ({
    soThuTu: idx + 1,
    campaignId: entry.id,
    title: entry.idea.title,
    version: entry.idea.version || 1,
    slogan: entry.idea.tagline,
    nganSach: entry.idea.estimatedBudget,
    kenh: entry.idea.channels,
    khachHang: entry.idea.targetAudience,
    noiDungChinh: entry.idea.mainContent,
    timelineSummary: entry.idea.timeline.map((w) => `Tuần ${w.week}: ${w.title}`).join(' | ')
  }));

  return `NGỮ CẢNH DOANH NGHIỆP:
- Sản phẩm/Dịch vụ: ${context.productName}
- Ngành hàng: ${context.industry}
- Mức ngân sách: ${context.budgetLevel}
- Mục tiêu chính: ${context.objective}

DANH SÁCH ${entries.length} PHƯƠNG ÁN ĐỐI ĐẦU CẦN SO SÁNH:
${JSON.stringify(strategiesData, null, 2)}

Hãy đóng vai trò CMO thực chiến: so sánh đối đầu từng phương án, chỉ ra đánh đổi (trade-offs), chọn ra 1 phương án tối ưu nhất và gợi ý mẹo chiến lược lai (hybrid strategy).`;
}

export function getFallbackAICMOVerdict(entries: ShortlistEntry[]): AICMOVerdict {
  const first = entries[0];
  const second = entries[1] || entries[0];

  return {
    headToHeadAnalysis: entries.map((e, idx) => {
      const v = e.idea.version || 1;
      const isLean = e.idea.estimatedBudget.toLowerCase().includes('tiết kiệm') || e.context.budgetLevel === 'low';
      const isTikTok = e.idea.channels.some((c) => c.toLowerCase().includes('tiktok'));

      return {
        campaignId: e.id,
        title: e.idea.title,
        version: v,
        keyAdvantage: isTikTok
          ? 'Tận dụng thuật toán video ngắn để lan tỏa tự nhiên với chi phí truyền thông thấp nhất.'
          : idx === 0
          ? 'Cấu trúc chiến lược bài bản, độ bao phủ cân bằng giữa độ nhận diện và chuyển đổi.'
          : 'Thông điệp sáng tạo đột phá, dễ gây ấn tượng mạnh với tệp khách hàng trẻ.',
        biggestTradeOff: isLean
          ? 'Đòi hỏi sự đầu tư công sức tự làm nội dung cao của team nội bộ để bù lại ngân sách.'
          : 'Cần sự phối hợp nhiều kênh cùng lúc, có nguy cơ phân tán nếu quản trị ngân sách lỏng lẻo.',
        bestSuitedFor: isLean
          ? 'Phù hợp khi cần tối ưu từng đồng vốn, ưu tiên kiểm tra độ đón nhận thực tế của thị trường.'
          : 'Phù hợp khi cần tạo cú hích thương hiệu rõ nét và có sẵn nhân sự triển khai đều đặn.'
      };
    }),
    recommendedWinner: {
      campaignId: first.id,
      title: first.idea.title,
      version: first.idea.version || 1,
      verdictReason: `Phương án "${first.idea.title} (v${first.idea.version || 1})" có tính khả thi và độ cân bằng cao nhất giữa mục tiêu "${first.context.objective}" và tính thực tế của ngân sách. Kế hoạch tuần tự rõ ràng, giảm thiểu tối đa rủi ro phát sinh chi phí ngoài dự kiến.`
    },
    hybridStrategyTip: `Bạn có thể áp dụng chiến lược kết hợp: Lấy thông điệp và slogan sắc bén của "${first.idea.title}" làm chủ đề xuyên suốt, nhưng áp dụng định dạng video ngắn và kênh phân phối của "${second.idea.title}" để tối ưu chi phí tiếp cận.`
  };
}

// Ngân sách thời gian toàn cục cho route so sánh (maxDuration = 45s)
const GLOBAL_COMPARE_DEADLINE_MS = 36000; // 36s (dành biên an toàn 9s cho Vercel 45s)
const SINGLE_COMPARE_TIMEOUT_MS = 18000; // 18s tối đa cho 1 lần gọi
const MIN_REMAINING_COMPARE_MS = 7000; // Dưới 7s không đủ thời gian phân tích, ngắt để fallback

async function callGeminiCompareOnce(
  ai: GoogleGenAI,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = SINGLE_COMPARE_TIMEOUT_MS
): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const err = new Error('Gemini API comparison request timed out');
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
      responseSchema: COMPARE_SCHEMA,
      temperature: 0.6
    }
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response.text || '';
}

export async function evaluateStrategiesWithGeminiCMO(
  entries: ShortlistEntry[]
): Promise<CompareCallSuccess | CompareCallError> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return {
      ok: false,
      code: 'CONFIG_ERROR',
      message: 'Hệ thống chưa cấu hình GEMINI_API_KEY.',
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
  const systemPrompt = buildCompareSystemPrompt();
  const userPrompt = buildCompareUserPrompt(entries);

  const startTime = Date.now();
  let lastErrorMsg = '';

  for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
    const activeModel = candidateModels[modelIdx];

    const elapsed = Date.now() - startTime;
    const remainingTime = GLOBAL_COMPARE_DEADLINE_MS - elapsed;

    if (remainingTime < MIN_REMAINING_COMPARE_MS) {
      console.warn(
        `[COMPARE DEADLINE] Ngân sách thời gian cạn (${remainingTime}ms còn lại). Dừng để fallback trước khi Vercel timeout.`
      );
      return {
        ok: false,
        code: 'TIMEOUT',
        message: 'Thời gian phân tích so sánh AI vượt quá ngân sách an toàn.',
        canFallback: true
      };
    }

    const callTimeout = Math.min(SINGLE_COMPARE_TIMEOUT_MS, Math.max(5000, remainingTime - 1500));

    try {
      const rawText = await callGeminiCompareOnce(ai, activeModel, systemPrompt, userPrompt, callTimeout);
      if (!rawText) throw new Error('API trả về rỗng');

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        lastErrorMsg = 'Lỗi cú pháp JSON';
        continue;
      }

      const validated = compareStrategiesOutputSchema.safeParse(parsed);
      if (!validated.success) {
        lastErrorMsg = validated.error.errors.map((err) => err.message).join(', ');
        continue;
      }

      return {
        ok: true,
        source: 'ai',
        model: activeModel,
        verdict: validated.data
      };
    } catch (err: unknown) {
      const error = err as { message?: string; name?: string };
      const msg = error.message || '';

      if (error.name === 'TimeoutError' || msg.includes('timed out')) {
        lastErrorMsg = 'Quá hạn phản hồi';
        if (GLOBAL_COMPARE_DEADLINE_MS - (Date.now() - startTime) < MIN_REMAINING_COMPARE_MS) {
          break;
        }
        continue;
      }

      if (msg.includes('503') || msg.includes('404') || msg.includes('UNAVAILABLE')) {
        continue;
      }

      if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('403')) {
        return {
          ok: false,
          code: 'CONFIG_ERROR',
          message: 'API Key không hợp lệ hoặc hết quyền.',
          canFallback: false
        };
      }

      lastErrorMsg = msg;
    }
  }

  const isTimeout =
    lastErrorMsg === 'Quá hạn phản hồi' ||
    Date.now() - startTime >= GLOBAL_COMPARE_DEADLINE_MS - MIN_REMAINING_COMPARE_MS;

  return {
    ok: false,
    code: isTimeout ? 'TIMEOUT' : 'API_ERROR',
    message: isTimeout
      ? 'Thời gian phân tích so sánh AI vượt quá giới hạn an toàn máy chủ.'
      : `Không thể hoàn thành phân tích so sánh AI: ${lastErrorMsg}`,
    canFallback: true
  };
}


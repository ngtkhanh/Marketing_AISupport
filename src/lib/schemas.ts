import { z } from 'zod';
import { sanitizeString } from './sanitize';

// Regex kiểm tra chuỗi có chứa ít nhất 1 chữ cái (hỗ trợ Unicode tiếng Việt)
const HAS_LETTER_REGEX = /\p{L}/u;

// Nguyên âm tiếng Việt & tiếng Anh mở rộng (bao gồm cả các biến thể có dấu)
const VOWEL_REGEX = /[aeiouyáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/iu;

/**
 * Kiểm tra xem chuỗi có chứa chữ cái lặp 3 lần liên tiếp trở lên (ví dụ: cccc, aaaa, zzzz)
 * Không chặn các số tiền hoặc số lượng hợp lệ như 5.000 hay 20.000.000
 */
export function hasRepeatedChars(text: string): boolean {
  // Chữ cái lặp 3 lần liên tiếp trở lên
  if (/(\p{L})\1{2,}/iu.test(text)) return true;
  // Ký hiệu lạ lặp 4 lần liên tiếp trở lên (trừ chữ cái, số, khoảng trắng)
  if (/([^\s\p{L}0-9])\1{3,}/u.test(text)) return true;
  return false;
}

/**
 * Kiểm tra chuỗi rác gõ phím ngẫu nhiên (toàn phụ âm, hoặc tỷ lệ ký tự duy nhất quá thấp)
 */
export function isGibberish(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 4) return false;

  // Nếu có từ >= 4 ký tự dính liền nhưng không chứa bất kỳ nguyên âm nào (ví dụ: bcdfgh, asdfgh, zxcvbn)
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (w.length >= 4 && !VOWEL_REGEX.test(w) && /^[\p{L}]+$/u.test(w)) {
      return true;
    }
  }

  // Tỷ lệ ký tự phân biệt quá thấp với chuỗi dài >= 6 ký tự (ví dụ: acccccc có 7 ký tự nhưng chỉ 2 ký tự duy nhất)
  const lettersOnly = clean.toLowerCase().replace(/[^\p{L}]/gu, '');
  if (lettersOnly.length >= 6) {
    const uniqueChars = new Set(lettersOnly).size;
    if (uniqueChars / lettersOnly.length < 0.35) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra số lượng từ hợp lệ tối thiểu trong câu (mỗi từ >= 2 ký tự)
 */
export function hasValidWordCount(text: string, minWords = 2): boolean {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  return words.length >= minWords;
}

export const campaignInputSchema = z.object({
  industry: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 2 && val.length <= 50, {
      message: 'Vui lòng nhập ngành hàng (từ 2–50 ký tự)'
    })
    .refine((val) => HAS_LETTER_REGEX.test(val), {
      message: 'Ngành hàng nên chứa ký tự chữ cái rõ nghĩa (VD: F&B, Thời trang...)'
    })
    .refine((val) => !hasRepeatedChars(val), {
      message: 'Ngành hàng dường như chứa ký tự lặp bất thường. Bạn thử nhập ngành hàng cụ thể nhé (VD: F&B, Thời trang, Mỹ phẩm)'
    })
    .refine((val) => !isGibberish(val), {
      message: 'Ngành hàng có vẻ chưa rõ nghĩa, bạn thử chọn hoặc mô tả cụ thể hơn nhé (VD: F&B, Thời trang, Công nghệ...)'
    }),
  productName: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 2 && val.length <= 80, {
      message: 'Vui lòng nhập tên sản phẩm (từ 2–80 ký tự)'
    })
    .refine((val) => HAS_LETTER_REGEX.test(val), {
      message: 'Tên sản phẩm nên chứa chữ cái rõ nghĩa (VD: Trà sữa kem trứng)'
    })
    .refine((val) => !hasRepeatedChars(val), {
      message: 'Tên sản phẩm dường như chứa ký tự lặp bất thường. Bạn thử mô tả cụ thể hơn nhé (VD: Trà sữa matcha đóng chai)'
    })
    .refine((val) => !isGibberish(val), {
      message: 'Tên sản phẩm có vẻ chưa rõ nghĩa, bạn thử mô tả cụ thể hơn nhé (VD: Trà sữa matcha đóng chai, Áo thun unisex)'
    }),
  budgetLevel: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Vui lòng chọn mức ngân sách (Thấp / Trung bình / Cao)' })
  }),
  objective: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 5 && val.length <= 200, {
      message: 'Vui lòng nhập mục tiêu chiến dịch (từ 5–200 ký tự)'
    })
    .refine((val) => HAS_LETTER_REGEX.test(val), {
      message: 'Mục tiêu chiến dịch nên chứa chữ cái rõ nghĩa'
    })
    .refine((val) => !hasRepeatedChars(val), {
      message: 'Mục tiêu dường như chứa ký tự lặp bất thường. Bạn thử diễn đạt rõ hơn nhé (VD: Tăng độ nhận diện thương hiệu)'
    })
    .refine((val) => !isGibberish(val), {
      message: 'Mục tiêu chiến dịch có vẻ chưa rõ nghĩa, bạn thử mô tả cụ thể hơn nhé (VD: Tăng nhận diện thương hiệu, Kéo khách tới quán...)'
    })
    .refine((val) => hasValidWordCount(val, 2), {
      message: 'Mục tiêu chiến dịch nên có ít nhất 2 từ để AI gợi ý đúng nhất nhé (VD: Tăng nhận diện thương hiệu, Kéo khách đến quán...)'
    }),
  additionalNotes: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : ''))
    .refine((val) => val.length <= 300, {
      message: 'Ghi chú bổ sung tối đa 300 ký tự'
    })
    .refine((val) => !val || !hasRepeatedChars(val), {
      message: 'Ghi chú bổ sung chứa ký tự lặp bất thường, bạn vui lòng kiểm tra lại nhé'
    })
    .refine((val) => !val || !isGibberish(val), {
      message: 'Ghi chú bổ sung có vẻ chưa rõ nghĩa, bạn thử mô tả cụ thể hơn nhé'
    })
});

export const weeklyPlanSchema = z.object({
  week: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  title: z.string().min(2, 'Tiêu đề tuần tối thiểu 2 ký tự'),
  activities: z
    .array(z.string().min(2))
    .min(1, 'Mỗi tuần phải có ít nhất 1 hoạt động')
    .max(5, 'Mỗi tuần tối đa 5 hoạt động')
});

export const rawAIIdeaSchema = z.object({
  title: z.string().min(2),
  tagline: z.string().min(2),
  channels: z.array(z.string().min(2)).min(1).max(6),
  mainContent: z.string().min(10),
  estimatedBudget: z.string().min(2),
  targetAudience: z.string().min(2),
  timeline: z.array(weeklyPlanSchema).length(4, 'Mỗi ý tưởng phải có đúng 4 tuần')
});

export const rawAIResponseSchema = z.object({
  ideas: z.array(rawAIIdeaSchema).length(5, 'Phải có đúng 5 ý tưởng chiến dịch')
});

export type ValidatedCampaignInput = z.infer<typeof campaignInputSchema>;

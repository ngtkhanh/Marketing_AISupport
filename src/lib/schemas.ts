import { z } from 'zod';
import { sanitizeString } from './sanitize';

// Regex kiểm tra chuỗi có chứa ít nhất 1 chữ cái (hỗ trợ Unicode tiếng Việt)
const HAS_LETTER_REGEX = /\p{L}/u;

export const campaignInputSchema = z.object({
  industry: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 2 && val.length <= 50, {
      message: 'Vui lòng nhập ngành hàng (2–50 ký tự)'
    })
    .refine((val) => HAS_LETTER_REGEX.test(val), {
      message: 'Ngành hàng phải chứa ký tự chữ cái hợp lệ'
    }),
  productName: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 2 && val.length <= 80, {
      message: 'Vui lòng nhập tên sản phẩm (2–80 ký tự)'
    })
    .refine((val) => HAS_LETTER_REGEX.test(val), {
      message: 'Tên sản phẩm phải chứa ký tự chữ cái hợp lệ'
    }),
  budgetLevel: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Vui lòng chọn mức ngân sách (Thấp / Trung bình / Cao)' })
  }),
  objective: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.length >= 5 && val.length <= 200, {
      message: 'Vui lòng nhập mục tiêu chiến dịch (5–200 ký tự)'
    })
    .refine((val) => HAS_LETTER_REGEX.test(val), {
      message: 'Mục tiêu phải chứa ký tự chữ cái hợp lệ'
    }),
  additionalNotes: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : ''))
    .refine((val) => val.length <= 300, {
      message: 'Ghi chú bổ sung tối đa 300 ký tự'
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


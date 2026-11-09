import { z } from 'zod';
import { sanitizeString } from './sanitize';

// Regex kiểm tra chuỗi có chứa ít nhất 1 chữ cái (hỗ trợ Unicode tiếng Việt)
const HAS_LETTER_REGEX = /\p{L}/u;

// Nguyên âm tiếng Việt & tiếng Anh mở rộng (bao gồm cả các biến thể có dấu)
const VOWEL_REGEX = /[aeiouyáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/iu;

/**
 * Danh mục từ viết tắt đặc thù và phổ biến trong Marketing, MarTech, AdTech,
 * kinh doanh số và các chỉ số tăng trưởng (không phân biệt hoa thường).
 */
export const MARKETING_ACRONYMS = new Set([
  // Ngành hàng & Mô hình kinh doanh
  'fmcg', 'fmcgs', 'cpg', 'cpgs', 'dnvb', 'dnvbs', 'b2b', 'b2c', 'd2c', 'c2c', 'b2b2c',
  'smb', 'smbs', 'sme', 'smes', 'qsr', 'qsrs', 'horeca', 'o2o', 'p2p', 'ota', 'otas',
  'dtc', 'dtcs', 'btb', 'btc', 'b2g',

  // Chỉ số & Phễu (Metrics & Funnel)
  'cltv', 'cltvs', 'ltv', 'ltvs', 'cac', 'cacs', 'mql', 'mqls', 'sql', 'sqls',
  'pql', 'pqls', 'sal', 'sals', 'mrr', 'mrrs', 'arr', 'arrs', 'gmv', 'gmvs',
  'aov', 'aovs', 'nps', 'npss', 'csat', 'ces', 'ctr', 'ctrs', 'cpc', 'cpcs',
  'cpm', 'cpms', 'cpa', 'cpas', 'cpl', 'cpls', 'cpo', 'cpos', 'cpv', 'cpvs',
  'cpi', 'cpis', 'cps', 'cpss', 'cpe', 'cpes', 'cpd', 'cpds', 'ecpm', 'ecpms',
  'vcpm', 'vcpms', 'roas', 'roi', 'romi', 'mer', 'mers', 'crr', 'crrs', 'ccr', 'ccrs',
  'ndr', 'ndrs', 'grr', 'grrs',

  // MarTech, AdTech & Nền tảng
  'dsp', 'dsps', 'ssp', 'ssps', 'dmp', 'dmps', 'cdp', 'cdps', 'crm', 'crms',
  'cms', 'cmss', 'erp', 'erps', 'pos', 'poss', 'posm', 'posms', 'sdk', 'sdks',
  'api', 'apis', 'rpa', 'dam', 'dams', 'pim', 'pims', 'esp', 'esps', 'sms', 'smss',
  'mms', 'mmss', 'ivr', 'ivrs', 'wms', 'wmss', 'tms', 'tmss',

  // Chiến lược & Kênh tiếp thị
  'mmm', 'mmms', 'mta', 'mtas', 'plg', 'plgs', 'slg', 'slgs', 'blg', 'abm', 'abms',
  'kol', 'kols', 'koc', 'kocs', 'ugc', 'ugcs', 'pgc', 'pgcs', 'cgc', 'cgcs',
  'tvc', 'tvcs', 'pr', 'prs', 'ooh', 'oohs', 'dooh', 'doohs', 'seo', 'seos',
  'sem', 'sems', 'aso', 'asos', 'smo', 'smos', 'smm', 'smms', 'ppc', 'ppcs',
  'cta', 'ctas', 'usp', 'usps', 'pod', 'pods', 'pop', 'pops', 'rtb', 'rtbs',
  'wom', 'woms', 'ewom', 'gtm', 'gtms',

  // Quyền riêng tư, Pháp lý & Kỹ thuật
  'gdpr', 'ccpa', 'att', 'skan', 'cmp', 'cmps', 'ssl', 'tls', 'cdn', 'cdns', 'dns', 'www'
]);

/**
 * Kiểm tra xem một từ đơn có phải là từ viết tắt ngành Marketing / Kinh doanh hợp lệ hay không.
 * Kết hợp tra cứu từ điển và nhận diện cấu trúc Acronym (chữ in hoa 2-6 ký tự, có thể có đuôi 's' số nhiều).
 */
export function isMarketingAcronym(word: string): boolean {
  const cleanWord = word.replace(/^[()[\]{}"'.,:;\\/+=&_-]+|[()[\]{}"'.,:;\\/+=&_-]+$/g, '');
  if (!cleanWord) return false;
  const lower = cleanWord.toLowerCase();
  if (MARKETING_ACRONYMS.has(lower)) return true;
  // Dạng viết HOA toàn bộ: 2-6 ký tự chữ hoa hoặc số (FMCG, CLTV, B2B, O2O)
  if (/^[A-Z0-9]{2,6}$/.test(cleanWord)) return true;
  // Dạng số nhiều của Acronym: viết HOA kèm đuôi 's' hoặc s (MQLs, SQLs, CTRs, CPMs)
  if (/^[A-Z0-9]{2,5}('?s)$/.test(cleanWord)) return true;
  return false;
}

/**
 * Kiểm tra xem chuỗi có chứa chữ cái lặp 3 lần liên tiếp trở lên (ví dụ: cccc, aaaa, zzzz)
 * Bỏ qua các từ viết tắt hợp lệ (như MMM, WWW) và các số tiền/số lượng (như 5.000 hay 20.000.000)
 */
export function hasRepeatedChars(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  for (const rawW of words) {
    const w = rawW.replace(/^[()[\]{}"'.,:;\\/+=&_-]+|[()[\]{}"'.,:;\\/+=&_-]+$/g, '');
    if (!w) continue;
    // Bỏ qua nếu từ là acronym hợp lệ
    if (isMarketingAcronym(w)) continue;

    // Chữ cái lặp 3 lần liên tiếp trở lên
    if (/(\p{L})\1{2,}/iu.test(w)) return true;
    // Ký hiệu lạ lặp 4 lần liên tiếp trở lên (trừ chữ cái, số, khoảng trắng)
    if (/([^\s\p{L}0-9])\1{3,}/u.test(w)) return true;
  }

  // Kiểm tra trên toàn chuỗi với ký hiệu lạ
  if (/([^\s\p{L}0-9])\1{3,}/u.test(text)) return true;
  return false;
}

/**
 * Kiểm tra chuỗi rác gõ phím ngẫu nhiên (toàn phụ âm, hoặc tỷ lệ ký tự duy nhất quá thấp)
 * Không chặn nhầm các từ viết tắt Marketing (FMCG, CLTV, MQLs, DNVB...)
 */
export function isGibberish(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 4) return false;

  const words = clean.split(/\s+/).filter(Boolean);
  let suspiciousCount = 0;
  let totalWords = 0;

  for (const rawW of words) {
    const w = rawW.replace(/^[()[\]{}"'.,:;\\/+=&_-]+|[()[\]{}"'.,:;\\/+=&_-]+$/g, '');
    if (!w) continue;
    totalWords++;

    // Bỏ qua nếu từ là Acronym hợp lệ
    if (isMarketingAcronym(w)) continue;

    // Nếu từ >= 4 ký tự dính liền nhưng không chứa bất kỳ nguyên âm nào (ví dụ: bcdfgh, asdfgh, zxcvbn)
    if (w.length >= 4 && !VOWEL_REGEX.test(w) && /^[\p{L}]+$/u.test(w)) {
      suspiciousCount++;
    }
  }

  // Nếu chuỗi chỉ có 1 từ mà từ đó không có nguyên âm -> Rác gõ bừa
  if (totalWords === 1 && suspiciousCount >= 1) return true;

  // Nếu câu có nhiều từ, chỉ coi là Gibberish khi tỷ lệ từ nghi vấn rác >= 50%
  if (totalWords > 1 && suspiciousCount / totalWords >= 0.5) return true;

  // Tỷ lệ ký tự phân biệt quá thấp với chuỗi dài >= 6 ký tự (ví dụ: acccccc có 7 ký tự nhưng chỉ 2 ký tự duy nhất)
  const lettersOnly = clean.toLowerCase().replace(/[^\p{L}]/gu, '');
  if (lettersOnly.length >= 6) {
    const uniqueChars = new Set(lettersOnly).size;
    if (uniqueChars / lettersOnly.length < 0.35) {
      const allAcronyms = words.every((w) => isMarketingAcronym(w));
      if (!allAcronyms) return true;
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

export const industryFieldSchema = z
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
  });

export const productNameFieldSchema = z
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
  });

export const budgetLevelFieldSchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Vui lòng chọn mức ngân sách (Thấp / Trung bình / Cao)' })
});

export const objectiveFieldSchema = z
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
  });

export const additionalNotesFieldSchema = z
  .string()
  .optional()
  .transform((val) => (val ? sanitizeString(val) : ''))
  .refine((val) => val.length <= 600, {
    message: 'Ghi chú bổ sung tối đa 600 ký tự'
  })
  .refine((val) => !val || !hasRepeatedChars(val), {
    message: 'Ghi chú bổ sung chứa ký tự lặp bất thường, bạn vui lòng kiểm tra lại nhé'
  })
  .refine((val) => !val || !isGibberish(val), {
    message: 'Ghi chú bổ sung có vẻ chưa rõ nghĩa, bạn thử mô tả cụ thể hơn nhé'
  });

// Schema cho Hồ sơ thương hiệu nhỏ (Mục 5)
export const brandProfileSchema = z
  .object({
    brandToneAdjectives: z.array(z.string().min(1)).optional(),
    permittedClaims: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
    wordsToAvoid: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined))
  })
  .optional();

// Schema cho từng bước của Wizard 3 bước (P1)
export const step1Schema = z.object({
  industry: industryFieldSchema,
  productName: productNameFieldSchema
});

export const step2Schema = z.object({
  objective: objectiveFieldSchema,
  targetAudiencePrompt: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  keyDifferentiator: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined))
});

export const step3Schema = z.object({
  budgetLevel: budgetLevelFieldSchema,
  additionalNotes: additionalNotesFieldSchema,
  sellingArea: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  productPrice: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  existingChannels: z.array(z.string()).optional(),
  availableResources: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  specificBudgetVnd: z.number().optional(),
  brandProfile: brandProfileSchema
});

export const campaignInputSchema = z.object({
  industry: industryFieldSchema,
  productName: productNameFieldSchema,
  budgetLevel: budgetLevelFieldSchema,
  objective: objectiveFieldSchema,
  additionalNotes: additionalNotesFieldSchema,
  targetAudiencePrompt: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  sellingArea: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  productPrice: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  keyDifferentiator: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  existingChannels: z.array(z.string()).optional(),
  availableResources: z.string().optional().transform((v) => (v ? sanitizeString(v) : undefined)),
  specificBudgetVnd: z.number().optional(),
  brandProfile: brandProfileSchema
});

export const weeklyPlanSchema = z.object({
  week: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  title: z.string().min(2, 'Tiêu đề tuần tối thiểu 2 ký tự'),
  activities: z
    .array(z.string().min(2))
    .min(1, 'Mỗi tuần phải có ít nhất 1 hoạt động')
    .max(5, 'Mỗi tuần tối đa 5 hoạt động')
});

// Schema cho 5 thành phần giải thích logic marketing (Mục 5)
export const marketingLogicSchema = z.object({
  customerBarrierOrNeed: z.string().min(5, 'Nhu cầu hoặc rào cản tối thiểu 5 ký tự'),
  productBenefitAndProof: z.string().min(5, 'Lợi ích và bằng chứng tối thiểu 5 ký tự'),
  campaignMechanism: z.string().min(5, 'Cơ chế chiến dịch tối thiểu 5 ký tự'),
  desiredAction: z.string().min(5, 'Hành động mong muốn tối thiểu 5 ký tự'),
  successRequirements: z.string().min(5, 'Điều kiện thành công tối thiểu 5 ký tự')
});

export const rawAIIdeaSchema = z.object({
  title: z.string().min(2),
  tagline: z.string().min(2),
  channels: z.array(z.string().min(2)).min(1).max(6),
  mainContent: z.string().min(10),
  estimatedBudget: z.string().min(2),
  targetAudience: z.string().min(2),
  timeline: z.array(weeklyPlanSchema).length(4, 'Mỗi ý tưởng phải có đúng 4 tuần'),
  marketingLogic: marketingLogicSchema.optional()
});

export const rawAIResponseSchema = z.object({
  ideas: z.array(rawAIIdeaSchema).length(5, 'Phải có đúng 5 ý tưởng chiến dịch')
});

export const refineIdeaRequestSchema = z.object({
  campaignId: z.string().min(1, 'Mã chiến dịch không được để trống'),
  currentIdea: z.object({
    id: z.string(),
    title: z.string().min(2),
    tagline: z.string().min(2),
    channels: z.array(z.string()).min(1),
    mainContent: z.string().min(10),
    estimatedBudget: z.string().min(2),
    targetAudience: z.string().min(2),
    timeline: z.array(weeklyPlanSchema).length(4),
    version: z.number().optional(),
    refinementHistory: z.array(z.any()).optional()
  }),
  context: z.object({
    industry: z.string().min(1),
    productName: z.string().min(1),
    budgetLevel: z.enum(['low', 'medium', 'high']),
    objective: z.string().min(1)
  }),
  instruction: z
    .string()
    .transform(sanitizeString)
    .refine((val) => val.trim().length >= 3 && val.length <= 300, {
      message: 'Yêu cầu tinh chỉnh cần từ 3–300 ký tự'
    })
    .refine((val) => !hasRepeatedChars(val), {
      message: 'Yêu cầu tinh chỉnh dường như chứa ký tự lặp bất thường'
    })
    .refine((val) => !isGibberish(val), {
      message: 'Yêu cầu tinh chỉnh có vẻ chưa rõ nghĩa'
    })
});

export const refineAIOutputSchema = z.object({
  refinedIdea: rawAIIdeaSchema,
  changeReason: z.string().min(5, 'Lý do thay đổi tối thiểu 5 ký tự'),
  changesSummary: z.array(z.string().min(2)).min(1, 'Cần ít nhất 1 tóm tắt thay đổi')
});

export const compareStrategiesRequestSchema = z.object({
  entries: z
    .array(
      z.object({
        id: z.string(),
        context: z.object({
          industry: z.string(),
          productName: z.string(),
          budgetLevel: z.enum(['low', 'medium', 'high']),
          objective: z.string()
        }),
        idea: rawAIIdeaSchema.extend({
          id: z.string(),
          version: z.number().optional()
        })
      })
    )
    .min(2, 'Cần ít nhất 2 chiến dịch để so sánh')
    .max(3, 'Chỉ so sánh tối đa 3 chiến dịch')
});

export const compareStrategiesOutputSchema = z.object({
  headToHeadAnalysis: z.array(
    z.object({
      campaignId: z.string(),
      title: z.string(),
      version: z.number(),
      keyAdvantage: z.string().min(5),
      biggestTradeOff: z.string().min(5),
      bestSuitedFor: z.string().min(5)
    })
  ),
  recommendedWinner: z.object({
    campaignId: z.string(),
    title: z.string(),
    version: z.number(),
    verdictReason: z.string().min(10)
  }),
  hybridStrategyTip: z.string().min(10)
});

export type ValidatedCampaignInput = z.infer<typeof campaignInputSchema>;
export type ValidatedRefineIdeaRequest = z.infer<typeof refineIdeaRequestSchema>;
export type ValidatedRefineAIOutput = z.infer<typeof refineAIOutputSchema>;
export type ValidatedCompareStrategiesRequest = z.infer<typeof compareStrategiesRequestSchema>;
export type ValidatedCompareStrategiesOutput = z.infer<typeof compareStrategiesOutputSchema>;

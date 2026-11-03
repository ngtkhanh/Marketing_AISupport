import { CampaignInput, MarketingIdea } from '@/types/marketing';
import { BUDGET_CONFIGS } from '../config/budget';

export interface ValidationOutputResult {
  valid: boolean;
  errors: string[];
}

/**
 * Lớp 3: Kiểm tra logic nghiệp vụ marketing sau khi Zod schema đã parse thành công
 * - Đúng 5 ý tưởng khác nhau
 * - Mỗi ý tưởng đúng 4 tuần tuần tự 1 -> 4
 * - Không chứa các kênh bị cấm của mức ngân sách tương ứng
 */
export function validateMarketingOutput(
  ideas: MarketingIdea[],
  input: CampaignInput
): ValidationOutputResult {
  const errors: string[] = [];
  const config = BUDGET_CONFIGS[input.budgetLevel];

  if (!Array.isArray(ideas) || ideas.length !== 5) {
    errors.push(`Số lượng ý tưởng không đúng: nhận được ${ideas?.length || 0}, yêu cầu đúng 5 ý tưởng.`);
    return { valid: false, errors };
  }

  const titlesSet = new Set<string>();

  ideas.forEach((idea, index) => {
    const idx = index + 1;

    // 1. Kiểm tra tiêu đề trùng lặp
    const normalizedTitle = idea.title.trim().toLowerCase();
    if (titlesSet.has(normalizedTitle)) {
      errors.push(`Ý tưởng #${idx} có tiêu đề bị trùng lặp: "${idea.title}".`);
    } else {
      titlesSet.add(normalizedTitle);
    }

    // 2. Kiểm tra Timeline 4 tuần
    if (!Array.isArray(idea.timeline) || idea.timeline.length !== 4) {
      errors.push(`Ý tưởng #${idx} ("${idea.title}") không đủ 4 tuần timeline.`);
    } else {
      idea.timeline.forEach((w, wIdx) => {
        const expectedWeek = (wIdx + 1) as 1 | 2 | 3 | 4;
        if (w.week !== expectedWeek) {
          errors.push(`Ý tưởng #${idx} có thứ tự tuần không đúng: mong đợi Tuần ${expectedWeek}, nhận Tuần ${w.week}.`);
        }
        if (!w.activities || w.activities.length === 0) {
          errors.push(`Ý tưởng #${idx} Tuần ${w.week} không có hoạt động nào.`);
        }
      });
    }

    // 3. Kiểm tra kênh bị cấm theo ngân sách (Forbidden Channels check)
    if (config.forbiddenChannels.length > 0) {
      const allText = `${idea.channels.join(' ')} ${idea.mainContent} ${idea.title}`.toLowerCase();
      for (const forbidden of config.forbiddenChannels) {
        if (allText.includes(forbidden.toLowerCase())) {
          errors.push(
            `Ý tưởng #${idx} chứa kênh/hoạt động "${forbidden}" bị cấm đối với mức ngân sách ${config.label}.`
          );
          break;
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Kiểm tra logic nghiệp vụ cho 1 ý tưởng đơn lẻ (dùng trong tính năng Tinh chỉnh AI)
 */
export function validateSingleIdeaMarketingOutput(
  idea: MarketingIdea,
  budgetLevel: 'low' | 'medium' | 'high'
): ValidationOutputResult {
  const errors: string[] = [];
  const config = BUDGET_CONFIGS[budgetLevel];

  // 1. Kiểm tra Timeline 4 tuần
  if (!Array.isArray(idea.timeline) || idea.timeline.length !== 4) {
    errors.push(`Ý tưởng "${idea.title}" không đủ 4 tuần timeline.`);
  } else {
    idea.timeline.forEach((w, wIdx) => {
      const expectedWeek = (wIdx + 1) as 1 | 2 | 3 | 4;
      if (w.week !== expectedWeek) {
        errors.push(`Có thứ tự tuần không đúng: mong đợi Tuần ${expectedWeek}, nhận Tuần ${w.week}.`);
      }
      if (!w.activities || w.activities.length === 0) {
        errors.push(`Tuần ${w.week} không có hoạt động nào.`);
      }
    });
  }

  // 2. Kiểm tra kênh bị cấm theo ngân sách
  if (config.forbiddenChannels.length > 0) {
    const allText = `${idea.channels.join(' ')} ${idea.mainContent} ${idea.title}`.toLowerCase();
    for (const forbidden of config.forbiddenChannels) {
      if (allText.includes(forbidden.toLowerCase())) {
        errors.push(
          `Ý tưởng chứa kênh/hoạt động "${forbidden}" bị cấm đối với mức ngân sách ${config.label}.`
        );
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}


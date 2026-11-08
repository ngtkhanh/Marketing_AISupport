import type { CampaignInput, MarketingIdea, BrandProfile } from '@/types/marketing';
import { BUDGET_CONFIGS } from '../config/budget';

export interface ValidationOutputResult {
  valid: boolean;
  errors: string[];
}

/**
 * Bảng từ đồng nghĩa và hoạt động liên kết thực tế của các kênh marketing
 * Giúp nhận diện chính xác khi AI dùng các cách diễn đạt nghiệp vụ khác nhau
 */
const CHANNEL_SEMANTIC_ALIASES: Record<string, string[]> = {
  'referral': ['giới thiệu', 'mời bạn', 'chia sẻ', 'bạn bè', 'tri ân', 'mã mời', 'truyền miệng', 'wom', 'tích điểm', 'thưởng đôi'],
  'truyền miệng': ['giới thiệu', 'mời bạn', 'chia sẻ', 'bạn bè', 'tri ân', 'mã mời', 'referral', 'khách quen', 'tích điểm', 'truyền tai'],
  'koc': ['review', 'reviewer', 'booking', 'gửi mẫu', 'trải nghiệm', 'kol', 'influencer', 'bài review', 'video review', 'đánh giá', 'creator'],
  'kol': ['koc', 'influencer', 'booking', 'đại sứ', 'gửi mẫu', 'review', 'người nổi tiếng', 'creator'],
  'influencer': ['koc', 'kol', 'booking', 'review', 'người nổi tiếng', 'sáng tạo nội dung', 'creator', 'gửi mẫu'],
  'cross': ['đối tác', 'hợp tác', 'chéo', 'liên minh', 'voucher', 'đổi quà', 'phi cạnh tranh', 'liên kết', 'barter', 'co-branding', 'chia sẻ khách', 'quán bên', 'tiệm', 'cửa hàng bạn'],
  'promo': ['ưu đãi', 'khuyến mại', 'voucher', 'giảm giá', 'quà tặng', 'combo', 'đồng giá', 'tặng kèm', 'chiết khấu', 'quà', 'chương trình', 'đối tác', 'hợp tác', 'chéo'],
  'cross-promo': ['đối tác', 'hợp tác', 'chéo', 'liên minh', 'voucher', 'đổi quà', 'phi cạnh tranh', 'liên kết', 'barter', 'co-branding', 'chia sẻ khách', 'posm'],
  'hợp tác': ['đối tác', 'liên kết', 'chéo', 'liên minh', 'ký kết', 'thỏa thuận', 'đàm phán', 'chia sẻ', 'barter', 'đồng thương hiệu', 'quán', 'cửa hàng'],
  'chéo': ['đối tác', 'liên kết', 'hợp tác', 'liên minh', 'voucher', 'đổi quà', 'chia sẻ khách', 'quán lân cận', 'cửa hàng bạn'],
  'đối tác': ['hợp tác', 'liên kết', 'chéo', 'liên minh', 'ký kết', 'thỏa thuận', 'đàm phán', 'quán', 'cửa hàng', 'voucher'],
  'posm': ['standee', 'tờ rơi', 'poster', 'voucher', 'quầy', 'kệ', 'cửa hàng', 'điểm bán', 'bàn', 'menu', 'in ấn', 'treo biển', 'quầy thu ngân'],
  'standee': ['posm', 'điểm bán', 'quầy', 'cửa hàng', 'đặt bảng', 'in ấn', 'treo biển', 'tờ rơi'],
  'ugc': ['thử thách', 'challenge', 'quay clip', 'chụp ảnh', 'hashtag', 'chia sẻ', 'bài dự thi', 'minigame', 'người dùng', 'video', 'bình chọn', 'lan tỏa', 'khách hàng'],
  'thử thách': ['ugc', 'challenge', 'hashtag', 'tham gia', 'bài thi', 'quay', 'chụp', 'minigame', 'clip', 'video'],
  'challenge': ['ugc', 'thử thách', 'hashtag', 'tham gia', 'bài thi', 'quay', 'chụp', 'minigame', 'clip', 'video'],
  'livestream': ['live', 'phát trực tiếp', 'chốt đơn', 'live shopping', 'phiên live', 'lên sóng', 'giỏ hàng', 'stream'],
  'live': ['livestream', 'phát trực tiếp', 'chốt đơn', 'phiên live', 'giỏ hàng', 'lên sóng'],
  'community': ['hội nhóm', 'group', 'thảo luận', 'seeding', 'bình luận', 'cộng đồng', 'fan cứng', 'admin'],
  'cộng đồng': ['group', 'hội nhóm', 'fanpage', 'seeding', 'thảo luận', 'chia sẻ', 'tương tác', 'bình luận'],
  'seeding': ['bình luận', 'thảo luận', 'hội nhóm', 'group', 'diễn đàn', 'bài đăng', 'chia sẻ'],
  'o2o': ['quét mã', 'qr', 'đổi quà', 'tại quán', 'cửa hàng', 'trực tiếp', 'offline', 'voucher', 'tại chỗ', 'ghé tiệm'],
  'pr': ['báo chí', 'bài báo', 'thông cáo', 'phỏng vấn', 'báo điện tử', 'tin tức', 'truyền thông', 'báo mạng', 'bài viết'],
  'ads': ['quảng cáo', 'chạy ads', 'chiến dịch', 'giá thầu', 'cpm', 'cpc', 'pixel', 'tối ưu ads', 'target', 'retargeting', 'boost', 'trả phí'],
  'quảng cáo': ['ads', 'chạy', 'chiến dịch', 'giá thầu', 'pixel', 'tối ưu', 'target', 'trả phí'],
  'zalo': ['zalo oa', 'mini app', 'zns', 'tin nhắn', 'nhắn tin', 'chăm sóc khách', 'quét mã', 'qr'],
  'tiktok': ['video ngắn', 'reels', 'clip', 'spark ads', 'trend', 'livestream', 'tiktok shop', 'quay dựng'],
  'facebook': ['fanpage', 'group', 'hội nhóm', 'bài đăng', 'seeding', 'cộng đồng', 'reels', 'post', 'livestream'],
  'meta': ['facebook', 'instagram', 'fanpage', 'reels', 'ads', 'quảng cáo'],
  'shopee': ['sàn tmđt', 'gian hàng', 'livestream', 'voucher sàn', 'shopee live', 'e-commerce', 'đặt mua'],
  'email': ['newsletter', 'hộp thư', 'gửi mail', 'automation', 'thư điện tử'],
  'seo': ['bài viết', 'từ khóa', 'google', 'website', 'blog', 'nội dung chuẩn seo'],
  'google': ['search', 'tìm kiếm', 'ads', 'từ khóa', 'seo', 'map'],
  'youtube': ['video', 'shorts', 'clip', 'kênh video'],
  'social': ['mạng xã hội', 'fanpage', 'facebook', 'instagram', 'tiktok', 'bài đăng', 'post', 'truyền thông', 'nội dung', 'kênh', 'social media', 'chia sẻ'],
  'content': ['nội dung', 'bài viết', 'video', 'hình ảnh', 'post', 'truyền thông', 'ấn phẩm', 'bài đăng', 'infographic', 'quotes', 'kịch bản', 'sáng tạo'],
  'offline': ['cửa hàng', 'điểm bán', 'posm', 'tờ rơi', 'standee', 'trực tiếp', 'check-in', 'sự kiện', 'quầy hàng']
};

/**
 * Kiểm tra tính nhất quán giữa danh sách kênh và hoạt động trong timeline
 */
function checkChannelTimelineConsistency(idea: MarketingIdea): string[] {
  const issues: string[] = [];
  
  // Bao gồm cả tiêu đề tuần (week.title) và hoạt động (activities) của cả 4 tuần
  const timelineText = (idea.timeline || [])
    .flatMap((w) => [w.title || '', ...(w.activities || [])])
    .join(' ')
    .toLowerCase();
  
  const mainContentText = (idea.mainContent || '').toLowerCase();
  const combinedContextText = `${timelineText} ${mainContentText}`;

  const stopWords = new Set(['kênh', 'qua', 'và', 'trên', 'tại', 'bằng', 'cho', 'của', 'marketing', 'chiến dịch', 'các', 'những', 'với']);

  (idea.channels || []).forEach((channel) => {
    // 1. Làm sạch ký tự đặc biệt (ngoặc đơn, ngoặc vuông, gạch chéo...)
    const cleanChannel = channel
      .toLowerCase()
      .replace(/[()[\]{}"'.,:;\\/+=&_-]/g, ' ')
      .trim();

    // 2. Tách từ khóa trực tiếp
    const words = cleanChannel
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && !stopWords.has(w));

    // 3. Xây dựng tập từ khóa mở rộng gồm từ trực tiếp + từ đồng nghĩa nghiệp vụ
    const searchTargets = new Set<string>();
    words.forEach((w) => searchTargets.add(w));

    // Kiểm tra trực tiếp cả cụm hoặc từng từ trong bảng từ đồng nghĩa
    for (const [key, aliases] of Object.entries(CHANNEL_SEMANTIC_ALIASES)) {
      if (cleanChannel.includes(key)) {
        aliases.forEach((a) => searchTargets.add(a));
      }
    }

    // 4. Kiểm tra có ít nhất 1 từ khóa hoặc từ đồng nghĩa xuất hiện trong hoạt động timeline
    // Hoặc xuất hiện trong ngữ cảnh kết hợp (timeline + mainContent)
    const isCoveredInTimeline = searchTargets.size === 0 || Array.from(searchTargets).some((target) => timelineText.includes(target));
    const isCoveredInContext = Array.from(searchTargets).some((target) => combinedContextText.includes(target));

    if (!isCoveredInTimeline && !isCoveredInContext) {
      issues.push(
        `Kênh "${channel}" được đề xuất nhưng không có hoạt động triển khai nào tương ứng trong 4 tuần timeline.`
      );
    }
  });

  return issues;
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

    // 4. Kiểm tra tính nhất quán giữa kênh và hoạt động trong timeline
    const consistencyErrors = checkChannelTimelineConsistency(idea);
    consistencyErrors.forEach((err) => {
      errors.push(`Ý tưởng #${idx}: ${err}`);
    });

    // 5. Kiểm tra vi phạm từ cấm theo Hồ sơ thương hiệu (Brand Profile Words to Avoid - Mục 5)
    if (input.brandProfile?.wordsToAvoid) {
      const forbiddenWords = input.brandProfile.wordsToAvoid
        .split(/[,;\n]+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length >= 2);

      const ideaContent = [
        idea.title,
        idea.tagline,
        idea.mainContent,
        idea.marketingLogic?.customerBarrierOrNeed || '',
        idea.marketingLogic?.productBenefitAndProof || '',
        idea.marketingLogic?.campaignMechanism || '',
        idea.marketingLogic?.desiredAction || ''
      ].join(' ').toLowerCase();

      for (const word of forbiddenWords) {
        if (ideaContent.includes(word)) {
          errors.push(
            `Ý tưởng #${idx} ("${idea.title}") chứa từ ngữ bị cấm "${word}" theo yêu cầu hồ sơ thương hiệu.`
          );
          break;
        }
      }
    }

    // 6. Kiểm tra cấu trúc marketingLogic 5 thành phần (nếu có)
    if (idea.marketingLogic) {
      const ml = idea.marketingLogic;
      if (
        !ml.customerBarrierOrNeed || ml.customerBarrierOrNeed.length < 5 ||
        !ml.productBenefitAndProof || ml.productBenefitAndProof.length < 5 ||
        !ml.campaignMechanism || ml.campaignMechanism.length < 5 ||
        !ml.desiredAction || ml.desiredAction.length < 5 ||
        !ml.successRequirements || ml.successRequirements.length < 5
      ) {
        errors.push(`Ý tưởng #${idx} ("${idea.title}") có cấu trúc giải thích logic marketing chưa hoàn chỉnh.`);
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
  budgetLevel: 'low' | 'medium' | 'high',
  brandProfile?: BrandProfile
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

  // 3. Kiểm tra tính nhất quán giữa kênh và hoạt động trong timeline
  const consistencyErrors = checkChannelTimelineConsistency(idea);
  consistencyErrors.forEach((err) => {
    errors.push(err);
  });

  // 4. Kiểm tra vi phạm từ cấm theo Hồ sơ thương hiệu
  if (brandProfile?.wordsToAvoid) {
    const forbiddenWords = brandProfile.wordsToAvoid
      .split(/[,;\n]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length >= 2);

    const ideaContent = [
      idea.title,
      idea.tagline,
      idea.mainContent,
      idea.marketingLogic?.customerBarrierOrNeed || '',
      idea.marketingLogic?.productBenefitAndProof || '',
      idea.marketingLogic?.campaignMechanism || '',
      idea.marketingLogic?.desiredAction || ''
    ].join(' ').toLowerCase();

    for (const word of forbiddenWords) {
      if (ideaContent.includes(word)) {
        errors.push(
          `Ý tưởng "${idea.title}" chứa từ ngữ bị cấm "${word}" theo yêu cầu hồ sơ thương hiệu.`
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


import type {
  BudgetItem,
  BudgetItemCategory,
  CampaignProposal,
  ContingencyTrigger,
  ExecutionStage,
  ExecutionTask,
  ExecutiveDecision,
  KPIScenario,
  MarketingIdea,
  CampaignInput,
  BudgetLevel
} from '@/types/marketing';
import {
  calculateAllocationSummary,
  formatVND,
  parseEstimatedBudget,
  recalculateItemPercentages
} from './proposal-calculations';
import { detectObjectiveType, calculateFunnelKPIs } from './kpi-calculator';

/**
 * Phân tích vai trò thực hiện dựa trên nội dung hoạt động
 */
function inferRoleFromActivity(activity: string): string {
  const text = activity.toLowerCase();
  if (
    text.includes('video') ||
    text.includes('ảnh') ||
    text.includes('thiết kế') ||
    text.includes('nội dung') ||
    text.includes('kịch bản') ||
    text.includes('clip') ||
    text.includes('bài đăng') ||
    text.includes('content')
  ) {
    return 'Content/Thiết kế';
  }

  if (
    text.includes('ads') ||
    text.includes('quảng cáo') ||
    text.includes('cài đặt') ||
    text.includes('tối ưu') ||
    text.includes('giá thầu') ||
    text.includes('pixel') ||
    text.includes('chiến dịch')
  ) {
    return 'Vận hành/Ads';
  }

  if (
    text.includes('tư vấn') ||
    text.includes('chăm sóc') ||
    text.includes('inbox') ||
    text.includes('chốt đơn') ||
    text.includes('cskh') ||
    text.includes('voucher') ||
    text.includes('quà tặng') ||
    text.includes('minigame') ||
    text.includes('livestream') ||
    text.includes('đơn hàng')
  ) {
    return 'CSKH/Sales';
  }

  return 'Lead/Điều phối';
}

/**
 * Tạo sản phẩm bàn giao (Deliverable) tương ứng với hoạt động
 */
function inferDeliverable(activity: string, role: string): string {
  if (role === 'Content/Thiết kế') {
    return `Bộ tài nguyên media đã duyệt: ${activity.slice(0, 45)}...`;
  }
  if (role === 'Vận hành/Ads') {
    return `Báo cáo chỉ số vận hành & thiết lập: ${activity.slice(0, 45)}...`;
  }
  if (role === 'CSKH/Sales') {
    return `Danh sách chuyển đổi & đơn hàng: ${activity.slice(0, 45)}...`;
  }
  return `Biên bản nghiệm thu & mốc tiến độ: ${activity.slice(0, 45)}...`;
}

export interface IdeaCharacteristics {
  hasPaidAds: boolean;
  hasKOC: boolean;
  hasPromotions: boolean;
  hasContentMedia: boolean;
  hasCommunityOrganic: boolean;
  matchedChannels: string[];
}

/**
 * Phát hiện đặc tính và kênh triển khai thực tế của ý tưởng marketing
 */
export function detectIdeaCharacteristics(idea: MarketingIdea): IdeaCharacteristics {
  const channelsText = (idea.channels || []).join(' ').toLowerCase();
  const timelineText = (idea.timeline || [])
    .flatMap((w) => w.activities || [])
    .join(' ')
    .toLowerCase();
  const allText = `${channelsText} ${timelineText} ${(idea.mainContent || '').toLowerCase()} ${(idea.title || '').toLowerCase()}`;

  const hasPaidAds = /ads|quảng cáo|facebook ads|tiktok ads|google ads|meta ads|chạy ads|trả phí|paid/i.test(allText);
  const hasKOC = /koc|kol|influencer|người ảnh hưởng|booking|tặng quà trải nghiệm/i.test(allText);
  const hasPromotions = /voucher|khuyến mại|ưu đãi|quà tặng|minigame|giveaway|giảm giá|chiết khấu|mã giảm/i.test(allText);
  const hasContentMedia = /video|ảnh|chụp|quay|lookbook|tvc|thiết kế|bài đăng|content|media|ấn phẩm|ebook/i.test(allText);
  const hasCommunityOrganic = /cộng đồng|group|hội nhóm|seeding|organic|tự nhiên|email|newsletter/i.test(allText);

  return {
    hasPaidAds,
    hasKOC,
    hasPromotions,
    hasContentMedia,
    hasCommunityOrganic,
    matchedChannels: idea.channels || []
  };
}

/**
 * Sinh danh sách phân bổ ngân sách động bám sát kênh và hoạt động thực tế của ý tưởng
 */
export function generateDynamicBudgetItems(
  idea: MarketingIdea,
  totalBudget: number,
  budgetLevel: BudgetLevel
): BudgetItem[] {
  const chars = detectIdeaCharacteristics(idea);

  interface RawItem {
    category: BudgetItemCategory;
    label: string;
    weight: number;
    note: string;
    isContingency: boolean;
    explanation: string;
  }

  const rawItems: RawItem[] = [];

  // 1. Quảng cáo trả phí (chỉ có khi ý tưởng thực sự đề cập kênh Ads)
  if (chars.hasPaidAds) {
    const isHigh = budgetLevel === 'high';
    const isMedium = budgetLevel === 'medium';
    rawItems.push({
      category: 'paid_ads',
      label: isHigh
        ? 'Chiến dịch Paid Ads tổng lực & Retargeting đa nền tảng'
        : isMedium
        ? 'Quảng cáo đa kênh (Meta Ads, TikTok Ads & Search)'
        : 'Quảng cáo trực tiếp (TikTok & Meta Ads tối ưu click/lead)',
      weight: isHigh ? 40 : isMedium ? 45 : 40,
      note: 'Tập trung phân phối vào tệp đối tượng mục tiêu đã xác định',
      isContingency: false,
      explanation: 'Phân bổ theo kênh quảng cáo trả phí được đề xuất trong ý tưởng'
    });
  }

  // 2. Hợp tác KOC / KOL (chỉ có khi ý tưởng thực sự đề cập KOC/KOL)
  if (chars.hasKOC) {
    const isHigh = budgetLevel === 'high';
    rawItems.push({
      category: 'koc_partnership',
      label: isHigh
        ? 'Hợp tác KOL lớn & Booking báo chí trực tuyến bảo chứng'
        : 'Hợp tác Micro/Nano KOC & Gửi sản phẩm trải nghiệm',
      weight: isHigh ? 30 : 25,
      note: 'Booking và chi phí gửi hàng mẫu nhận review chân thực',
      isContingency: false,
      explanation: 'Phân bổ theo hoạt động hợp tác KOC/KOL xuất hiện trong ý tưởng'
    });
  }

  // 3. Khuyến mại / Voucher / Minigame
  if (chars.hasPromotions) {
    rawItems.push({
      category: 'promotions_vouchers',
      label: 'Quà tặng khuyến mại, Voucher ưu đãi & Minigame',
      weight: chars.hasPaidAds && chars.hasKOC ? 15 : 25,
      note: 'Ngân sách giải thưởng minigame và chiết khấu kích thích chuyển đổi',
      isContingency: false,
      explanation: 'Phân bổ theo hoạt động khuyến mại / quà tặng trong nội dung chiến dịch'
    });
  }

  // 4. Sản xuất nội dung & Media
  const contentWeight = (!chars.hasPaidAds && !chars.hasKOC) ? 40 : 15;
  rawItems.push({
    category: 'content_production',
    label: chars.hasCommunityOrganic
      ? 'Sản xuất nội dung chuyên sâu, Ebook & Ấn phẩm cộng đồng'
      : 'Sản xuất nội dung, chụp ảnh sản phẩm & Thiết kế media',
    weight: contentWeight,
    note: 'Quay dựng video ngắn, chụp ảnh sản phẩm và viết kịch bản nội dung',
    isContingency: false,
    explanation: 'Chi phí sản xuất tài nguyên media và thông điệp truyền thông'
  });

  // 5. Nếu không có cả Ads và KOC, bổ sung hạng mục vận hành cộng đồng / công cụ
  if (!chars.hasPaidAds && !chars.hasKOC) {
    rawItems.push({
      category: 'other',
      label: 'Vận hành cộng đồng, công cụ điều phối & Hỗ trợ chuyển đổi',
      weight: chars.hasPromotions ? 20 : 35,
      note: 'Phí bản quyền công cụ gửi tin, quản lý hội nhóm và chăm sóc thành viên',
      isContingency: false,
      explanation: 'Hỗ trợ các kênh organic/cộng đồng không phát sinh chi phí quảng cáo'
    });
  }

  // 6. Quỹ dự phòng rủi ro (Luôn có để bảo toàn)
  rawItems.push({
    category: 'contingency_fund',
    label: 'Quỹ dự phòng rủi ro & Kế hoạch B',
    weight: budgetLevel === 'low' ? 10 : 5,
    note: 'Dự phòng xử lý biến động thị trường hoặc kích hoạt phương án B',
    isContingency: true,
    explanation: 'Đảm bảo khả năng ứng phó khi gặp sự cố ngoài dự kiến'
  });

  // Chuẩn hóa tỷ lệ phần trăm theo tổng trọng số
  const totalWeight = rawItems.reduce((sum, item) => sum + item.weight, 0);
  let runningPercent = 0;
  let runningSum = 0;

  const items: BudgetItem[] = rawItems.map((raw, idx) => {
    const isLast = idx === rawItems.length - 1;
    let percentage: number;
    let amount: number;

    if (isLast) {
      percentage = Math.round((100 - runningPercent) * 10) / 10;
      amount = Math.max(0, totalBudget - runningSum);
    } else {
      percentage = Math.round((raw.weight / totalWeight) * 1000) / 10;
      runningPercent += percentage;
      amount = Math.round((percentage / 100) * totalBudget);
      runningSum += amount;
    }

    return {
      id: `budget_item_${idx + 1}`,
      category: raw.category,
      label: raw.label,
      percentage,
      amount,
      note: raw.note,
      isContingency: raw.isContingency,
      provenance: 'calculated',
      explanation: raw.explanation
    };
  });

  return recalculateItemPercentages(items, totalBudget);
}

/**
 * Sinh danh sách 5 nhóm hạng mục ngân sách chuẩn Playbook (tương thích ngược)
 */
function generateBudgetItems(totalBudget: number, budgetLevel: BudgetLevel): BudgetItem[] {
  interface TemplateCategory {
    category: BudgetItemCategory;
    label: string;
    percentage: number;
    note: string;
    isContingency: boolean;
  }

  let distributionTemplates: TemplateCategory[];

  if (budgetLevel === 'low') {
    distributionTemplates = [
      {
        category: 'paid_ads',
        label: 'Quảng cáo trực tiếp (TikTok & Meta Ads tối ưu click)',
        percentage: 40,
        note: 'Tập trung kéo lượng truy cập mục tiêu vào kênh chuyển đổi và minigame',
        isContingency: false
      },
      {
        category: 'koc_partnership',
        label: 'Hợp tác Micro-KOC & Gửi sản phẩm trải nghiệm',
        percentage: 20,
        note: 'Tặng quà mẫu cho 3-5 Micro KOC để đổi review chân thực trên TikTok/Reels',
        isContingency: false
      },
      {
        category: 'promotions_vouchers',
        label: 'Quà tặng khuyến mại & Voucher kích cầu',
        percentage: 20,
        note: 'Ngân sách tài trợ giải thưởng minigame và voucher giảm giá chốt đơn',
        isContingency: false
      },
      {
        category: 'content_production',
        label: 'Sản xuất nội dung & Thiết kế bộ ấn phẩm',
        percentage: 10,
        note: 'Chụp ảnh sản phẩm, quay dựng 5-8 video ngắn bắt hook',
        isContingency: false
      },
      {
        category: 'contingency_fund',
        label: 'Quỹ dự phòng rủi ro & Kế hoạch B',
        percentage: 10,
        note: 'Dự phòng boost post khi bài viral hoặc thay thế KOC chậm tiến độ',
        isContingency: true
      }
    ];
  } else if (budgetLevel === 'medium') {
    distributionTemplates = [
      {
        category: 'paid_ads',
        label: 'Quảng cáo đa kênh (TikTok Ads, Meta Ads & Search)',
        percentage: 45,
        note: 'Phễu quảng cáo đa tầng: Nhận diện, tương tác và bám đuổi retargeting',
        isContingency: false
      },
      {
        category: 'koc_partnership',
        label: 'Hợp tác KOC/KOL tầm trung chuyên nghiệp',
        percentage: 25,
        note: 'Ký hợp đồng bài bản với 5-8 KOC có tệp người theo dõi tương đồng',
        isContingency: false
      },
      {
        category: 'promotions_vouchers',
        label: 'Chính sách ưu đãi độc quyền & Voucher',
        percentage: 15,
        note: 'Tài trợ chiết khấu mở bán và quà tặng kèm đơn hàng giá trị cao',
        isContingency: false
      },
      {
        category: 'content_production',
        label: 'Sản xuất Lookbook & Video chuyên nghiệp',
        percentage: 10,
        note: 'Ekip quay dựng chuyên sâu 10-15 video dạng problem-solution',
        isContingency: false
      },
      {
        category: 'contingency_fund',
        label: 'Quỹ dự phòng biến động giá thầu & Sự cố',
        percentage: 5,
        note: 'Bảo toàn hiệu quả khi CPM tăng đột biến hoặc cần mở rộng quy mô ads',
        isContingency: true
      }
    ];
  } else {
    // high budget
    distributionTemplates = [
      {
        category: 'paid_ads',
        label: 'Chiến dịch Paid Ads tổng lực & Retargeting IMC',
        percentage: 40,
        note: 'Chiếm lĩnh hiển thị đa nền tảng kết hợp tối ưu chuyển đổi quy mô lớn',
        isContingency: false
      },
      {
        category: 'koc_partnership',
        label: 'KOL lớn/Celeb & PR Báo chí trực tuyến uy tín',
        percentage: 30,
        note: 'Booking đại sứ chiến dịch, bài PR báo lớn bảo chứng thương hiệu',
        isContingency: false
      },
      {
        category: 'content_production',
        label: 'Sản xuất TVC Viral & POSM sự kiện',
        percentage: 15,
        note: 'Sản xuất phim ngắn thương hiệu chuẩn điện ảnh và ấn phẩm trưng bày',
        isContingency: false
      },
      {
        category: 'promotions_vouchers',
        label: 'Gói ưu đãi VIP & Chương trình thành viên',
        percentage: 10,
        note: 'Chương trình tri ân khách hàng thân thiết và quà tặng độc bản',
        isContingency: false
      },
      {
        category: 'contingency_fund',
        label: 'Quỹ kiểm soát rủi ro thị trường & Bổ trợ',
        percentage: 5,
        note: 'Xử lý khủng hoảng truyền thông hoặc cơ hội mở rộng đột xuất',
        isContingency: true
      }
    ];
  }

  // Tính số tiền từng hạng mục, hạng mục cuối cùng nhận phần bù để tổng đúng bằng totalBudget
  let runningSum = 0;
  const items: BudgetItem[] = distributionTemplates.map((tmpl, index) => {
    const isLast = index === distributionTemplates.length - 1;
    let amount: number;

    if (isLast) {
      amount = Math.max(0, totalBudget - runningSum);
    } else {
      amount = Math.round((tmpl.percentage / 100) * totalBudget);
      runningSum += amount;
    }

    return {
      id: `budget_item_${index + 1}`,
      category: tmpl.category,
      label: tmpl.label,
      percentage: tmpl.percentage,
      amount,
      note: tmpl.note,
      isContingency: tmpl.isContingency,
      provenance: 'calculated'
    };
  });

  return recalculateItemPercentages(items, totalBudget);
}

/**
 * Sinh 3 kịch bản KPI dựa trên tổng ngân sách, mục tiêu và kênh thực tế
 */
export function generateKpiScenarios(
  idea: MarketingIdea,
  totalBudget: number,
  objective: string
): KPIScenario[] {
  const chars = detectIdeaCharacteristics(idea);
  const objectiveType = detectObjectiveType(objective);
  return calculateFunnelKPIs({
    totalBudget,
    objectiveType,
    hasPaidAds: chars.hasPaidAds
  });
}

/**
 * Tạo danh sách checklist gồm Pre-launch (3-5 ngày trước giờ G) và 4 tuần từ Timeline ý tưởng
 */
function generateExecutionChecklist(idea: MarketingIdea): ExecutionTask[] {
  const chars = detectIdeaCharacteristics(idea);
  const checklist: ExecutionTask[] = [];

  // 1. Pre-launch Tasks (3-5 ngày trước giờ G)
  const preLaunchList: { task: string; role: string; dueDate: string; deliverable: string }[] = [];

  // Content media
  preLaunchList.push({
    task: chars.hasCommunityOrganic
      ? 'Soạn thảo tài liệu hướng dẫn/Ebook, thiết kế ảnh bìa và bài đăng thông báo mở màn'
      : 'Quay chụp và hoàn thiện bộ tài nguyên Media (video ngắn + ảnh sản phẩm)',
    role: 'Content/Thiết kế',
    dueDate: 'D-5',
    deliverable: 'Drive thư mục media đạt chuẩn nhận diện thương hiệu'
  });

  // Sales / Kho hàng / Voucher
  preLaunchList.push({
    task: chars.hasPromotions
      ? 'Thiết lập mã giảm giá, cấu hình kho hàng và kiểm thử luồng đặt mua trên POS'
      : 'Chuẩn bị sản phẩm mẫu, kiểm kê tồn kho và quy trình tiếp nhận đơn',
    role: 'CSKH/Sales',
    dueDate: 'D-3',
    deliverable: 'Quy trình tiếp nhận và kiểm thử thành công'
  });

  // Kịch bản tư vấn
  preLaunchList.push({
    task: 'Soạn kịch bản tư vấn FAQ, mẫu trả lời comment tự động và quy trình xử lý thắc mắc',
    role: 'CSKH/Sales',
    dueDate: 'D-2',
    deliverable: 'File kịch bản xử lý 10 tình huống thường gặp cho nhân sự trực page'
  });

  // Kênh triển khai
  if (chars.hasPaidAds) {
    preLaunchList.push({
      task: 'Nạp ngân sách vào tài khoản quảng cáo, cài đặt Pixel đo lường và tạo sẵn nhóm Ads',
      role: 'Vận hành/Ads',
      dueDate: 'D-1',
      deliverable: 'Chiến dịch quảng cáo đã qua bước xét duyệt (Status: Ready)'
    });
  } else if (chars.hasKOC) {
    preLaunchList.push({
      task: 'Liên hệ danh sách KOC đã chọn, gửi sản phẩm trải nghiệm và chốt timeline lên bài',
      role: 'Lead/Điều phối',
      dueDate: 'D-2',
      deliverable: 'Danh sách 3-5 KOC xác nhận nhận hàng và lịch lên bài'
    });
  } else {
    preLaunchList.push({
      task: 'Thiết lập nhóm cộng đồng, gắn link tài liệu quà tặng và đăng bài thông báo mở màn',
      role: 'Content/Thiết kế',
      dueDate: 'D-1',
      deliverable: 'Không gian cộng đồng sẵn sàng tiếp nhận thành viên'
    });
  }

  // Họp briefing
  preLaunchList.push({
    task: 'Họp Briefing toàn team chốt mục tiêu, phân chia ca trực và kích hoạt chiến dịch',
    role: 'Lead/Điều phối',
    dueDate: 'D-1',
    deliverable: 'Biên bản thống nhất mục tiêu và lịch trực phản hồi khách hàng'
  });

  preLaunchList.forEach((t, i) => {
    checklist.push({
      id: `task_pre_${i + 1}`,
      stage: 'pre_launch',
      task: t.task,
      role: t.role,
      dueDate: t.dueDate,
      deliverable: t.deliverable,
      completed: false,
      provenance: 'assumption'
    });
  });

  // 2. Chuyển hóa 4 tuần từ Timeline ý tưởng
  const stageMap: Record<number, ExecutionStage> = {
    1: 'week_1',
    2: 'week_2',
    3: 'week_3',
    4: 'week_4'
  };

  idea.timeline.forEach((w) => {
    const stage = stageMap[w.week] || 'week_1';
    w.activities.forEach((activity, actIdx) => {
      const role = inferRoleFromActivity(activity);
      const deliverable = inferDeliverable(activity, role);
      checklist.push({
        id: `task_w${w.week}_${actIdx + 1}`,
        stage,
        task: activity,
        role,
        dueDate: `Tuần ${w.week} - Ngày ${actIdx * 2 + 1}`,
        deliverable,
        completed: false,
        provenance: 'user_provided'
      });
    });
  });

  return checklist;
}

/**
 * Sinh các kịch bản dự phòng rủi ro chính bám sát kênh thực tế kèm checkpoint và Plan B
 */
function generateContingencyTriggers(idea: MarketingIdea, totalBudget: number): ContingencyTrigger[] {
  const chars = detectIdeaCharacteristics(idea);
  const triggers: ContingencyTrigger[] = [];

  if (chars.hasKOC) {
    triggers.push({
      id: 'trigger_koc',
      risk: 'KOC nhận hàng mẫu nhưng chậm lịch trả video quá 48h hoặc chất lượng video không đạt yêu cầu duyệt',
      checkpointDay: 'Tuần 2 - Ngày 3',
      triggerMetric: 'Tiến độ bàn giao video KOC & Tỷ lệ duyệt video',
      triggerCondition: 'Quá hạn cam kết 48 tiếng chưa nộp bản nháp hoặc KOC đơn phương hủy hợp tác',
      correctiveAction: 'Kích hoạt ngay danh sách 2 Micro KOC dự phòng đã liên hệ trước, đồng thời đẩy ngân sách sang định dạng Content nhân viên nội bộ',
      maxBudgetCap: Math.round(totalBudget * 0.04)
    });
  }

  if (chars.hasPaidAds) {
    triggers.push({
      id: 'trigger_ads_cpm',
      risk: 'Chi phí giá thầu quảng cáo (CPM) tăng đột biến > 40% hoặc tỷ lệ click (CTR) dưới 0.8% sau 3 ngày',
      checkpointDay: 'Ngày 3',
      triggerMetric: 'CPM & CTR trên tài khoản quảng cáo',
      triggerCondition: 'CPM vượt 120.000 VNĐ hoặc CTR < 0.8% liên tục trong 48h',
      correctiveAction: 'Tạm dừng các nhóm ads kém hiệu quả, thay hook video mới và thu hẹp tệp đối tượng tương tự (Lookalike)',
      maxBudgetCap: Math.round(totalBudget * 0.05)
    });
  }

  if (chars.hasCommunityOrganic || (!chars.hasPaidAds && !chars.hasKOC)) {
    triggers.push({
      id: 'trigger_organic_reach',
      risk: 'Lượt tiếp cận và tương tác bài đăng tuần đầu không đạt mức kỳ vọng tối thiểu sau 5 ngày mở màn',
      checkpointDay: 'Ngày 5',
      triggerMetric: 'Lượt tương tác, thảo luận và số người tham gia',
      triggerCondition: 'Dưới 50 lượt tương tác bài mở màn hoặc dưới 30 người đăng ký tham gia sau 5 ngày',
      correctiveAction: 'Tổ chức mini-livestream ngắn giải đáp, nhắn tin trực tiếp mời 20 khách quen đầu tiên kích hoạt thảo luận',
      maxBudgetCap: Math.round(totalBudget * 0.04)
    });
  }

  // Trigger chung về chuyển đổi
  triggers.push({
    id: 'trigger_conversion_rate',
    risk: 'Tỷ lệ phản hồi hoặc chuyển đổi đơn hàng tuần thứ 3 thấp hơn 40% so với dự tính',
    checkpointDay: 'Tuần 3 - Ngày 4',
    triggerMetric: 'Tỷ lệ chốt đơn / phản hồi tin nhắn',
    triggerCondition: 'Tỷ lệ chốt đơn đạt dưới 5% trên tổng số khách hỏi',
    correctiveAction: 'Rà soát lại kịch bản tư vấn, tung thêm voucher trợ giá số lượng giới hạn để kích cầu chốt đơn nhanh',
    maxBudgetCap: Math.round(totalBudget * 0.04)
  });

  return triggers;
}

/**
 * Khởi tạo Executive Decision Banner cho cuộc họp phê duyệt ngân sách
 */
function generateExecutiveDecision(idea: MarketingIdea, totalBudget: number, objective: string): ExecutiveDecision {
  return {
    title: `Phê duyệt Kế hoạch & Dự toán Ngân sách Chiến dịch: "${idea.title}"`,
    decisionAsk: `Đề nghị Ban Giám Đốc / Đối tác phê duyệt chủ trương và hạn mức giải ngân ${formatVND(totalBudget)} để triển khai chiến dịch trong 4 tuần nhằm đạt mục tiêu "${objective}".`,
    proposedBudget: totalBudget,
    approverRole: 'Ban Giám Đốc / CMO / Đối tác phân phối',
    approvalDeadline: 'Trước ngày bắt đầu giai đoạn Pre-launch 5 ngày',
    goNoGoCriteria: [
      'Tồn kho sản phẩm và năng lực đóng gói sẵn sàng đáp ứng lượng đơn hàng mục tiêu.',
      'Bộ tài nguyên hình ảnh và video mẫu đạt yêu cầu kiểm duyệt nhận diện thương hiệu.',
      'Hệ thống phần mềm bán hàng, cổng thanh toán và mã voucher vận hành trơn tru.',
      'Nhân sự trực fanpage cam kết tốc độ phản hồi tin nhắn dưới 5 phút trong khung giờ vàng.'
    ]
  };
}

/**
 * Khởi tạo một bản Proposal hoàn chỉnh "Meeting-Ready" từ MarketingIdea và bối cảnh người dùng
 */
export function generateDefaultProposal(
  idea: MarketingIdea,
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
): CampaignProposal {
  const totalBudget = parseEstimatedBudget(idea.estimatedBudget, context.budgetLevel);
  const budgetItems = generateDynamicBudgetItems(idea, totalBudget, context.budgetLevel);
  const summary = calculateAllocationSummary(budgetItems, totalBudget);

  const budgetAllocation = {
    totalBudget,
    items: budgetItems,
    allocatedAmount: summary.allocatedAmount,
    unallocatedAmount: summary.unallocatedAmount,
    currency: 'VND'
  };

  const kpiScenarios = generateKpiScenarios(idea, totalBudget, context.objective);
  const checklist = generateExecutionChecklist(idea);
  const contingencyTriggers = generateContingencyTriggers(idea, totalBudget);
  const executiveDecision = generateExecutiveDecision(idea, totalBudget, context.objective);

  const timestamp = new Date().toISOString();
  const id = `prop_${idea.id}_v${idea.version || 1}_${Date.now()}`;

  return {
    id,
    campaignId: idea.id,
    version: idea.version || 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'draft',
    context,
    ideaSnapshot: JSON.parse(JSON.stringify(idea)),
    executiveDecision,
    budgetAllocation,
    kpiScenarios,
    checklist,
    contingencyTriggers,
    notes: 'Bản đề xuất ở trạng thái Nháp (Draft). Vui lòng rà soát các giả định và hạng mục phân bổ trước khi chuyển sang trạng thái Sẵn sàng duyệt (Ready for review).'
  };
}


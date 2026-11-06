import {
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

/**
 * Sinh danh sách 5 nhóm hạng mục ngân sách chuẩn Playbook cân bằng chính xác 100%
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
      isContingency: tmpl.isContingency
    };
  });

  return recalculateItemPercentages(items, totalBudget);
}

/**
 * Sinh 3 kịch bản KPI dựa trên tổng ngân sách và mục tiêu chiến dịch
 */
function generateKpiScenarios(totalBudget: number, objective: string): KPIScenario[] {
  // Benchmark chuẩn cho SME Việt Nam
  const isLeadFocus = objective.toLowerCase().includes('đơn') || objective.toLowerCase().includes('chuyển đổi') || objective.toLowerCase().includes('doanh số');
  const baseReachRatio = isLeadFocus ? 380 : 320; // 1 VNĐ mang lại bao nhiêu lượt tiếp cận
  const estimatedReachBase = Math.max(5000, Math.round(totalBudget / baseReachRatio));

  return [
    {
      name: 'conservative',
      label: 'Kịch bản Thận trọng',
      reach: Math.round(estimatedReachBase * 0.75),
      impressions: Math.round(estimatedReachBase * 0.75 * 1.35),
      leads: Math.max(50, Math.round(estimatedReachBase * 0.75 * 0.02)),
      orders: Math.max(15, Math.round(totalBudget / 220000)),
      targetCPO: Math.round(totalBudget / Math.max(15, Math.round(totalBudget / 220000))),
      cac: Math.round((totalBudget * 0.85) / Math.max(12, Math.round(totalBudget / 220000 * 0.75))),
      assumptions: [
        'Tỷ lệ chốt tin nhắn duy trì ở mức an toàn 8% - 10%',
        'Chi phí giá thầu quảng cáo (CPM) chạm trần khung giờ cao điểm',
        'Nội dung không xuất hiện yếu tố viral tự nhiên; phụ thuộc 90% vào phân phối trả phí',
        'KOC trả bài đạt mức đạt yêu cầu cơ bản, không có bài bứt phá xu hướng'
      ]
    },
    {
      name: 'base',
      label: 'Kịch bản Cơ sở',
      reach: estimatedReachBase,
      impressions: Math.round(estimatedReachBase * 1.5),
      leads: Math.max(120, Math.round(estimatedReachBase * 0.038)),
      orders: Math.max(25, Math.round(totalBudget / 140000)),
      targetCPO: Math.round(totalBudget / Math.max(25, Math.round(totalBudget / 140000))),
      cac: Math.round((totalBudget * 0.85) / Math.max(20, Math.round(totalBudget / 140000 * 0.75))),
      assumptions: [
        'Tỷ lệ phản hồi tin nhắn trong vòng 5 phút đạt trên 85%, tỷ lệ chốt đạt 15% - 18%',
        'Video ngắn giữ chân người xem 3 giây đầu tiên vượt mức benchmark 30%',
        'Ít nhất 1-2 KOC mang lại lượng tương tác thảo luận tự nhiên tốt',
        'Mã khuyến mại và cổng thanh toán hoạt động ổn định 100% không gặp sự cố'
      ]
    },
    {
      name: 'optimistic',
      label: 'Kịch bản Tích cực',
      reach: Math.round(estimatedReachBase * 1.5),
      impressions: Math.round(estimatedReachBase * 1.5 * 1.8),
      leads: Math.max(250, Math.round(estimatedReachBase * 1.5 * 0.055)),
      orders: Math.max(45, Math.round(totalBudget / 95000)),
      targetCPO: Math.round(totalBudget / Math.max(45, Math.round(totalBudget / 95000))),
      cac: Math.round((totalBudget * 0.85) / Math.max(35, Math.round(totalBudget / 95000 * 0.75))),
      assumptions: [
        'Tối thiểu 1 video đạt triệu views hoặc lọt vào tab thịnh hành tự nhiên của TikTok/Reels',
        'Hiệu ứng truyền miệng (WOM) cao, tỷ lệ khách tự chia sẻ minigame vượt 20%',
        'Tỷ lệ chốt sales đạt trên 22% nhờ kịch bản tư vấn xuất sắc và ưu đãi hấp dẫn',
        'KOC chủ động gắn link affiliate và re-up trên các kênh phụ gia tăng chuyển đổi'
      ]
    }
  ];
}

/**
 * Tạo danh sách checklist gồm Pre-launch (3-5 ngày trước giờ G) và 4 tuần từ Timeline ý tưởng
 */
function generateExecutionChecklist(idea: MarketingIdea): ExecutionTask[] {
  const checklist: ExecutionTask[] = [];

  // 1. Pre-launch Tasks (3-5 ngày trước giờ G)
  const preLaunchTemplates = [
    {
      task: 'Quay chụp và hoàn thiện bộ tài nguyên Media (10 video ngắn + 15 ảnh sản phẩm)',
      role: 'Content/Thiết kế',
      dueDate: 'D-5',
      deliverable: 'Drive thư mục media đạt chuẩn duyệt nhận diện của Brand'
    },
    {
      task: 'Thiết lập mã giảm giá, cấu hình kho hàng và kiểm thử luồng đặt mua trên POS',
      role: 'Vận hành/Ads',
      dueDate: 'D-3',
      deliverable: '3 mã voucher kích hoạt thành công và kiểm tra đặt thử 1 đơn test'
    },
    {
      task: 'Soạn kịch bản tư vấn FAQ, mẫu trả lời comment tự động và quy trình xử lý khiếu nại',
      role: 'CSKH/Sales',
      dueDate: 'D-2',
      deliverable: 'File kịch bản xử lý 10 tình huống thường gặp cho nhân sự trực page'
    },
    {
      task: 'Nạp ngân sách vào tài khoản quảng cáo, cài đặt Pixel đo lường và tạo sẵn nhóm Ads',
      role: 'Vận hành/Ads',
      dueDate: 'D-1',
      deliverable: 'Chiến dịch quảng cáo đã qua bước xét duyệt (Status: Ready)'
    },
    {
      task: 'Họp Briefing toàn team chốt mục tiêu KPI, phân chia ca trực và kích hoạt chiến dịch',
      role: 'Lead/Điều phối',
      dueDate: 'D-1',
      deliverable: 'Biên bản thống nhất mục tiêu và lịch trực phản hồi khách hàng 24/7'
    }
  ];

  preLaunchTemplates.forEach((t, i) => {
    checklist.push({
      id: `task_pre_${i + 1}`,
      stage: 'pre_launch',
      task: t.task,
      role: t.role,
      dueDate: t.dueDate,
      deliverable: t.deliverable,
      completed: false
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
        completed: false
      });
    });
  });

  return checklist;
}

/**
 * Sinh 2 kịch bản dự phòng rủi ro chính kèm checkpoint và Plan B
 */
function generateContingencyTriggers(totalBudget: number): ContingencyTrigger[] {
  return [
    {
      id: 'trigger_1',
      risk: 'Lượt tiếp cận và tương tác hữu cơ tuần đầu không đạt 3.000 Reach sau 5 ngày mở màn',
      checkpointDay: 'Ngày 5',
      triggerMetric: 'Reach tự nhiên & Lượt tương tác bài đăng',
      triggerCondition: '< 3.000 Reach hoặc dưới 100 lượt tham gia minigame sau 5 ngày',
      correctiveAction: 'Trích từ Quỹ dự phòng để chạy Spark Ads / Boost Post nhắm thẳng vào bài viết có tỷ lệ giữ chân cao nhất',
      maxBudgetCap: Math.round(totalBudget * 0.05)
    },
    {
      id: 'trigger_2',
      risk: 'KOC nhận hàng mẫu nhưng chậm lịch trả video quá 48h hoặc chất lượng video không đạt yêu cầu duyệt',
      checkpointDay: 'Tuần 2 - Ngày 3',
      triggerMetric: 'Tiến độ bàn giao video KOC & Tỷ lệ duyệt video',
      triggerCondition: 'Quá hạn cam kết 48 tiếng chưa nộp bản nháp hoặc KOC đơn phương hủy hợp tác',
      correctiveAction: 'Kích hoạt ngay danh sách 2 Micro KOC dự phòng đã liên hệ trước, đồng thời đẩy ngân sách sang định dạng Content nhân viên nội bộ',
      maxBudgetCap: Math.round(totalBudget * 0.04)
    }
  ];
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
  const budgetItems = generateBudgetItems(totalBudget, context.budgetLevel);
  const summary = calculateAllocationSummary(budgetItems, totalBudget);

  const budgetAllocation = {
    totalBudget,
    items: budgetItems,
    allocatedAmount: summary.allocatedAmount,
    unallocatedAmount: summary.unallocatedAmount,
    currency: 'VND'
  };

  const kpiScenarios = generateKpiScenarios(totalBudget, context.objective);
  const checklist = generateExecutionChecklist(idea);
  const contingencyTriggers = generateContingencyTriggers(totalBudget);
  const executiveDecision = generateExecutiveDecision(idea, totalBudget, context.objective);

  const timestamp = new Date().toISOString();
  const id = `prop_${idea.id}_v${idea.version || 1}_${Date.now()}`;

  return {
    id,
    campaignId: idea.id,
    version: idea.version || 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'ready_for_review',
    context,
    ideaSnapshot: JSON.parse(JSON.stringify(idea)),
    executiveDecision,
    budgetAllocation,
    kpiScenarios,
    checklist,
    contingencyTriggers,
    notes: 'Bản đề xuất được khởi tạo tự động từ Playbook & Snapshot ý tưởng ban đầu. Bạn có thể chỉnh sửa trực tiếp từng hạng mục trước khi xuất bản hoặc in ấn.'
  };
}


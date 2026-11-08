import type { CampaignInput, MarketingIdea } from './marketing';

/**
 * Nguồn gốc / 3 lớp phân loại dữ liệu theo Mục 10.4
 */
export type DataProvenance = 'user_provided' | 'calculated' | 'assumption';

/**
 * Phân loại mục tiêu chiến dịch để tối ưu phễu KPI
 */
export type ObjectiveType = 'awareness' | 'lead_generation' | 'sales' | 'retention';

/**
 * Danh mục chi phí phân bổ ngân sách
 */
export type BudgetItemCategory =
  | 'paid_ads'             // Quảng cáo trực tiếp (Paid Ads - TikTok/Meta/Google)
  | 'koc_partnership'      // Hợp tác KOC/KOL/Gửi mẫu trải nghiệm
  | 'promotions_vouchers'  // Quà tặng khuyến mại / Voucher / Minigame
  | 'content_production'   // Sản xuất nội dung (Media, Video, Thiết kế)
  | 'contingency_fund'     // Quỹ dự phòng rủi ro / Kế hoạch B
  | 'other';               // Chi phí khác

/**
 * Một hạng mục chi phí chi tiết trong dự toán ngân sách
 */
export interface BudgetItem {
  /** Định danh duy nhất của hạng mục */
  id: string;
  /** Nhóm phân loại chi phí */
  category: BudgetItemCategory;
  /** Tên hiển thị của hạng mục (ví dụ: "Chạy quảng cáo chuyển đổi TikTok Ads") */
  label: string;
  /** Tỷ lệ phần trăm trên tổng ngân sách (%) */
  percentage: number;
  /** Số tiền phân bổ (VNĐ) */
  amount: number;
  /** Ghi chú mục đích sử dụng hoặc định mức chi */
  note: string;
  /** Đánh dấu hạng mục thuộc quỹ dự phòng rủi ro */
  isContingency: boolean;
  /** Lớp dữ liệu: Bạn cung cấp / Hệ thống tính / Giả định cần xác nhận */
  provenance?: DataProvenance;
  /** Giải thích mối liên hệ với kênh và hoạt động của ý tưởng */
  explanation?: string;
}

/**
 * Bảng phân bổ toàn bộ ngân sách chiến dịch
 */
export interface BudgetAllocation {
  /** Tổng ngân sách đề xuất (VNĐ) */
  totalBudget: number;
  /** Danh sách các hạng mục chi phí bóc tách */
  items: BudgetItem[];
  /** Tổng số tiền đã phân bổ cho các hạng mục (VNĐ) */
  allocatedAmount: number;
  /** Số tiền còn lại chưa phân bổ (VNĐ) - lý tưởng là 0 */
  unallocatedAmount: number;
  /** Đơn vị tiền tệ, mặc định 'VND' */
  currency: 'VND' | string;
}

/**
 * Tên các kịch bản KPI
 */
export type KPIScenarioName = 'conservative' | 'base' | 'optimistic';

/**
 * Kịch bản chỉ số KPI kỳ vọng kèm giả định đo lường
 */
export interface KPIScenario {
  /** Mã định danh kịch bản: Thận trọng | Cơ sở | Tích cực */
  name: KPIScenarioName;
  /** Nhãn hiển thị tiếng Việt (ví dụ: "Kịch bản Thận trọng") */
  label: string;
  /** Số người/tài khoản duy nhất tiếp cận (Unique Reach) */
  reach: number;
  /** Tổng số lượt hiển thị (Impressions) */
  impressions: number;
  /** Số lượt khách hàng tiềm năng / tương tác chất lượng (Leads) */
  leads: number;
  /** Số đơn hàng dự kiến (Estimated Orders) */
  orders: number;
  /** Chi phí mục tiêu trên mỗi đơn hàng (Target CPO - VNĐ) */
  targetCPO: number;
  /** Chi phí thu hút khách hàng mới ước tính (CAC - VNĐ) */
  cac: number;
  /** Danh sách giả định đo lường & điều kiện tiên quyết để đạt kịch bản này */
  assumptions: string[];
  /** Phân loại mục tiêu tương ứng của kịch bản */
  objectiveType?: ObjectiveType;
  /** Các bước phễu minh bạch (nếu là mục tiêu chuyển đổi hoặc tạo lead) */
  funnelSteps?: {
    label: string;
    value: number;
    unit: string;
    assumptionNote?: string;
  }[];
  /** Bản đồ provenance cho từng chỉ số */
  provenanceMap?: Record<string, DataProvenance>;
}

/**
 * Các giai đoạn thực thi công việc
 */
export type ExecutionStage =
  | 'pre_launch' // Tiền chiến dịch (3-5 ngày trước giờ G)
  | 'week_1'     // Tuần 1: Khởi động / Nhận diện
  | 'week_2'     // Tuần 2: Tăng tốc / Tương tác
  | 'week_3'     // Tuần 3: Chuyển đổi / Bứt phá đơn
  | 'week_4';    // Tuần 4: Duy trì / Đánh giá & Tối ưu

/**
 * Một đầu việc thực thi cụ thể trong checklist
 */
export interface ExecutionTask {
  /** Mã định danh công việc */
  id: string;
  /** Giai đoạn thực thi */
  stage: ExecutionStage;
  /** Tên nội dung công việc cần thực hiện */
  task: string;
  /** Vai trò chịu trách nhiệm chuyên môn (Content, Ads, Sales, Lead...) */
  role: string;
  /** Tên nhân sự phụ trách cụ thể trong team (tùy chọn) */
  assigneeName?: string;
  /** Hạn chót hoàn thành (ví dụ: "D-3" hoặc "15/11/2026") */
  dueDate?: string;
  /** Sản phẩm bàn giao cụ thể (Deliverable) */
  deliverable: string;
  /** Điều kiện phụ thuộc trước khi bắt đầu (tùy chọn) */
  dependency?: string;
  /** Trạng thái đã hoàn thành hay chưa */
  completed: boolean;
  /** Lớp dữ liệu phân loại */
  provenance?: DataProvenance;
}

/**
 * Kịch bản dự phòng và điểm cảnh báo rủi ro (Plan B Pivot Trigger)
 */
export interface ContingencyTrigger {
  /** Mã định danh rủi ro */
  id: string;
  /** Rủi ro nhận diện (ví dụ: "Lượt tiếp cận tuần 1 dưới 3.000") */
  risk: string;
  /** Điểm kiểm tra tiến độ (ví dụ: "Ngày 5" hoặc mốc thời gian cụ thể) */
  checkpointDay: string | number;
  /** Chỉ số theo dõi làm căn cứ cảnh báo */
  triggerMetric: string;
  /** Điều kiện kích hoạt Plan B (ví dụ: "< 3.000 Reach sau 5 ngày") */
  triggerCondition: string;
  /** Hành động ứng phó cụ thể khi chạm ngưỡng cảnh báo */
  correctiveAction: string;
  /** Ngân sách tối đa được phép trích từ Quỹ dự phòng cho phương án này (VNĐ) */
  maxBudgetCap: number;
}

/**
 * Khối quyết định & Yêu cầu phê duyệt dành cho Sếp / Đối tác (Executive Decision Ask)
 */
export interface ExecutiveDecision {
  /** Tiêu đề đề xuất duyệt chi */
  title: string;
  /** Yêu cầu phê duyệt cốt lõi (Core Decision Ask) */
  decisionAsk: string;
  /** Ngân sách đề nghị duyệt chi (VNĐ) */
  proposedBudget: number;
  /** Vai trò của người có thẩm quyền phê duyệt (Sếp / Đối tác / Giám đốc) */
  approverRole: string;
  /** Hạn chót cần ra quyết định phê duyệt */
  approvalDeadline?: string;
  /** Tiêu chí đánh giá Go/No-Go trước khi giải ngân */
  goNoGoCriteria: string[];
}

/**
 * Trạng thái của bản Proposal
 */
export type ProposalStatus = 'draft' | 'ready_for_review' | 'approved' | 'rejected';

/**
 * Thực thể tổng hợp Bản đề xuất chiến dịch hoàn chỉnh (Meeting-Ready Campaign Proposal)
 */
export interface CampaignProposal {
  /** Định danh duy nhất của proposal (ví dụ: prop_1730900000_abc123) */
  id: string;
  /** ID của ý tưởng chiến dịch gốc (MarketingIdea.id) */
  campaignId: string;
  /** Phiên bản của Proposal (bắt đầu từ 1) */
  version: number;
  /** Thời điểm tạo proposal (ISO string) */
  createdAt: string;
  /** Thời điểm cập nhật proposal gần nhất (ISO string) */
  updatedAt: string;
  /** Trạng thái hiện tại của proposal */
  status: ProposalStatus;
  /** Bối cảnh đầu vào của người dùng */
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  /** Snapshot dữ liệu ý tưởng gốc độc lập */
  ideaSnapshot: MarketingIdea;
  /** Khối tóm tắt yêu cầu phê duyệt cho Sếp / Đối tác */
  executiveDecision: ExecutiveDecision;
  /** Bảng bóc tách phân bổ ngân sách 5 nhóm chi phí */
  budgetAllocation: BudgetAllocation;
  /** Bảng 3 kịch bản KPI kỳ vọng minh bạch nguồn và giả định */
  kpiScenarios: KPIScenario[];
  /** Danh sách checklist chuẩn bị tiền chiến dịch & lộ trình 4 tuần */
  checklist: ExecutionTask[];
  /** Kịch bản dự phòng rủi ro và các điểm kích hoạt Plan B */
  contingencyTriggers: ContingencyTrigger[];
  /** Ghi chú bổ sung của người lập kế hoạch */
  notes?: string;
}


/**
 * Bảng từ ngữ dùng chung cho giao diện và hệ thống
 * Tuân thủ theo chuẩn hóa tại Mục 10.4 tài liệu kế hoạch cải thiện chất lượng output
 */
export const MARKETING_VOCABULARY = {
  shortlist: 'Ý tưởng đã lưu',
  proposal: 'Bản đề xuất',
  refinement: 'Điều chỉnh ý tưởng',
  cta: 'Hành động muốn khách hàng thực hiện',
  lead: 'Khách hàng tiềm năng',
  kpi: 'Chỉ số đánh giá',
  insight: 'Giả thuyết về nhu cầu hoặc rào cản của khách hàng'
} as const;

/**
 * Nhãn phân loại 3 lớp dữ liệu
 */
export const DATA_PROVENANCE_LABELS = {
  user_provided: 'Bạn cung cấp',
  calculated: 'Hệ thống tính',
  assumption: 'Giả định cần xác nhận'
} as const;


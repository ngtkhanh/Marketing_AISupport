import type { BudgetItem, BudgetLevel } from '@/types/marketing';

/**
 * Tóm tắt trạng thái phân bổ ngân sách
 */
export interface AllocationSummary {
  /** Tổng ngân sách chiến dịch (VNĐ) */
  totalBudget: number;
  /** Tổng số tiền đã phân bổ cho các hạng mục (VNĐ) */
  allocatedAmount: number;
  /** Số tiền còn lại chưa phân bổ (VNĐ) */
  unallocatedAmount: number;
  /** Tỷ lệ phần trăm đã phân bổ (%) */
  allocatedPercentage: number;
  /** Tỷ lệ phần trăm còn lại (%) */
  unallocatedPercentage: number;
  /** Ngân sách đã được phân bổ trọn vẹn (unallocatedAmount === 0) */
  isBalanced: boolean;
  /** Ngân sách bị vượt định mức (unallocatedAmount < 0) */
  isOverBudget: boolean;
  /** Ngân sách còn dư chưa phân bổ hết (unallocatedAmount > 0) */
  isUnderBudget: boolean;
}

/**
 * Kết quả kiểm tra tính hợp lệ của phân bổ ngân sách
 */
export interface BudgetValidationResult {
  /** Phân bổ hợp lệ để xuất bản proposal và in ấn */
  isValid: boolean;
  /** Danh sách lỗi bắt buộc phải sửa (vượt ngân sách, số tiền âm,...) */
  errors: string[];
  /** Danh sách cảnh báo khuyến nghị (chưa phân bổ hết, thiếu quỹ dự phòng,...) */
  warnings: string[];
}

/**
 * Định dạng số tiền sang chuỗi hiển thị VNĐ chuẩn (ví dụ: 15.000.000 VNĐ)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '0 VNĐ';
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} VNĐ`;
}

/**
 * Phân tích chuỗi tiền tệ hoặc nhập liệu thành số nguyên VNĐ
 */
export function parseVND(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d]/g, '');
  if (!cleaned) return 0;
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Trích xuất số tiền ngân sách thực tế từ chuỗi ước tính của ý tưởng (estimatedBudget)
 * Nếu không trích xuất được số cụ thể, tự động gán giá trị hợp lý theo BudgetLevel
 */
export function parseEstimatedBudget(budgetString?: string, defaultLevel: BudgetLevel = 'low'): number {
  const DEFAULT_AMOUNTS: Record<BudgetLevel, number> = {
    low: 15000000,     // 15 triệu (chuẩn SME ngân sách thấp dưới 20tr)
    medium: 50000000,  // 50 triệu (mức trung bình 20 - 100tr)
    high: 200000000    // 200 triệu (mức cao trên 100tr)
  };

  if (!budgetString || typeof budgetString !== 'string') {
    return DEFAULT_AMOUNTS[defaultLevel] || 15000000;
  }

  // Trường hợp dạng khoảng: "12.000.000 - 18.000.000" hoặc "12.000.000 – 18.000.000"
  const rangeMatch = budgetString.match(/([\d.,]+)\s*[-–—tođến]+\s*([\d.,]+)/i);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    const minVal = parseVND(rangeMatch[1]);
    const maxVal = parseVND(rangeMatch[2]);
    if (minVal > 0 && maxVal > 0) {
      return Math.round((minVal + maxVal) / 2);
    }
  }

  // Trường hợp có chứa chữ "triệu" (ví dụ: "15 triệu", "15-20 triệu")
  const millionMatch = budgetString.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr\b)/i);
  if (millionMatch && millionMatch[1]) {
    const rawVal = parseFloat(millionMatch[1].replace(',', '.'));
    if (!isNaN(rawVal) && rawVal > 0) {
      return Math.round(rawVal * 1000000);
    }
  }

  // Trường hợp chuỗi số đầy đủ (ví dụ: "15.000.000 VNĐ")
  const fullNumMatch = budgetString.match(/\b\d{1,3}(?:[.,]\d{3})+\b/);
  if (fullNumMatch) {
    const val = parseVND(fullNumMatch[0]);
    if (val > 0) return val;
  }

  const directParsed = parseVND(budgetString);
  if (directParsed > 100000) {
    return directParsed;
  }

  return DEFAULT_AMOUNTS[defaultLevel] || 15000000;
}

/**
 * Tính toán tóm tắt tình trạng phân bổ ngân sách
 */
export function calculateAllocationSummary(
  items: BudgetItem[],
  totalBudget: number
): AllocationSummary {
  const safeTotal = Math.max(0, Math.round(totalBudget || 0));
  const allocatedAmount = items.reduce((sum, item) => sum + Math.max(0, Math.round(item.amount || 0)), 0);
  const unallocatedAmount = safeTotal - allocatedAmount;

  const allocatedPercentage = safeTotal > 0
    ? Math.round((allocatedAmount / safeTotal) * 1000) / 10
    : 0;
  const unallocatedPercentage = safeTotal > 0
    ? Math.round((unallocatedAmount / safeTotal) * 1000) / 10
    : 0;

  return {
    totalBudget: safeTotal,
    allocatedAmount,
    unallocatedAmount,
    allocatedPercentage,
    unallocatedPercentage,
    isBalanced: unallocatedAmount === 0,
    isOverBudget: unallocatedAmount < 0,
    isUnderBudget: unallocatedAmount > 0
  };
}

/**
 * Tự động tính toán lại tỷ lệ phần trăm (%) cho từng hạng mục dựa trên tổng ngân sách
 */
export function recalculateItemPercentages(
  items: BudgetItem[],
  totalBudget: number
): BudgetItem[] {
  const safeTotal = Math.max(0, Math.round(totalBudget || 0));
  return items.map((item) => {
    const percentage = safeTotal > 0
      ? Math.round((Math.max(0, item.amount || 0) / safeTotal) * 1000) / 10
      : 0;
    return {
      ...item,
      percentage
    };
  });
}

/**
 * Kiểm tra các giới hạn và quy tắc nghiệp vụ của ngân sách
 */
export function validateBudgetLimits(
  items: BudgetItem[],
  totalBudget: number
): BudgetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const summary = calculateAllocationSummary(items, totalBudget);

  if (summary.totalBudget <= 0) {
    errors.push('Tổng ngân sách chiến dịch phải lớn hơn 0 VNĐ.');
  }

  if (summary.isOverBudget) {
    errors.push(
      `Ngân sách phân bổ đang vượt quá ${formatVND(Math.abs(summary.unallocatedAmount))} so với tổng định mức.`
    );
  }

  const hasNegative = items.some((item) => (item.amount || 0) < 0);
  if (hasNegative) {
    errors.push('Số tiền phân bổ của từng hạng mục không được là số âm.');
  }

  if (summary.isUnderBudget) {
    warnings.push(
      `Vẫn còn ${formatVND(summary.unallocatedAmount)} chưa được phân bổ vào các hạng mục chi phí.`
    );
  }

  const contingencyItem = items.find((item) => item.isContingency || item.category === 'contingency_fund');
  if (!contingencyItem || contingencyItem.amount <= 0) {
    warnings.push(
      'Khuyến nghị phân bổ tối thiểu 5% - 10% ngân sách vào Quỹ dự phòng rủi ro để bảo toàn kế hoạch khi gặp sự cố.'
    );
  }

  const zeroItems = items.filter((item) => (item.amount || 0) === 0);
  if (zeroItems.length > 0) {
    warnings.push(
      `Có ${zeroItems.length} hạng mục đang có định mức 0 VNĐ (${zeroItems.map((i) => i.label).join(', ')}).`
    );
  }

  return {
    isValid: errors.length === 0 && summary.isBalanced,
    errors,
    warnings
  };
}

/**
 * Cân bằng số tiền còn dư hoặc bị lệch trực tiếp vào một hạng mục chỉ định (ví dụ Quỹ dự phòng hoặc Paid Ads)
 */
export function adjustRemainingToItem(
  items: BudgetItem[],
  targetItemId: string,
  totalBudget: number
): BudgetItem[] {
  const safeTotal = Math.max(0, Math.round(totalBudget || 0));
  const otherItemsTotal = items
    .filter((item) => item.id !== targetItemId)
    .reduce((sum, item) => sum + Math.max(0, Math.round(item.amount || 0)), 0);

  const adjustedTargetAmount = Math.max(0, safeTotal - otherItemsTotal);

  const updatedItems = items.map((item) => {
    if (item.id === targetItemId) {
      return {
        ...item,
        amount: adjustedTargetAmount
      };
    }
    return item;
  });

  return recalculateItemPercentages(updatedItems, safeTotal);
}


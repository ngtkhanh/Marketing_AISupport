'use client';

import React, { useMemo } from 'react';
import {
  BudgetAllocation,
  BudgetItem,
  BudgetItemCategory
} from '@/types/marketing';
import {
  calculateAllocationSummary,
  validateBudgetLimits,
  formatVND,
  parseVND,
  recalculateItemPercentages,
  adjustRemainingToItem
} from '@/lib/proposal-calculations';
import {
  Megaphone,
  Users,
  Gift,
  Video,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Plus,
  Minus
} from 'lucide-react';

interface BudgetAllocationEditorProps {
  allocation: BudgetAllocation;
  onChange: (newAllocation: BudgetAllocation) => void;
  readOnly?: boolean;
}

// Cấu hình giao diện và màu sắc cho từng nhóm chi phí
interface CategoryStyle {
  label: string;
  barColor: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

const CATEGORY_STYLES: Record<BudgetItemCategory, CategoryStyle> = {
  paid_ads: {
    label: 'Quảng cáo Paid Ads',
    barColor: 'bg-indigo-500 hover:bg-indigo-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    IconComponent: Megaphone
  },
  koc_partnership: {
    label: 'KOC / Gửi quà trải nghiệm',
    barColor: 'bg-emerald-500 hover:bg-emerald-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    IconComponent: Users
  },
  promotions_vouchers: {
    label: 'Voucher & Quà tặng',
    barColor: 'bg-amber-500 hover:bg-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    IconComponent: Gift
  },
  content_production: {
    label: 'Sản xuất nội dung & Media',
    barColor: 'bg-purple-500 hover:bg-purple-600',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    IconComponent: Video
  },
  contingency_fund: {
    label: 'Quỹ dự phòng rủi ro',
    barColor: 'bg-rose-500 hover:bg-rose-600',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    IconComponent: ShieldAlert
  },
  other: {
    label: 'Chi phí khác',
    barColor: 'bg-slate-500 hover:bg-slate-600',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    IconComponent: SlidersHorizontal
  }
};

export const BudgetAllocationEditor: React.FC<BudgetAllocationEditorProps> = ({
  allocation,
  onChange,
  readOnly = false
}) => {
  const summary = useMemo(
    () => calculateAllocationSummary(allocation.items, allocation.totalBudget),
    [allocation.items, allocation.totalBudget]
  );

  const validation = useMemo(
    () => validateBudgetLimits(allocation.items, allocation.totalBudget),
    [allocation.items, allocation.totalBudget]
  );

  // Xử lý thay đổi số tiền của một hạng mục
  const handleAmountChange = (itemId: string, rawInput: string | number) => {
    if (readOnly) return;
    const newAmount = typeof rawInput === 'number' ? rawInput : parseVND(rawInput);
    const safeAmount = Math.max(0, newAmount);

    const updatedItems = allocation.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          amount: safeAmount
        };
      }
      return item;
    });

    const refreshedItems = recalculateItemPercentages(updatedItems, allocation.totalBudget);
    const newSummary = calculateAllocationSummary(refreshedItems, allocation.totalBudget);

    onChange({
      ...allocation,
      items: refreshedItems,
      allocatedAmount: newSummary.allocatedAmount,
      unallocatedAmount: newSummary.unallocatedAmount
    });
  };

  // Tăng/giảm số tiền nhanh (bước nhảy 500.000 VNĐ)
  const handleStepAmount = (itemId: string, delta: number) => {
    if (readOnly) return;
    const item = allocation.items.find((i) => i.id === itemId);
    if (!item) return;
    handleAmountChange(itemId, Math.max(0, item.amount + delta));
  };

  // Cập nhật ghi chú mục đích chi
  const handleNoteChange = (itemId: string, note: string) => {
    if (readOnly) return;
    const updatedItems = allocation.items.map((item) =>
      item.id === itemId ? { ...item, note } : item
    );
    onChange({
      ...allocation,
      items: updatedItems
    });
  };

  // Tự động gán toàn bộ số dư còn lại vào một hạng mục cụ thể
  const handleAutoBalance = (targetItemId: string) => {
    if (readOnly) return;
    const balancedItems = adjustRemainingToItem(
      allocation.items,
      targetItemId,
      allocation.totalBudget
    );
    const newSummary = calculateAllocationSummary(balancedItems, allocation.totalBudget);

    onChange({
      ...allocation,
      items: balancedItems,
      allocatedAmount: newSummary.allocatedAmount,
      unallocatedAmount: newSummary.unallocatedAmount
    });
  };

  // Tìm id của quỹ dự phòng rủi ro để ưu tiên cân bằng
  const contingencyItemId = useMemo(() => {
    const item = allocation.items.find(
      (i) => i.isContingency || i.category === 'contingency_fund'
    );
    return item ? item.id : allocation.items[0]?.id;
  }, [allocation.items]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Tiêu đề & Tổng quan ngân sách */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bóc Tách & Phân Bổ Ngân Sách Thực Chiến
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Điều chỉnh trực tiếp số tiền từng hạng mục. Hệ thống tự động làm tròn và kiểm tra cân bằng 100% dòng tiền.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80">
          <span className="text-xs text-slate-500 font-medium">Tổng ngân sách:</span>
          <span className="text-sm sm:text-base font-extrabold text-indigo-700">
            {formatVND(allocation.totalBudget)}
          </span>
        </div>
      </div>

      {/* Thanh tỷ lệ trực quan (Multi-segment progress bar) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Tỷ lệ phân bổ nguồn lực:
          </span>
          <span className="font-mono font-medium">
            Đã phân bổ {summary.allocatedPercentage}%
          </span>
        </div>

        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
          {allocation.items.map((item) => {
            const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other;
            const widthPct = Math.max(0, Math.min(100, item.percentage));
            if (widthPct <= 0) return null;

            return (
              <div
                key={item.id}
                style={{ width: `${widthPct}%` }}
                className={`${style.barColor} transition-all duration-300 relative group cursor-pointer`}
                title={`${item.label}: ${formatVND(item.amount)} (${item.percentage}%)`}
              />
            );
          })}
        </div>

        {/* Chú thích màu sắc (Legend) */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs">
          {allocation.items.map((item) => {
            const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other;
            return (
              <div key={item.id} className="flex items-center gap-1.5 text-slate-600">
                <span className={`w-2.5 h-2.5 rounded-full ${style.barColor.split(' ')[0]}`} />
                <span className="font-medium text-slate-700">{item.label}:</span>
                <span className="text-slate-500 font-mono">
                  {item.percentage}% ({formatVND(item.amount)})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Ticker: Cảnh báo cân bằng ngân sách */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-all ${
          summary.isBalanced
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : summary.isOverBudget
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        <div className="flex items-start sm:items-center gap-2.5">
          {summary.isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          ) : summary.isOverBudget ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          )}

          <div>
            <div className="font-bold flex items-center gap-2">
              {summary.isBalanced && 'Ngân sách cân bằng hoàn hảo (100%)'}
              {summary.isOverBudget &&
                `Vượt ngân sách: ${formatVND(Math.abs(summary.unallocatedAmount))}`}
              {summary.isUnderBudget &&
                `Chưa phân bổ hết: ${formatVND(summary.unallocatedAmount)}`}
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {summary.isBalanced &&
                'Mọi khoản chi đã khớp chính xác với ngân sách đề ra, sẵn sàng mang đi bảo vệ trước Sếp.'}
              {summary.isOverBudget &&
                'Tổng các hạng mục đang lớn hơn định mức dự kiến. Hãy giảm số tiền hoặc bấm nút tự động cân bằng.'}
              {summary.isUnderBudget &&
                'Vẫn còn một khoản tiền chưa được chỉ định mục đích. Bạn có thể phân bổ thêm vào Quỹ dự phòng hoặc Ads.'}
            </p>
          </div>
        </div>

        {!readOnly && !summary.isBalanced && contingencyItemId && (
          <button
            type="button"
            onClick={() => handleAutoBalance(contingencyItemId)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 shadow-sm transition-all ${
              summary.isOverBudget
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tự động cân bằng vào Quỹ rủi ro
          </button>
        )}
      </div>

      {/* Bảng chi tiết từng hạng mục */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <th className="py-3 px-3 sm:px-4">Hạng mục chi phí</th>
              <th className="py-3 px-2 sm:px-3 text-center w-20">Tỷ lệ</th>
              <th className="py-3 px-3 sm:px-4 w-44 sm:w-56">Số tiền (VNĐ)</th>
              <th className="py-3 px-3 sm:px-4 hidden md:table-cell">Mục đích chi tiết</th>
              {!readOnly && (
                <th className="py-3 px-2 sm:px-3 text-center w-24">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocation.items.map((item) => {
              const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other;
              const { IconComponent } = style;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.isContingency ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Cột 1: Tên hạng mục & Icon */}
                  <td className="py-3 px-3 sm:px-4 align-top">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 ${style.iconBg} ${style.iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{item.label}</span>
                          {item.isContingency && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Quỹ an toàn
                            </span>
                          )}
                        </div>
                        <div className="md:hidden text-xs text-slate-500 mt-1 italic">
                          {item.note}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Tỷ lệ phần trăm */}
                  <td className="py-3 px-2 sm:px-3 text-center align-middle font-mono font-bold text-slate-700">
                    {item.percentage}%
                  </td>

                  {/* Cột 3: Nhập số tiền */}
                  <td className="py-3 px-3 sm:px-4 align-middle">
                    {readOnly ? (
                      <span className="font-bold text-slate-900 font-mono">
                        {formatVND(item.amount)}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={new Intl.NumberFormat('vi-VN').format(item.amount || 0)}
                            onChange={(e) => handleAmountChange(item.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            aria-label={`Số tiền cho ${item.label}`}
                          />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleStepAmount(item.id, 500000)}
                            title="Tăng 500.000 VNĐ"
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepAmount(item.id, -500000)}
                            title="Giảm 500.000 VNĐ"
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Cột 4: Ghi chú mục đích */}
                  <td className="py-3 px-3 sm:px-4 align-middle hidden md:table-cell text-slate-600 text-xs">
                    {readOnly ? (
                      item.note
                    ) : (
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        placeholder="Mục đích sử dụng cụ thể..."
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-transparent"
                      />
                    )}
                  </td>

                  {/* Cột 5: Nút thao tác nhanh */}
                  {!readOnly && (
                    <td className="py-3 px-2 sm:px-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleAutoBalance(item.id)}
                        title="Bù trừ toàn bộ số dư vào hạng mục này"
                        className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition font-medium"
                      >
                        Bù trừ
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cảnh báo danh sách lỗi/khuyến nghị nếu có */}
      {validation.warnings.length > 0 && !summary.isBalanced && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-800 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Lưu ý khi mang đi duyệt:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
            {validation.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


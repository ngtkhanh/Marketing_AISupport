'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useShortlist } from '@/hooks/useShortlist';
import { ShortlistItem } from '@/components/ShortlistItem';
import { ComparisonBar } from '@/components/ComparisonBar';
import { StrategyComparisonModal } from '@/components/StrategyComparisonModal';
import { Bookmark, Copy, Trash2, ArrowLeft, Check, Sparkles, Scale } from 'lucide-react';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';
import { useToast } from '@/components/Toast';

export default function ShortlistPage() {
  const { shortlist, count, isLoaded, removeIdea, clearAll, setPrimaryIdea, updateUserNotes } = useShortlist();
  const { showToast } = useToast();
  const [copiedAll, setCopiedAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Trạng thái chọn 2–3 phương án để so sánh (Mục 2.2)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        showToast('Bạn chỉ có thể chọn tối đa 3 chiến dịch để so sánh.', 'info');
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleOpenComparison = () => {
    if (selectedIds.length < 2) {
      showToast('Vui lòng chọn ít nhất 2 chiến dịch để mở bảng so sánh.', 'info');
      return;
    }
    setIsComparisonOpen(true);
  };

  const selectedEntries = useMemo(
    () => shortlist.filter((e) => selectedIds.includes(e.id)),
    [shortlist, selectedIds]
  );

  const handleCopyAll = async () => {
    if (shortlist.length === 0) return;

    const allSummaries = shortlist
      .map((entry, idx) => {
        return `==============================\n# Ý TƯỞNG SỐ ${idx + 1}\n==============================\n${formatIdeaSummary(
          entry.idea,
          entry.context
        )}`;
      })
      .join('\n\n');

    const header = `📋 TỔNG HỢP SHORTLIST Ý TƯỞNG MARKETING (${shortlist.length} Ý TƯỞNG)\nNgày xuất: ${new Date().toLocaleDateString(
      'vi-VN'
    )}\n\n`;

    const ok = await copyToClipboard(header + allSummaries);
    if (ok) {
      setCopiedAll(true);
      showToast(`Đã sao chép toàn bộ ${shortlist.length} ý tưởng vào Clipboard!`, 'success');
      setTimeout(() => setCopiedAll(false), 2000);
    } else {
      showToast('Không thể sao chép văn bản.', 'error');
    }
  };

  const handleConfirmClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
    showToast('Đã dọn sạch toàn bộ Shortlist.', 'info');
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang tạo chiến dịch</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-slate-700" />
            <span>Shortlist Ý Tưởng Đã Lưu</span>
            {isLoaded && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {count} ý tưởng
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lưu trữ cục bộ an toàn trên trình duyệt (`localStorage`). Dễ dàng sao chép tóm tắt, so sánh chiến lược hoặc tạo bản Proposal A4 sẵn sàng trình duyệt chi.
          </p>
        </div>

        {/* Global actions */}
        {isLoaded && count > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedAll ? 'Đã sao chép tất cả' : 'Sao chép tất cả'}</span>
            </button>

            {showClearConfirm ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 transition-colors cursor-pointer"
                >
                  Chắc chắn xóa
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content list */}
      {!isLoaded ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
          Đang nạp danh sách Shortlist từ bộ nhớ trình duyệt...
        </div>
      ) : count === 0 ? (
        <div className="py-16 text-center rounded-xl bg-white border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Shortlist của bạn đang trống</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Hãy quay lại trang chính, nhập thông tin sản phẩm và bấm "Lưu Shortlist" ở những ý tưởng bạn ưng ý nhất.
            </p>
          </div>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
            >
              <span>Khám phá ý tưởng ngay</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5 pb-20">
          {shortlist.map((entry) => (
            <ShortlistItem
              key={entry.id}
              entry={entry}
              onRemove={removeIdea}
              isSelected={selectedIds.includes(entry.id)}
              onToggleSelect={handleToggleSelect}
              disableSelect={selectedIds.length >= 3}
            />
          ))}
        </div>
      )}

      {/* Thanh công cụ so sánh nổi (Feature 2.2) */}
      <ComparisonBar
        selectedCount={selectedIds.length}
        maxSelectable={3}
        onOpenComparison={handleOpenComparison}
        onClearSelection={handleClearSelection}
      />

      {/* Modal Ma trận So sánh Chiến lược Đa tiêu chí (Feature 2.2) */}
      <StrategyComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        entries={selectedEntries}
        onTogglePrimary={setPrimaryIdea}
        onUpdateNotes={updateUserNotes}
      />
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShortlist } from '@/hooks/useShortlist';
import { ShortlistItem } from '@/components/ShortlistItem';
import { Bookmark, Copy, Trash2, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';
import { useToast } from '@/components/Toast';

export default function ShortlistPage() {
  const { shortlist, count, isLoaded, removeIdea, clearAll } = useShortlist();
  const { showToast } = useToast();
  const [copiedAll, setCopiedAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang tạo chiến dịch</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-indigo-600" />
            <span>Shortlist Ý Tưởng Đã Lưu</span>
            {isLoaded && (
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {count} ý tưởng
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lưu trữ cục bộ an toàn trên trình duyệt (`localStorage`). Dễ dàng sao chép tóm tắt gửi cho sếp và đồng đội.
          </p>
        </div>

        {/* Global actions */}
        {isLoaded && count > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Đã sao chép tất cả' : 'Sao chép tất cả'}</span>
            </button>

            {showClearConfirm ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
                >
                  Chắc chắn xóa
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
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
        <div className="py-20 text-center rounded-2xl bg-white border border-dashed border-slate-300 p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Shortlist của bạn đang trống</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Hãy quay lại trang chính, nhập thông tin sản phẩm và bấm nút "Lưu vào Shortlist" ở những ý tưởng bạn yêu thích nhất.
            </p>
          </div>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Khám phá ý tưởng ngay</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {shortlist.map((entry) => (
            <ShortlistItem key={entry.id} entry={entry} onRemove={removeIdea} />
          ))}
        </div>
      )}
    </div>
  );
}


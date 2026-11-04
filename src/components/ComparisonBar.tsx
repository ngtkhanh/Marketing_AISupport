'use client';

import React from 'react';
import { Scale, ArrowRightLeft, X } from 'lucide-react';

interface ComparisonBarProps {
  selectedCount: number;
  maxSelectable?: number;
  onOpenComparison: () => void;
  onClearSelection: () => void;
}

export function ComparisonBar({
  selectedCount,
  maxSelectable = 3,
  onOpenComparison,
  onClearSelection
}: ComparisonBarProps) {
  if (selectedCount === 0) return null;

  return (
    <aside
      aria-label="Thanh công cụ so sánh chiến dịch"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-slate-900 text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg border border-slate-800 flex items-center justify-between gap-3 sm:gap-6 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded bg-slate-800 text-slate-300 shrink-0">
          <Scale className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-white">
              Đã chọn: <span className="text-white">{selectedCount}</span>/{maxSelectable}
            </span>
            {selectedCount < 2 && (
              <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                (Cần ít nhất 2 để so sánh)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Chọn 2 hoặc 3 phương án để so sánh chi tiết
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          title="Bỏ chọn tất cả"
          aria-label="Bỏ chọn tất cả"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={selectedCount < 2}
          onClick={onOpenComparison}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>So sánh ngay</span>
        </button>
      </div>
    </aside>
  );
}


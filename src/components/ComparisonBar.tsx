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
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-slate-900/95 text-white backdrop-blur-md rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xl border border-slate-700/90 flex items-center justify-between gap-3 sm:gap-6 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 shrink-0">
          <Scale className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white">
              Đã chọn: <span className="text-indigo-400">{selectedCount}</span>/{maxSelectable}
            </span>
            {selectedCount < 2 && (
              <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/40">
                (Cần ít nhất 2 để so sánh)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Chọn 2 hoặc 3 phương án để so sánh cạnh nhau
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Bỏ chọn tất cả"
          aria-label="Bỏ chọn tất cả"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={selectedCount < 2}
          onClick={onOpenComparison}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>So sánh ngay</span>
        </button>
      </div>
    </aside>
  );
}


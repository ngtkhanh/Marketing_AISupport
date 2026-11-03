'use client';

import React, { useState } from 'react';
import { ShortlistEntry } from '@/types/marketing';
import { WeeklyTimeline } from './WeeklyTimeline';
import { Copy, Trash2, Check, DollarSign, Calendar, AlertCircle, Star, Edit3 } from 'lucide-react';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';
import { useToast } from './Toast';

interface ShortlistItemProps {
  entry: ShortlistEntry;
  onRemove: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  disableSelect?: boolean;
}

export function ShortlistItem({
  entry,
  onRemove,
  isSelected = false,
  onToggleSelect,
  disableSelect = false
}: ShortlistItemProps) {
  const { idea, context, savedAt } = entry;
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const formattedDate = new Date(savedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleCopy = async () => {
    const summary = formatIdeaSummary(idea, context);
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      showToast('Đã sao chép tóm tắt ý tưởng vào Clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Không thể sao chép văn bản.', 'error');
    }
  };

  const version = idea.version || 1;

  const handleConfirmDelete = () => {
    onRemove(entry.id);
    showToast(`Đã xóa "${idea.title} (v${version})" khỏi Shortlist`, 'info');
  };

  return (
    <article
      className={`p-6 rounded-2xl bg-white border transition-all relative space-y-4 shadow-xs ${
        entry.isPrimary
          ? 'border-emerald-400 ring-2 ring-emerald-400/25 shadow-md'
          : isSelected
          ? 'border-indigo-400 ring-2 ring-indigo-400/20 shadow-md'
          : 'border-slate-200/90'
      }`}
    >
      {/* Context Badge & Selection Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Checkbox chọn so sánh */}
          {onToggleSelect && (
            <label className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={!isSelected && disableSelect}
                onChange={() => onToggleSelect(entry.id)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-30 cursor-pointer"
              />
              <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                {isSelected ? 'Đã chọn so sánh' : 'Chọn so sánh'}
              </span>
            </label>
          )}

          {entry.isPrimary && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Ưu tiên số 1</span>
            </span>
          )}

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              {context.productName}
            </span>
            <span className="text-slate-500">({context.industry})</span>
            <span className="text-indigo-700 bg-indigo-50 font-semibold px-2 py-0.5 rounded-md border border-indigo-200">
              Ngân sách: {context.budgetLevel === 'low' ? 'Thấp' : context.budgetLevel === 'medium' ? 'Trung bình' : 'Cao'}
            </span>
            <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-md border border-purple-200">
              <span>Phiên bản v{version}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Lưu lúc: {formattedDate}</span>
        </div>
      </div>

      {/* Main Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">{idea.title}</h3>
            {idea.version && idea.version > 1 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                v{idea.version}
              </span>
            )}
            <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
              <span>{idea.estimatedBudget}</span>
            </div>
          </div>
          <p className="text-sm font-medium text-indigo-600 italic">"{idea.tagline}"</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép tóm tắt'}</span>
          </button>

          {isConfirmingDelete ? (
            <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Xác nhận xóa
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              title="Xóa khỏi Shortlist"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Channels */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-slate-400 font-medium">Kênh triển khai:</span>
        {idea.channels.map((ch, idx) => (
          <span
            key={idx}
            className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="text-sm text-slate-700 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
        <p className="font-semibold text-slate-800 text-xs mb-1 uppercase tracking-wider">Nội dung chiến lược cốt lõi:</p>
        <p>{idea.mainContent}</p>
      </div>

      {/* Personal Notes (Feature 2.2) */}
      {entry.userNotes && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950">
          <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-900">Ghi chú cá nhân: </span>
            <span className="italic">{entry.userNotes}</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <WeeklyTimeline timeline={idea.timeline} />
    </article>
  );
}


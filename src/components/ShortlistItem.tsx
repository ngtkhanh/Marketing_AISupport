'use client';

import React, { useState } from 'react';
import { ShortlistEntry } from '@/types/marketing';
import { WeeklyTimeline } from './WeeklyTimeline';
import { Copy, Trash2, Check, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';
import { useToast } from './Toast';

interface ShortlistItemProps {
  entry: ShortlistEntry;
  onRemove: (id: string) => void;
}

export function ShortlistItem({ entry, onRemove }: ShortlistItemProps) {
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
    <article className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative space-y-4">
      {/* Context Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
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

      {/* Timeline */}
      <WeeklyTimeline timeline={idea.timeline} />
    </article>
  );
}


'use client';

import React, { useState } from 'react';
import { MarketingIdea, CampaignInput } from '@/types/marketing';
import { WeeklyTimeline } from './WeeklyTimeline';
import { Bookmark, BookmarkCheck, Copy, Check, Users, DollarSign } from 'lucide-react';
import { useShortlist } from '@/hooks/useShortlist';
import { useToast } from './Toast';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';

interface IdeaCardProps {
  idea: MarketingIdea;
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  index: number;
}

export function IdeaCard({ idea, context, index }: IdeaCardProps) {
  const { isSaved, saveIdea, removeIdea } = useShortlist();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const saved = isSaved(idea.id);

  const handleToggleSave = () => {
    if (saved) {
      removeIdea(idea.id);
      showToast(`Đã bỏ "${idea.title}" khỏi Shortlist.`, 'info');
    } else {
      const res = saveIdea(idea, context);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const handleCopy = async () => {
    const summary = formatIdeaSummary(idea, context);
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      showToast('Đã sao chép tóm tắt ý tưởng vào Clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Không thể sao chép, vui lòng thử lại.', 'error');
    }
  };

  return (
    <article
      id={`idea-card-${index + 1}`}
      className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative break-inside-avoid print:shadow-none print:border-slate-300"
    >
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold">
              Ý tưởng #{index + 1}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
              <span>{idea.estimatedBudget}</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{idea.title}</h3>
          <p className="text-xs sm:text-sm font-medium text-indigo-600 mt-0.5 italic">"{idea.tagline}"</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            title="Sao chép tóm tắt ý tưởng"
            aria-label="Sao chép tóm tắt"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              saved
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Đã lưu Shortlist</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Lưu vào Shortlist</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Channels & Audience */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
        <span className="text-xs text-slate-400 font-medium">Kênh:</span>
        {idea.channels.map((ch, idx) => (
          <span
            key={idx}
            className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
          >
            {ch}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-700">Khách hàng mục tiêu: </span>
        <span className="truncate">{idea.targetAudience}</span>
      </div>

      {/* Main Content */}
      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
        <p className="font-semibold text-slate-800 text-xs mb-1 uppercase tracking-wider">Nội dung chiến lược chính:</p>
        <p>{idea.mainContent}</p>
      </div>

      {/* Weekly Timeline (Feature 3) */}
      <WeeklyTimeline timeline={idea.timeline} />
    </article>
  );
}


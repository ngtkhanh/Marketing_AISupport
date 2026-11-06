'use client';

import React, { useState, useEffect } from 'react';
import { MarketingIdea, CampaignInput } from '@/types/marketing';
import { WeeklyTimeline } from './WeeklyTimeline';
import { Bookmark, BookmarkCheck, Copy, Check, Users, DollarSign, Sparkles, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { useShortlist } from '@/hooks/useShortlist';
import { useCampaign } from '@/context/CampaignContext';
import { useToast } from './Toast';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';
import { RefineIdeaModal } from './RefineIdeaModal';
import { ProposalModal } from './proposal/ProposalModal';
import { getProposalByCampaignId } from '@/lib/proposal-storage';

interface IdeaCardProps {
  idea: MarketingIdea;
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  index: number;
}

export function IdeaCard({ idea, context, index }: IdeaCardProps) {
  const { isSaved, saveIdea, removeIdea } = useShortlist();
  const { updateIdea, revertIdea } = useCampaign();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [hasSavedProposal, setHasSavedProposal] = useState(false);

  useEffect(() => {
    const existing = getProposalByCampaignId(idea.id, idea.version || 1);
    setHasSavedProposal(!!existing);
  }, [idea.id, idea.version]);

  const currentVersion = idea.version || 1;
  const saved = isSaved(idea.id, currentVersion);
  const hasHistory = (idea.refinementHistory && idea.refinementHistory.length > 0) || currentVersion > 1;

  const handleToggleSave = () => {
    if (saved) {
      removeIdea(idea.id, currentVersion);
      showToast(`Đã bỏ "${idea.title} (v${currentVersion})" khỏi Shortlist.`, 'info');
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

  const handleApplyRefinement = (refinedIdea: MarketingIdea) => {
    // Áp dụng bản tinh chỉnh mới vào state hiển thị trên màn hình.
    // Các bản lưu cũ trong Shortlist được bảo toàn độc lập hoàn toàn!
    updateIdea(refinedIdea);
  };

  const handleRevert = () => {
    revertIdea(idea.id);
    showToast(`Đã hoàn tác ý tưởng #${index + 1} về phiên bản trước.`, 'info');
  };

  return (
    <article
      id={`idea-card-${index + 1}`}
      className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 relative break-inside-avoid print:border-slate-300"
    >
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
              Ý tưởng #{index + 1}
            </span>

            {currentVersion > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <span>Đã tinh chỉnh (v{currentVersion})</span>
              </span>
            )}

            {hasHistory && (
              <button
                type="button"
                onClick={handleRevert}
                title="Hoàn tác về phiên bản trước"
                aria-label="Hoàn tác phiên bản"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Hoàn tác</span>
              </button>
            )}

            <div className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5 text-slate-500" />
              <span>{idea.estimatedBudget}</span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{idea.title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">"{idea.tagline}"</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsProposalModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs ${
              hasSavedProposal
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
            title="Lập bộ hồ sơ đề xuất chiến dịch hoàn chỉnh (Meeting-Ready Proposal) sẵn sàng trình Sếp duyệt chi"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{hasSavedProposal ? 'Mở Proposal' : 'Lập Proposal'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRefineModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
            title="Tinh chỉnh chiến dịch này bằng ngôn ngữ tự nhiên"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
            <span>Tinh chỉnh</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Sao chép tóm tắt ý tưởng"
            aria-label="Sao chép tóm tắt"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              saved
                ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-slate-300" />
                <span>Lưu Shortlist</span>
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
            className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
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
      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
        <p className="font-semibold text-slate-800 text-xs mb-1 uppercase tracking-wider">Nội dung chiến lược chính:</p>
        <p>{idea.mainContent}</p>
      </div>

      {/* Weekly Timeline (Feature 3) */}
      <WeeklyTimeline timeline={idea.timeline} />

      {/* Modal Tinh chỉnh AI (Mục 2.1) */}
      <RefineIdeaModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        idea={idea}
        context={context}
        onApplyRefinedIdea={handleApplyRefinement}
      />

      {/* Modal Lập Proposal Trình Sếp (Task 8) */}
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        idea={idea}
        context={context}
        onProposalSaved={() => setHasSavedProposal(true)}
      />
    </article>
  );
}


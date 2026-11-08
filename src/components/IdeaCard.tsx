'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MarketingIdea, CampaignInput } from '@/types/marketing';
import { WeeklyTimeline } from './WeeklyTimeline';
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Users,
  DollarSign,
  Sparkles,
  RotateCcw,
  FileSpreadsheet,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  AlertTriangle,
  MoreHorizontal,
  Lightbulb
} from 'lucide-react';
import { useShortlist } from '@/hooks/useShortlist';
import { useCampaign } from '@/context/CampaignContext';
import { useToast } from './Toast';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';
import { RefineIdeaModal } from './RefineIdeaModal';
import { ProposalModal } from './proposal/ProposalModal';
import { getProposalByCampaignId } from '@/lib/proposal-storage';
import { attachVerificationEvidence } from '@/lib/evidence-generator';

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
  const [showEvidence, setShowEvidence] = useState(false);
  const [showMarketingLogic, setShowMarketingLogic] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const evidence = idea.verificationEvidence || attachVerificationEvidence(idea, context as CampaignInput);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

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

        {/* Action Buttons: 2 Nút chính + Menu Thao Tác Phụ (Mục 7) */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Nút 1: Xem bản đề xuất chi tiết */}
          <button
            type="button"
            onClick={() => setIsProposalModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs ${
              hasSavedProposal
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
            title="Xem bản đề xuất chiến dịch hoàn chỉnh (Meeting-Ready Proposal) sẵn sàng trình sếp duyệt chi"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xem bản đề xuất</span>
          </button>

          {/* Nút 2: Lưu vào Shortlist */}
          <button
            type="button"
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
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
                <span>Lưu ý tưởng</span>
              </>
            )}
          </button>

          {/* Nút 3: Menu Thao Tác Phụ (Dropdown) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Thao tác khác"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center"
              title="Thao tác khác: Sao chép tóm tắt, Tinh chỉnh với AI"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-20 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsRefineModalOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Tinh chỉnh với AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleCopy();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép tóm tắt'}</span>
                </button>

                {hasHistory && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleRevert();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer border-t border-slate-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Hoàn tác phiên bản</span>
                  </button>
                )}
              </div>
            )}
          </div>
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

      {/* Logic Marketing 5 Thành Phần (Mức 2 - Mục 5) */}
      {idea.marketingLogic && (
        <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowMarketingLogic(!showMarketingLogic)}
            className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Logic marketing & Điều kiện thành công</span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                5 yếu tố then chốt
              </span>
            </span>
            {showMarketingLogic ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showMarketingLogic && (
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-2.5 text-xs text-slate-700 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <span className="font-bold block mb-1 text-[11px] uppercase tracking-wider text-rose-600">
                    1. Nhu cầu hoặc rào cản khách hàng
                  </span>
                  <p className="leading-relaxed text-slate-600">{idea.marketingLogic.customerBarrierOrNeed}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <span className="font-bold block mb-1 text-[11px] uppercase tracking-wider text-emerald-600">
                    2. Lợi ích giải quyết & Bằng chứng
                  </span>
                  <p className="leading-relaxed text-slate-600">{idea.marketingLogic.productBenefitAndProof}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                <span className="font-bold block mb-1 text-[11px] uppercase tracking-wider text-indigo-600">
                  3. Cơ chế tác động tâm lý & hành vi
                </span>
                <p className="leading-relaxed text-slate-600">{idea.marketingLogic.campaignMechanism}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <span className="font-bold block mb-1 text-[11px] uppercase tracking-wider text-amber-600">
                    4. Hành động mong muốn (CTA)
                  </span>
                  <p className="leading-relaxed text-slate-600 font-medium">{idea.marketingLogic.desiredAction}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <span className="font-bold block mb-1 text-[11px] uppercase tracking-wider text-purple-600">
                    5. Điều kiện tiên quyết để thành công
                  </span>
                  <p className="leading-relaxed text-slate-600">{idea.marketingLogic.successRequirements}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Timeline (Feature 3) */}
      <WeeklyTimeline timeline={idea.timeline} />

      {/* Căn cứ thực chứng & Kế hoạch thử nghiệm nhỏ (P1 - Mục 10.3) */}
      <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden bg-slate-50/40">
        <button
          type="button"
          onClick={() => setShowEvidence(!showEvidence)}
          className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Căn cứ và cách kiểm chứng</span>
            {evidence.hasCaseStudy ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Case study: {evidence.caseStudy?.brandOrEntity}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                Thử nghiệm nhỏ (Chưa có case study)
              </span>
            )}
          </span>
          {showEvidence ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showEvidence && (
          <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white space-y-3.5 text-xs animate-fadeIn">
            {/* 1. Case Study Thực Tế (nếu có) */}
            {evidence.hasCaseStudy && evidence.caseStudy && (
              <div className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/30 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>📌 Tham chiếu thực chiến:</span>
                    <span className="text-indigo-900 font-extrabold">{evidence.caseStudy.brandOrEntity}</span>
                  </div>
                  <a
                    href={evidence.caseStudy.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <span>Nguồn: {evidence.caseStudy.source.publisher}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Hoạt động & Kết quả đã công bố: </span>
                  {evidence.caseStudy.publishedResults}
                </div>

                <div className="text-[11px] text-slate-500 bg-white/80 p-2 rounded border border-indigo-100/60 leading-tight">
                  <span className="font-semibold text-amber-800">⚠️ Giới hạn khi áp dụng: </span>
                  {evidence.caseStudy.applicabilityScope.limitations}
                </div>
              </div>
            )}

            {/* Thông báo nếu chưa có case study tương đồng */}
            {!evidence.hasCaseStudy && (
              <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold">Lưu ý minh bạch: </span>
                  {evidence.missingCaseStudyNotice || 'Chưa có case study tương đồng được xác minh nguồn trong kho dữ liệu tham chiếu.'}{' '}
                  Do đó, bạn nên thực hiện kế hoạch thử nghiệm nhỏ dưới đây trước khi duyệt chi lớn.
                </div>
              </div>
            )}

            {/* 2. Kế hoạch Thử Nghiệm Nhỏ (Mini-Experiment) */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kế hoạch thử nghiệm nhỏ (Khuyên dùng trước khi duyệt chi)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-700">Giả thuyết: </span>
                  <p className="text-slate-600 mt-0.5">{evidence.miniExperiment.hypothesis}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Hành động & Nguồn lực: </span>
                  <p className="text-slate-600 mt-0.5">
                    {evidence.miniExperiment.actionToTest} ({evidence.miniExperiment.timeframeAndResources})
                  </p>
                </div>
              </div>

              {/* Tiêu chí Stop/Go */}
              <div className="pt-1 border-t border-slate-200/80">
                <span className="font-semibold text-slate-700 text-[11px] block mb-1">
                  Ngưỡng đánh giá kết quả (Stop / Go Criteria):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200/60 text-emerald-900">
                    <span className="font-bold">✓ Đi tiếp: </span>
                    {evidence.miniExperiment.decisionCriteria.proceed}
                  </div>
                  <div className="p-1.5 rounded bg-amber-50 border border-amber-200/60 text-amber-900">
                    <span className="font-bold">⚡ Điều chỉnh: </span>
                    {evidence.miniExperiment.decisionCriteria.pivot}
                  </div>
                  <div className="p-1.5 rounded bg-rose-50 border border-rose-200/60 text-rose-900">
                    <span className="font-bold">✕ Dừng lại: </span>
                    {evidence.miniExperiment.decisionCriteria.stop}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tinh chỉnh AI (Mục 2.1) */}
      <RefineIdeaModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        idea={idea}
        context={context}
        onApplyRefinedIdea={handleApplyRefinement}
      />

      {/* Modal Bản Đề Xuất Trình Sếp */}
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


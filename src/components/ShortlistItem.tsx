'use client';

import React, { useState, useEffect } from 'react';
import { ShortlistEntry } from '@/types/marketing';
import { WeeklyTimeline } from './WeeklyTimeline';
import { Copy, Trash2, Check, DollarSign, Calendar, AlertCircle, Star, Edit3, FileSpreadsheet, ShieldCheck, ChevronDown, ChevronUp, ExternalLink, FlaskConical } from 'lucide-react';
import { formatIdeaSummary, copyToClipboard } from '@/lib/format-summary';
import { useToast } from './Toast';
import { ProposalModal } from './proposal/ProposalModal';
import { getProposalByCampaignId } from '@/lib/proposal-storage';
import { attachVerificationEvidence } from '@/lib/evidence-generator';

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
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [hasSavedProposal, setHasSavedProposal] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const evidence = idea.verificationEvidence || attachVerificationEvidence(idea, context as any);

  useEffect(() => {
    const existing = getProposalByCampaignId(idea.id, idea.version || 1);
    setHasSavedProposal(!!existing);
  }, [idea.id, idea.version]);

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
      className={`p-5 sm:p-6 rounded-xl bg-white border transition-colors relative space-y-4 ${
        entry.isPrimary
          ? 'border-slate-900 ring-1 ring-slate-900'
          : isSelected
          ? 'border-slate-700'
          : 'border-slate-200'
      }`}
    >
      {/* Context Badge & Selection Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Checkbox chọn so sánh */}
          {onToggleSelect && (
            <label className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={!isSelected && disableSelect}
                onChange={() => onToggleSelect(entry.id)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-30 cursor-pointer"
              />
              <span className={`text-xs font-medium ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                {isSelected ? 'Đã chọn so sánh' : 'Chọn so sánh'}
              </span>
            </label>
          )}

          {entry.isPrimary && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Ưu tiên số 1</span>
            </span>
          )}

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {context.productName}
            </span>
            <span className="text-slate-500">({context.industry})</span>
            <span className="text-slate-700 bg-slate-100 font-medium px-2 py-0.5 rounded">
              Ngân sách: {context.budgetLevel === 'low' ? 'Thấp' : context.budgetLevel === 'medium' ? 'Trung bình' : 'Cao'}
            </span>
            <span className="text-slate-600 bg-slate-100 font-medium px-2 py-0.5 rounded">
              v{version}
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
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{idea.title}</h3>
            {idea.version && idea.version > 1 && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                v{idea.version}
              </span>
            )}
            <div className="flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5 text-slate-500" />
              <span>{idea.estimatedBudget}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">"{idea.tagline}"</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsProposalModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
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
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép tóm tắt'}</span>
          </button>

          {isConfirmingDelete ? (
            <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2.5 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 transition-colors cursor-pointer"
              >
                Xác nhận xóa
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              title="Xóa khỏi Shortlist"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
            className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="text-sm text-slate-700 bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
        <p className="font-semibold text-slate-800 text-xs mb-1 uppercase tracking-wider">Nội dung chiến lược cốt lõi:</p>
        <p>{idea.mainContent}</p>
      </div>

      {/* Personal Notes (Feature 2.2) */}
      {entry.userNotes && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
          <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-900">Ghi chú cá nhân: </span>
            <span className="text-slate-700">{entry.userNotes}</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <WeeklyTimeline timeline={idea.timeline} />

      {/* Căn cứ thực chứng & Kế hoạch thử nghiệm nhỏ (P1) */}
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/40">
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
          <div className="p-3.5 border-t border-slate-200 bg-white space-y-3 text-xs animate-fadeIn">
            {evidence.hasCaseStudy && evidence.caseStudy && (
              <div className="p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/30 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    📌 Tham chiếu: <span className="text-indigo-900 font-extrabold">{evidence.caseStudy.brandOrEntity}</span>
                  </span>
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
                <div className="text-slate-700 leading-relaxed text-[11px]">
                  {evidence.caseStudy.publishedResults}
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thử nghiệm nhỏ:</span>
              </div>
              <p className="text-slate-600 text-[11px]">{evidence.miniExperiment.hypothesis}</p>
              <p className="text-slate-600 text-[11px]">
                <span className="font-semibold text-slate-700">Hành động: </span>
                {evidence.miniExperiment.actionToTest} ({evidence.miniExperiment.timeframeAndResources})
              </p>
            </div>
          </div>
        )}
      </div>

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


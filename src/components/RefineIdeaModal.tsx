'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MarketingIdea, CampaignInput, RefineIdeaResponse } from '@/types/marketing';
import {
  Sparkles,
  X,
  Loader2,
  Check,
  ArrowRight,
  RotateCcw,
  DollarSign,
  Users,
  Tv,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from './Toast';

interface RefineIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: MarketingIdea;
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  onApplyRefinedIdea: (refinedIdea: MarketingIdea) => void;
}

const QUICK_PROMPTS = [
  {
    icon: '💰',
    label: 'Giảm chi phí',
    prompt: 'Giảm bớt ngân sách triển khai, tối ưu các kênh organic tiết kiệm chi phí.'
  },
  {
    icon: '📱',
    label: 'Ưu tiên TikTok',
    prompt: 'Ưu tiên phân phối qua TikTok & short video bắt trend, bổ sung CapCut template.'
  },
  {
    icon: '🎯',
    label: 'Đổi tệp sang Gen Z',
    prompt: 'Đổi khách hàng mục tiêu sang giới trẻ Gen Z và sinh viên năng động.'
  },
  {
    icon: '✨',
    label: 'Slogan bắt trend',
    prompt: 'Giữ ý tưởng cốt lõi nhưng đổi sang một slogan bắt tai, viral hơn.'
  },
  {
    icon: '⚡',
    label: 'Đơn giản hóa thực thi',
    prompt: 'Đơn giản hóa các hoạt động trong 4 tuần để triển khai nhanh và dễ làm nhất.'
  }
];

export function RefineIdeaModal({
  isOpen,
  onClose,
  idea,
  context,
  onApplyRefinedIdea
}: RefineIdeaModalProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refinedResult, setRefinedResult] = useState<RefineIdeaResponse | null>(null);
  const [activeDiffTab, setActiveDiffTab] = useState<'sideBySide' | 'summary'>('sideBySide');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset state mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setInstruction('');
      setErrorMessage(null);
      setRefinedResult(null);
      setActiveDiffTab('sideBySide');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, idea]);

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleQuickPromptClick = (promptText: string) => {
    setInstruction(promptText);
    setErrorMessage(null);
    textareaRef.current?.focus();
  };

  const handleSendRefineRequest = async () => {
    const trimmed = instruction.trim();
    if (trimmed.length < 3) {
      setErrorMessage('Vui lòng nhập yêu cầu ít nhất 3 ký tự (hoặc chọn gợi ý nhanh bên dưới).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/refine-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: idea.id,
          currentIdea: idea,
          context,
          instruction: trimmed
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const msg = data.error?.message || 'Không thể tinh chỉnh ý tưởng vào lúc này. Vui lòng thử lại!';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      setRefinedResult(data);
      showToast('Đã tạo bản tinh chỉnh mới thành công!', 'success');
    } catch {
      const msg = 'Lỗi kết nối máy chủ khi tinh chỉnh. Vui lòng thử lại!';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!refinedResult?.refinedIdea) return;
    onApplyRefinedIdea(refinedResult.refinedIdea);
    showToast(`Đã áp dụng bản tinh chỉnh v${refinedResult.refinedIdea.version || 2}!`, 'success');
    onClose();
  };

  const handleDiscardAndReset = () => {
    setRefinedResult(null);
    setInstruction('');
    setErrorMessage(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const currentVersion = idea.version || 1;
  const nextVersion = (refinedResult?.refinedIdea.version) || currentVersion + 1;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="refine-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Sparkles className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <h2 id="refine-modal-title" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Tinh chỉnh chiến dịch</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  v{currentVersion}
                </span>
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-md">
                Đang sửa: <span className="font-medium text-slate-700">{idea.title}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="flex-1">{errorMessage}</p>
            </div>
          )}

          {!refinedResult ? (
            /* STEP 1: FORM NHẬP YÊU CẦU */
            <div className="space-y-4">
              <div>
                <label htmlFor="refine-instruction-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Bạn muốn thay đổi hoặc cải thiện điều gì ở ý tưởng này?
                </label>
                <div className="relative">
                  <textarea
                    id="refine-instruction-input"
                    ref={textareaRef}
                    rows={3}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    maxLength={300}
                    disabled={isLoading}
                    placeholder="VD: Giảm ngân sách xuống mức tiết kiệm nhất, chuyển sang tập trung kênh TikTok và đổi slogan bắt trend hơn..."
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-colors resize-none text-slate-800 placeholder:text-slate-400"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] sm:text-xs text-slate-400">
                    {instruction.length}/300
                  </span>
                </div>
              </div>

              {/* Gợi ý prompt nhanh */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Gợi ý yêu cầu nhanh (Click để chọn):</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {QUICK_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPromptClick(item.prompt)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hộp tóm tắt hiện trạng */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-700 uppercase tracking-wide text-[10px]">Thông số hiện tại của chiến dịch:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400">Slogan:</span> <span className="font-medium text-slate-800">"{idea.tagline}"</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Ngân sách:</span> <span className="font-medium text-slate-800">{idea.estimatedBudget}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Kênh:</span> <span className="font-medium text-slate-800">{idea.channels.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: BEFORE / AFTER COMPARISON & DIFF */
            <div className="space-y-4">
              {/* Lý do thay đổi & Thay đổi chính */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-indigo-900">Chiến lược điều chỉnh từ AI CMO:</span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                  {refinedResult.changeReason}
                </p>

                {refinedResult.changesSummary.length > 0 && (
                  <ul className="pt-2 border-t border-indigo-200/60 space-y-1">
                    {refinedResult.changesSummary.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-indigo-900">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bảng so sánh Trước & Sau (Diff View) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-100 text-xs font-semibold text-slate-700 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Bản gốc (v{currentVersion})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Bản mới đề xuất (v{nextVersion})
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Slogan */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Slogan gốc:</p>
                      <p className="text-slate-600 italic">"{idea.tagline}"</p>
                    </div>
                    <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">Slogan mới:</p>
                      <p className="font-semibold text-emerald-950 italic">"{refinedResult.refinedIdea.tagline}"</p>
                    </div>
                  </div>

                  {/* Ngân sách */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/40">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Ngân sách gốc:
                      </p>
                      <p className="text-slate-700">{idea.estimatedBudget}</p>
                    </div>
                    <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Ngân sách mới:
                      </p>
                      <p className="font-semibold text-emerald-900">{refinedResult.refinedIdea.estimatedBudget}</p>
                    </div>
                  </div>

                  {/* Kênh */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                        <Tv className="w-3 h-3" /> Kênh triển khai:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {idea.channels.map((ch, i) => (
                          <span key={i} className="text-[11px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                        <Tv className="w-3 h-3" /> Kênh mới:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {refinedResult.refinedIdea.channels.map((ch, i) => (
                          <span key={i} className="text-[11px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Khách hàng mục tiêu */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/40">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Khách hàng mục tiêu:
                      </p>
                      <p className="text-slate-600 line-clamp-2">{idea.targetAudience}</p>
                    </div>
                    <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Tệp mục tiêu mới:
                      </p>
                      <p className="text-emerald-950 font-medium line-clamp-2">{refinedResult.refinedIdea.targetAudience}</p>
                    </div>
                  </div>

                  {/* Nội dung chiến lược */}
                  <div className="p-3 bg-white space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Nội dung chiến lược mới:
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {refinedResult.refinedIdea.mainContent}
                    </p>
                  </div>

                  {/* Timeline 4 tuần được đồng bộ */}
                  <div className="p-3 bg-slate-50/70 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-600" /> Kế hoạch 4 tuần đã điều chỉnh theo thay đổi:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {refinedResult.refinedIdea.timeline.map((w) => (
                        <div key={w.week} className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-2xs">
                          <p className="font-bold text-indigo-700">Tuần {w.week}: {w.title}</p>
                          <ul className="text-slate-600 space-y-1 list-disc pl-3.5 leading-snug">
                            {w.activities.map((act, actIdx) => (
                              <li key={actIdx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 bg-white">
          {!refinedResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleSendRefineRequest}
                disabled={isLoading || instruction.trim().length < 3}
                className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích & tinh chỉnh...</span>
                  </>
                ) : (
                  <>
                    <span>Bắt đầu tinh chỉnh</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDiscardAndReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Thử yêu cầu khác</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Áp dụng (v{nextVersion})</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}


'use client';

import React, { useState, useRef } from 'react';
import { CampaignInput } from '@/types/marketing';
import { CampaignForm } from '@/components/CampaignForm';
import { SelfRunningDemo } from '@/components/SelfRunningDemo';
import { Hero } from '@/components/Hero';
import { IdeaStack } from '@/components/IdeaStack';
import { SkeletonIdeaList } from '@/components/Skeleton';
import { AILoadingStatus } from '@/components/AILoadingStatus';
import { IdeaJumpNav } from '@/components/IdeaJumpNav';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SourceBadge } from '@/components/SourceBadge';
import { Sparkles, Compass, Bookmark, BookmarkCheck, RotateCcw, FileText, Printer } from 'lucide-react';
import { useCampaign } from '@/context/CampaignContext';
import { useShortlist } from '@/hooks/useShortlist';
import { useToast } from '@/components/Toast';
import { exportCampaignToDocx, printCampaignReport } from '@/lib/export-report';
import { BUDGET_CONFIGS } from '@/lib/config/budget';

export default function HomePage() {
  const { ideas, setIdeas, lastInput, setLastInput, clearAllCampaignData } = useCampaign();
  const { isSaved, saveMultipleIdeas } = useShortlist();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [resultSource, setResultSource] = useState<'ai' | 'mock'>('ai');
  const [resultModel, setResultModel] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [activeIdeaIndex, setActiveIdeaIndex] = useState<number>(0);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const savedCount = ideas.filter((idea) => isSaved(idea.id, idea.version || 1)).length;
  const allSaved = ideas.length > 0 && savedCount === ideas.length;

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResetAll = () => {
    clearAllCampaignData();
    setErrorMessage(null);
    setErrorCode(undefined);
    setServerFieldErrors({});
    setActiveIdeaIndex(0);
    showToast('Đã làm mới thông tin chiến dịch và đề xuất ý tưởng', 'info');
  };

  const handleSaveAll = () => {
    if (!lastInput || ideas.length === 0) return;
    const res = saveMultipleIdeas(ideas, lastInput);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleExportWord = async () => {
    if (!lastInput || ideas.length === 0) return;
    setIsExportingDocx(true);
    showToast('Đang tạo và định dạng file Word (.docx)...', 'info');
    try {
      await exportCampaignToDocx(ideas, lastInput);
      showToast('Đã tải xuống file Word (.docx) thành công!', 'success');
    } catch (err) {
      console.error('Word export error:', err);
      showToast('Không thể xuất file Word. Vui lòng thử lại.', 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    if (ideas.length === 0) return;
    printCampaignReport();
  };

  const handleGenerate = async (input: CampaignInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(undefined);
    setServerFieldErrors({});
    setLastInput(input);

    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const message = data?.error?.message || 'Không thể tạo ý tưởng vào lúc này. Vui lòng thử lại.';
        setErrorMessage(message);
        setErrorCode(data?.error?.code);
        if (data?.error?.fieldErrors) {
          setServerFieldErrors(data.error.fieldErrors);
        }
        return;
      }

      setIdeas(data.ideas || []);
      setResultSource(data.source || 'ai');
      setResultModel(data.model);
      setActiveIdeaIndex(0);

      // Cuộn mượt xuống vùng kết quả
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau ít phút.');
      setErrorCode('NETWORK_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleGenerate(lastInput);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* 1. Full-Bleed Edge-to-Edge CFI Dark Hero Background */}
      <Hero
        onScrollToForm={handleScrollToForm}
        onScrollToResults={handleScrollToResults}
        hasResults={ideas.length > 0}
      />

      {/* 2. Workspace Content (Centered max-w-7xl) - Nổi mềm mại trên lớp sóng mây uốn lượn */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 lg:-mt-28 relative z-20 space-y-8 pb-16">
        {/* Vùng tương tác chính: Split Screen 2 cột trên Desktop (Trái: Form - Phải: Demo Screencast) */}
        <section ref={formRef} className="scroll-mt-6 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Cột Trái: Form nhập liệu Wizard 3 bước (Trên mobile xếp sau demo: order-2) */}
            <div className="order-2 lg:order-1 lg:col-span-7">
              <CampaignForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
                serverFieldErrors={serverFieldErrors}
                onReset={() => {
                  setErrorMessage(null);
                  setErrorCode(undefined);
                  setServerFieldErrors({});
                }}
              />
            </div>

            {/* Cột Phải: Demo Screencast góc nhìn người dùng thật (Trên mobile đưa lên đầu: order-1) */}
            <div className="order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-8">
              <SelfRunningDemo />
            </div>
          </div>
        </section>

        {/* Vùng hiển thị lỗi (nếu có) */}
        {errorMessage && (
          <section className="print:hidden">
            <ErrorBanner message={errorMessage} code={errorCode} onRetry={handleRetry} />
          </section>
        )}

        {/* Vùng kết quả (Feature 2 & 3) */}
        <div ref={resultsRef} className="scroll-mt-6">
          {isLoading && (
            <section className="space-y-5">
              <AILoadingStatus />
              <SkeletonIdeaList />
            </section>
          )}

          {!isLoading && ideas.length > 0 && lastInput && (
            <section className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-600" />
                    <span>05 đề xuất chiến dịch marketing cho bạn</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Đã cá nhân hóa cho sản phẩm <strong>"{lastInput.productName}"</strong> · Ngân sách{' '}
                    <span className="font-bold text-slate-800">
                      {BUDGET_CONFIGS[lastInput.budgetLevel]?.label || lastInput.budgetLevel}
                    </span>
                    <span className="text-slate-400 font-mono text-xs ml-1">
                      ({BUDGET_CONFIGS[lastInput.budgetLevel]?.rangeText})
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleExportWord}
                    disabled={isExportingDocx}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-indigo-200 cursor-pointer print:hidden shadow-xs disabled:opacity-60"
                    title="Tải toàn bộ 05 ý tưởng chiến dịch dưới dạng file Word (.docx)"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isExportingDocx ? 'Đang xuất Word...' : 'Tải file Word (.docx)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer print:hidden shadow-xs"
                    title="In hoặc Lưu toàn bộ 05 ý tưởng thành file PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>In / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 cursor-pointer print:hidden shadow-xs"
                    title="Làm mới form và xóa toàn bộ ý tưởng đề xuất"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Làm mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={allSaved}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors print:hidden shadow-xs ${
                      allSaved
                        ? 'bg-slate-100 text-slate-600 border border-slate-200 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                    }`}
                    title={allSaved ? 'Toàn bộ 5 ý tưởng đã có trong Shortlist' : 'Lưu tất cả ý tưởng vào Shortlist'}
                  >
                    {allSaved ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                        <span>Đã lưu cả 5 ý tưởng ({savedCount}/5)</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-slate-300" />
                        <span>Lưu tất cả vào Shortlist {savedCount > 0 ? `(${savedCount}/5)` : ''}</span>
                      </>
                    )}
                  </button>

                  {/* Badge nguồn AI thật / Demo dự phòng */}
                  <div className="print:hidden">
                    <SourceBadge source={resultSource} model={resultModel} />
                  </div>
                </div>
              </div>

              {/* Bố cục xếp chồng lớp 3D (WACT Stacked Card Deck) cho 5 ý tưởng */}
              <IdeaStack
                ideas={ideas}
                context={lastInput}
                activeIndex={activeIdeaIndex}
                onSelectIndex={(idx) => setActiveIdeaIndex(idx)}
              />
            </section>
          )}
        </div>
      </div>

      {/* Thanh điều hướng nhanh giữa các ý tưởng đồng bộ với Stack */}
      <IdeaJumpNav
        ideas={ideas}
        activeId={activeIdeaIndex + 1}
        onSelect={(num) => {
          setActiveIdeaIndex(num - 1);
          if (resultsRef.current) {
            const yOffset = -80;
            const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}


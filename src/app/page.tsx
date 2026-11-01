'use client';

import React, { useState, useRef } from 'react';
import { CampaignInput } from '@/types/marketing';
import { CampaignForm } from '@/components/CampaignForm';
import { IdeaCard } from '@/components/IdeaCard';
import { SkeletonIdeaList } from '@/components/Skeleton';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SourceBadge } from '@/components/SourceBadge';
import { Sparkles, Compass, Bookmark, BookmarkCheck, RotateCcw } from 'lucide-react';
import { useCampaign } from '@/context/CampaignContext';
import { useShortlist } from '@/hooks/useShortlist';
import { useToast } from '@/components/Toast';

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

  const resultsRef = useRef<HTMLDivElement>(null);

  const savedCount = ideas.filter((idea) => isSaved(idea.id)).length;
  const allSaved = ideas.length > 0 && savedCount === ideas.length;

  const handleResetAll = () => {
    clearAllCampaignData();
    setErrorMessage(null);
    setErrorCode(undefined);
    setServerFieldErrors({});
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero section */}
      <section className="text-center max-w-2xl mx-auto space-y-3 pt-2 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Giải pháp Marketing Đột Phá Bằng Trí Tuệ Nhân Tạo</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Đề Xuất Ý Tưởng Marketing <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Khả Thi Theo Từng Mức Ngân Sách
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Đập tan nỗi đau bí ý tưởng. Nhận ngay 05 đề xuất chiến dịch marketing chi tiết, đúng ngân sách thực tế kèm timeline hành động 04 tuần cụ thể.
        </p>
      </section>

      {/* Form nhập thông tin chiến dịch (Feature 1) */}
      <section>
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
      </section>

      {/* Vùng hiển thị lỗi (nếu có) */}
      {errorMessage && (
        <section>
          <ErrorBanner message={errorMessage} code={errorCode} onRetry={handleRetry} />
        </section>
      )}

      {/* Vùng kết quả (Feature 2 & 3) */}
      <div ref={resultsRef}>
        {isLoading && (
          <section className="space-y-4">
            <SkeletonIdeaList />
          </section>
        )}

        {!isLoading && ideas.length > 0 && lastInput && (
          <section className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-6 h-6 text-indigo-600" />
                  <span>05 Đề Xuất Chiến Dịch Marketing Cho Bạn</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Đã cá nhân hóa cho sản phẩm <strong>"{lastInput.productName}"</strong> · Ngân sách{' '}
                  <span className="font-semibold text-indigo-600 uppercase">{lastInput.budgetLevel}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 shadow-sm cursor-pointer active:scale-95"
                  title="Làm mới form và xóa toàn bộ ý tưởng đề xuất"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm mới</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={allSaved}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    allSaved
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer shadow-sm hover:shadow'
                  }`}
                  title={allSaved ? 'Toàn bộ 5 ý tưởng đã có trong Shortlist' : 'Lưu tất cả ý tưởng vào Shortlist'}
                >
                  {allSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-amber-600" />
                      <span>Đã lưu cả 5 ý tưởng ({savedCount}/5)</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-indigo-600" />
                      <span>Lưu tất cả vào Shortlist {savedCount > 0 ? `(${savedCount}/5)` : ''}</span>
                    </>
                  )}
                </button>

                {/* Badge nguồn AI thật / Demo dự phòng */}
                <SourceBadge source={resultSource} model={resultModel} />
              </div>
            </div>

            {/* Danh sách 05 ý tưởng */}
            <div className="space-y-5">
              {ideas.map((idea, idx) => (
                <IdeaCard key={idea.id} idea={idea} context={lastInput} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


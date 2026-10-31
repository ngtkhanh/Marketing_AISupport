'use client';

import React, { useState, useRef } from 'react';
import { CampaignInput, MarketingIdea } from '@/types/marketing';
import { CampaignForm } from '@/components/CampaignForm';
import { IdeaCard } from '@/components/IdeaCard';
import { SkeletonIdeaList } from '@/components/Skeleton';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SourceBadge } from '@/components/SourceBadge';
import { Sparkles, Compass } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [resultSource, setResultSource] = useState<'ai' | 'mock'>('ai');
  const [resultModel, setResultModel] = useState<string | undefined>();
  const [lastInput, setLastInput] = useState<CampaignInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (input: CampaignInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(undefined);
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
        <CampaignForm onSubmit={handleGenerate} isLoading={isLoading} />
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

              {/* Badge nguồn AI thật / Demo dự phòng */}
              <SourceBadge source={resultSource} model={resultModel} />
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


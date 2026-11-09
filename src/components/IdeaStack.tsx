'use client';

import React, { useState, useEffect } from 'react';
import { MarketingIdea, CampaignInput } from '@/types/marketing';
import { IdeaCard } from './IdeaCard';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface IdeaStackProps {
  ideas: MarketingIdea[];
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
}

export function IdeaStack({
  ideas,
  context,
  activeIndex,
  onSelectIndex,
}: IdeaStackProps) {
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  if (!ideas || ideas.length === 0) return null;

  const currentIdea = ideas[activeIndex] || ideas[0];
  const nextIndex1 = (activeIndex + 1) % ideas.length;
  const nextIndex2 = (activeIndex + 2) % ideas.length;

  const nextIdea1 = ideas[nextIndex1];
  const nextIdea2 = ideas[nextIndex2];

  const handleSelectWithDirection = (targetIndex: number) => {
    if (targetIndex === activeIndex) return;
    if (targetIndex > activeIndex || (activeIndex === ideas.length - 1 && targetIndex === 0)) {
      setDirection('next');
    } else {
      setDirection('prev');
    }
    onSelectIndex(targetIndex);
  };

  const handlePrev = () => {
    setDirection('prev');
    onSelectIndex(activeIndex === 0 ? ideas.length - 1 : activeIndex - 1);
  };

  const handleNext = () => {
    setDirection('next');
    onSelectIndex(activeIndex === ideas.length - 1 ? 0 : activeIndex + 1);
  };

  // Hỗ trợ phím mũi tên bàn phím (Trái / Phải) lật thẻ mượt mà
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, ideas.length]);

  return (
    <div className="space-y-4">
      {/* 1. Thanh điều khiển tầng thẻ (WACT Stack Controller Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Ý tưởng 0{activeIndex + 1} / 0{ideas.length}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang hiển thị
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-sm">
              {currentIdea.title}
            </p>
          </div>
        </div>

        {/* Bộ nút chọn tab nhanh chuẩn phong cách WACT (Pill Tabs) */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Segmented Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            {ideas.map((_, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectWithDirection(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                  title={`Xem ý tưởng #${idx + 1}`}
                >
                  #{idx + 1}
                </button>
              );
            })}
          </div>

          {/* Nút điều hướng Trước / Sau dạng viên thuốc */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Ý tưởng trước (Phím mũi tên Trái)"
              aria-label="Ý tưởng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Ý tưởng tiếp theo (Phím mũi tên Phải)"
              aria-label="Ý tưởng tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Cụm thẻ xếp chồng 3D với 2 tầng lấp ló nổi bật (Layered 3D Deck) */}
      <div className="relative pt-16 sm:pt-20">
        {/* Lớp nền 2 (Xa nhất): Thẻ thứ 3 trồi lên cao nhất */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelectWithDirection(nextIndex2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectWithDirection(nextIndex2);
            }
          }}
          className="group absolute top-0 inset-x-8 sm:inset-x-12 h-20 sm:h-24 rounded-t-2xl sm:rounded-t-3xl border-2 border-slate-300/90 bg-gradient-to-r from-slate-200 via-slate-100 to-indigo-100/70 shadow-md cursor-pointer hover:-translate-y-2 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 z-0 flex items-start justify-between px-4 sm:px-6 pt-2 select-none"
          title={`Click để chuyển sang ý tưởng #${nextIndex2 + 1}: ${nextIdea2.title}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-mono font-bold text-[11px] flex items-center justify-center shadow-xs">
              0{nextIndex2 + 1}
            </span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[170px] sm:max-w-md">
              {nextIdea2.title}
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-300/70 text-slate-700 hidden md:inline">
              Phương án #{nextIndex2 + 1}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
            <span className="hidden sm:inline">Click chọn</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Lớp nền 1 (Giữa): Thẻ kế tiếp lấp ló ngay sau thẻ chính */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelectWithDirection(nextIndex1)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectWithDirection(nextIndex1);
            }
          }}
          className="group absolute top-8 sm:top-10 inset-x-4 sm:inset-x-6 h-20 sm:h-24 rounded-t-2xl sm:rounded-t-3xl border-2 border-indigo-200/90 bg-gradient-to-r from-indigo-50/95 via-white to-indigo-50/80 shadow-lg cursor-pointer hover:-translate-y-2 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 z-10 flex items-start justify-between px-4 sm:px-6 pt-2 select-none"
          title={`Click để chuyển sang ý tưởng #${nextIndex1 + 1}: ${nextIdea1.title}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono font-bold text-[11px] flex items-center justify-center shadow-xs">
              0{nextIndex1 + 1}
            </span>
            <span className="text-xs font-bold text-indigo-950 truncate max-w-[170px] sm:max-w-md">
              {nextIdea1.title}
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 hidden md:inline">
              Kế tiếp
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
            <span>Xem ngay</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Thẻ chính hiển thị ở mặt tiền (Foreground Active Card - z-20) */}
        <div className="relative z-20 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 overflow-hidden bg-white">
          <div
            key={`${currentIdea.id}-${activeIndex}`}
            className={direction === 'prev' ? 'animate-deck-prev' : 'animate-deck-next'}
          >
            <IdeaCard
              idea={currentIdea}
              context={context}
              index={activeIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


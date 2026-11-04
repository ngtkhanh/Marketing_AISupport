'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp, Navigation } from 'lucide-react';
import { MarketingIdea } from '@/types/marketing';

interface IdeaJumpNavProps {
  ideas: MarketingIdea[];
}

export function IdeaJumpNav({ ideas }: IdeaJumpNavProps) {
  const [activeId, setActiveId] = useState<number>(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Chỉ hiển thị Jump Nav khi người dùng đã cuộn qua hơn 300px
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 320);

      // Xác định card nào đang ở trong viewport
      for (let i = 1; i <= ideas.length; i++) {
        const el = document.getElementById(`idea-card-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Nếu phần trên của card cách đỉnh màn hình dưới 300px và phần dưới vẫn còn thấy
          if (rect.top <= 250 && rect.bottom >= 150) {
            setActiveId(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ideas]);

  const scrollToIdea = (idx: number) => {
    const el = document.getElementById(`idea-card-${idx}`);
    if (el) {
      const yOffset = -80; // Trừ khoảng trống cho fixed header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(idx);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible || ideas.length === 0) return null;

  return (
    <nav
      aria-label="Thanh điều hướng nhanh ý tưởng"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 shadow-lg rounded-lg px-2.5 py-1.5 flex items-center gap-1 sm:gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[94vw] overflow-x-auto print:hidden"
    >
      <div className="hidden sm:flex items-center gap-1.5 pl-1 pr-2 text-xs font-medium text-slate-500 border-r border-slate-200">
        <Navigation className="w-3.5 h-3.5 text-slate-400" />
        <span>Ý tưởng:</span>
      </div>

      <div className="flex items-center gap-1">
        {ideas.map((idea, idx) => {
          const num = idx + 1;
          const isActive = activeId === num;

          return (
            <button
              key={idea.id || num}
              type="button"
              onClick={() => scrollToIdea(num)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={`Cuộn đến Ý tưởng #${num}: ${idea.title}`}
            >
              #{num}
            </button>
          );
        })}
      </div>

      <div className="border-l border-slate-200 pl-1.5 ml-0.5">
        <button
          type="button"
          onClick={scrollToTop}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}


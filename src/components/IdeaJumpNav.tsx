'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp, Navigation } from 'lucide-react';
import { MarketingIdea } from '@/types/marketing';

interface IdeaJumpNavProps {
  ideas: MarketingIdea[];
  activeId?: number;
  onSelect?: (idx: number) => void;
}

export function IdeaJumpNav({ ideas, activeId: controlledActiveId, onSelect }: IdeaJumpNavProps) {
  const [internalActiveId, setInternalActiveId] = useState<number>(1);
  const [isVisible, setIsVisible] = useState(false);

  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  useEffect(() => {
    const handleScroll = () => {
      // Chỉ hiển thị Jump Nav khi người dùng đã cuộn qua hơn 300px
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 320);

      // Nếu không dùng controlled activeId thì mới tự tính theo viewport
      if (controlledActiveId === undefined) {
        for (let i = 1; i <= ideas.length; i++) {
          const el = document.getElementById(`idea-card-${i}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 250 && rect.bottom >= 150) {
              setInternalActiveId(i);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ideas, controlledActiveId]);

  const scrollToIdea = (idx: number) => {
    if (onSelect) {
      onSelect(idx);
      return;
    }

    const el = document.getElementById(`idea-card-${idx}`);
    if (el) {
      const yOffset = -80; // Trừ khoảng trống cho fixed header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setInternalActiveId(idx);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible || ideas.length === 0) return null;

  return (
    <nav
      aria-label="Thanh điều hướng nhanh ý tưởng"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-full px-3 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[94vw] overflow-x-auto print:hidden"
    >
      <div className="hidden sm:flex items-center gap-1.5 pl-2 pr-2 text-xs font-bold text-slate-700 border-r border-slate-200">
        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
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
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/30'
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
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}


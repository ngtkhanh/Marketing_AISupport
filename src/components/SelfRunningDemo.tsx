'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { DEMO_SCENES, DEMO_DATA } from '@/lib/data/demo-data';

type DemoSubStep =
  | 'p1_focus_industry'
  | 'p1_typing_industry'
  | 'p1_focus_product'
  | 'p1_typing_product'
  | 'p1_click_next'
  | 'p2_focus_chip'
  | 'p2_click_chip'
  | 'p2_click_next'
  | 'p3_focus_budget'
  | 'p3_click_budget'
  | 'p3_click_submit'
  | 'p4_view_ideas'
  | 'p4_click_save'
  | 'p4_callout';

// Bảng tọa độ phần trăm (%) chuẩn xác tuyệt đối đến từng tâm nút và ô nhập
const SUBSTEP_COORDINATES: Record<DemoSubStep, { x: number; y: number }> = {
  p1_focus_industry: { x: 32, y: 22 },
  p1_typing_industry: { x: 32, y: 22 },
  p1_focus_product: { x: 36, y: 39 },
  p1_typing_product: { x: 36, y: 39 },
  p1_click_next: { x: 78, y: 53 },
  p2_focus_chip: { x: 22, y: 34 },
  p2_click_chip: { x: 22, y: 34 },
  p2_click_next: { x: 78, y: 51 },
  p3_focus_budget: { x: 19, y: 22 },
  p3_click_budget: { x: 19, y: 22 },
  p3_click_submit: { x: 50, y: 51 },
  p4_view_ideas: { x: 88, y: 17 },
  p4_click_save: { x: 88, y: 17 },
  p4_callout: { x: 87, y: 85 },
};

export function SelfRunningDemo() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4>(1);
  const [subStep, setSubStep] = useState<DemoSubStep>('p1_focus_industry');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(false);

  // Vị trí con trỏ chuột bám đích 100% theo bảng tọa độ vàng
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>(SUBSTEP_COORDINATES.p1_focus_industry);
  const [isClicking, setIsClicking] = useState<boolean>(false);

  // Typed values & active highlights
  const [typedIndustry, setTypedIndustry] = useState<string>('');
  const [typedProductName, setTypedProductName] = useState<string>('');
  const [selectedObjectiveChip, setSelectedObjectiveChip] = useState<boolean>(false);
  const [typedObjective, setTypedObjective] = useState<string>('');
  const [selectedBudgetLevel, setSelectedBudgetLevel] = useState<'low' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavedInShortlist, setIsSavedInShortlist] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<number>(0);

  // 1. Kiểm tra prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) setIsPlaying(false);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setIsPlaying(false);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 2. Tạm dừng khi tab ẩn hoặc cuộn khỏi viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) setIsPlaying(false);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  // 3. Đồng bộ tức thì vị trí con trỏ chuột khi subStep thay đổi
  useEffect(() => {
    const target = SUBSTEP_COORDINATES[subStep];
    if (target) {
      setCursorPos(target);
    }
  }, [subStep]);

  // 4. Kịch bản mô phỏng tuần tự (Chu kỳ 24s: 96 ticks, mỗi tick = 250ms)
  useEffect(() => {
    if (!isPlaying || prefersReducedMotion || !isVisible) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current % 96;

      // =======================================================================
      // BƯỚC 1: SẢN PHẨM (ticks 0 - 23: 0s - 6s)
      // =======================================================================
      if (t < 24) {
        if (t === 0) {
          setCurrentPhase(1);
          setSubStep('p1_focus_industry');
          setTypedIndustry('');
          setTypedProductName('');
          setSelectedObjectiveChip(false);
          setTypedObjective('');
          setSelectedBudgetLevel(null);
          setIsSubmitting(false);
          setIsSavedInShortlist(false);
          setIsClicking(false);
        }

        // Ticks 1..2: Click vào ô Ngành hàng
        if (t === 1) {
          setIsClicking(true);
        } else if (t === 2) {
          setIsClicking(false);
          setSubStep('p1_typing_industry');
        }

        // Ticks 3..7: Gõ từng chữ ngành hàng
        if (t >= 3 && t < 8) {
          const text = 'F&B (Đồ uống & Trà sữa)';
          const count = Math.min(text.length, Math.floor(((t - 2) / 5) * text.length));
          setTypedIndustry(text.slice(0, count));
        }

        // Ticks 8..10: Di chuột tới ô Tên sản phẩm và Click
        if (t === 8) {
          setSubStep('p1_focus_product');
        } else if (t === 9) {
          setIsClicking(true);
        } else if (t === 10) {
          setIsClicking(false);
          setSubStep('p1_typing_product');
        }

        // Ticks 11..16: Gõ tên sản phẩm
        if (t >= 11 && t < 17) {
          const text = 'Trà Sữa Trân Châu Mộc Trà';
          const count = Math.min(text.length, Math.floor(((t - 10) / 6) * text.length));
          setTypedProductName(text.slice(0, count));
        }

        // Ticks 17..23: Di chuột tới nút Tiếp tục và Click
        if (t === 18) {
          setSubStep('p1_click_next');
        } else if (t === 21) {
          setIsClicking(true);
        } else if (t === 22) {
          setIsClicking(false);
        }
      }

      // =======================================================================
      // BƯỚC 2: MỤC TIÊU (ticks 24 - 47: 6s - 12s)
      // =======================================================================
      else if (t < 48) {
        if (t === 24) {
          setCurrentPhase(2);
          setSubStep('p2_focus_chip');
          setIsClicking(false);
        }

        // Ticks 26..28: Click chip "Nhận diện thương hiệu"
        if (t === 26) {
          setIsClicking(true);
          setSelectedObjectiveChip(true);
          setTypedObjective('Tăng nhận diện thương hiệu trong giới trẻ');
          setSubStep('p2_click_chip');
        } else if (t === 27) {
          setIsClicking(false);
        }

        // Ticks 38..44: Di chuột xuống nút Tiếp tục của bước 2 và Click
        if (t === 38) {
          setSubStep('p2_click_next');
        } else if (t === 43) {
          setIsClicking(true);
        } else if (t === 44) {
          setIsClicking(false);
        }
      }

      // =======================================================================
      // BƯỚC 3: NGÂN SÁCH (ticks 48 - 67: 12s - 17s)
      // =======================================================================
      else if (t < 68) {
        if (t === 48) {
          setCurrentPhase(3);
          setSubStep('p3_focus_budget');
          setIsClicking(false);
        }

        // Ticks 50..52: Click chọn thẻ ngân sách Thấp
        if (t === 51) {
          setIsClicking(true);
          setSelectedBudgetLevel('low');
          setSubStep('p3_click_budget');
        } else if (t === 52) {
          setIsClicking(false);
        }

        // Ticks 56..62: Di chuột tới nút CTA Tạo ý tưởng và Click
        if (t === 56) {
          setSubStep('p3_click_submit');
        } else if (t === 60) {
          setIsClicking(true);
          setIsSubmitting(true);
        } else if (t === 61) {
          setIsClicking(false);
        }
      }

      // =======================================================================
      // BƯỚC 4: KẾT QUẢ & LƯU SHORTLIST (ticks 68 - 95: 17s - 24s)
      // =======================================================================
      else {
        if (t === 68) {
          setCurrentPhase(4);
          setIsSubmitting(false);
          setSubStep('p4_view_ideas');
          setIsClicking(false);
        }

        // Ticks 76..82: Di chuột tới nút Lưu Shortlist trên thẻ ý tưởng #1 và Click
        if (t === 76) {
          setSubStep('p4_click_save');
        } else if (t === 80) {
          setIsClicking(true);
          setIsSavedInShortlist(true);
        } else if (t === 81) {
          setIsClicking(false);
        }

        // Ticks 85..95: Di chuyển tới callout banner mời trải nghiệm
        if (t === 86) {
          setSubStep('p4_callout');
        }
      }
    }, 250);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, prefersReducedMotion, isVisible]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    tickRef.current = 0;
    setCurrentPhase(1);
    setSubStep('p1_focus_industry');
    setTypedIndustry('');
    setTypedProductName('');
    setSelectedObjectiveChip(false);
    setTypedObjective('');
    setSelectedBudgetLevel(null);
    setIsSubmitting(false);
    setIsSavedInShortlist(false);
    setIsClicking(false);
    setIsPlaying(true);
  };

  const handleJumpToPhase = (phase: 1 | 2 | 3 | 4) => {
    setIsPlaying(false);
    setCurrentPhase(phase);
    if (phase === 1) {
      tickRef.current = 0;
      setSubStep('p1_click_next');
      setTypedIndustry('F&B (Đồ uống & Trà sữa)');
      setTypedProductName('Trà Sữa Trân Châu Mộc Trà');
    } else if (phase === 2) {
      tickRef.current = 24;
      setSubStep('p2_click_chip');
      setSelectedObjectiveChip(true);
      setTypedObjective('Tăng nhận diện thương hiệu trong giới trẻ');
    } else if (phase === 3) {
      tickRef.current = 48;
      setSubStep('p3_click_submit');
      setSelectedBudgetLevel('low');
    } else {
      tickRef.current = 68;
      setSubStep('p4_click_save');
      setIsSavedInShortlist(true);
    }
  };

  const handleStartWithMyProduct = useCallback(() => {
    setIsPlaying(false);
    const formElement = document.getElementById('industry');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formElement.focus();
    }
  }, []);

  return (
    <div className="w-full relative group">
      {/* 1. HIỆU ỨNG GLOW NEON LÀM NỔI BẬT KHUNG DEMO */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/25 to-pink-500/25 rounded-3xl blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

      {/* Floating Header Tag */}
      <div className="hidden lg:flex items-center justify-between px-3 py-1.5 mb-2.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-indigo-500/40 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-200">
            Live Screencast Demo (20 Giây)
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Mô phỏng thao tác người dùng thật
        </span>
      </div>

      {/* Mobile Toggle Bar */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full p-3 rounded-xl border-2 border-indigo-400 bg-indigo-50 flex items-center justify-between text-xs font-bold text-indigo-950 transition-colors shadow-md"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>Xem góc nhìn thao tác thực tế (Screencast 20s)</span>
          </span>
          <span className="flex items-center gap-1 text-indigo-600 font-extrabold">
            {isMobileExpanded ? 'Thu gọn' : 'Mở xem'}
            {isMobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>
      </div>

      {/* 2. KHUNG TRÌNH DUYỆT BROWSER VỚI CON TRỎ CHUỘT BÁM ĐÍCH TUYỆT ĐỐI */}
      <div
        className={`${
          isMobileExpanded ? 'block' : 'hidden lg:block'
        } rounded-2xl border-2 border-indigo-500/50 bg-slate-950 shadow-[0_20px_60px_rgba(79,70,229,0.25)] overflow-hidden transition-all duration-300 ring-1 ring-white/10`}
        aria-label="Demo góc nhìn người dùng thao tác trên web"
      >
        {/* macOS Chrome Header */}
        <div className="bg-slate-900 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 select-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
          </div>

          {/* Browser Address Bar: marketing-ai-support.vercel.app */}
          <div className="flex-1 max-w-[260px] sm:max-w-xs mx-2">
            <div className="bg-slate-950/90 rounded-md px-2.5 py-1 text-[11px] text-slate-300 flex items-center justify-center gap-1.5 border border-slate-700/80 shadow-inner truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate font-mono font-medium text-slate-200">
                marketing-ai-support.vercel.app
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 rounded font-bold ml-1 hidden sm:inline">
                SSL
              </span>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={isPlaying ? 'Tạm dừng screencast' : 'Tiếp tục phát'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Phát lại từ đầu"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Phase Tabs */}
        <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] gap-1 overflow-x-auto text-slate-400">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-500 font-semibold hidden sm:inline">Tiến trình:</span>
            <button
              type="button"
              onClick={() => handleJumpToPhase(1)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentPhase === 1 ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              1. Sản phẩm
            </button>
            <button
              type="button"
              onClick={() => handleJumpToPhase(2)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentPhase === 2 ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              2. Mục tiêu
            </button>
            <button
              type="button"
              onClick={() => handleJumpToPhase(3)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentPhase === 3 ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              3. Ngân sách
            </button>
            <button
              type="button"
              onClick={() => handleJumpToPhase(4)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentPhase === 4 ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              4. Kết quả & Lưu
            </button>
          </div>

          <span className="text-[10px] text-indigo-400 font-mono font-medium shrink-0 ml-1">
            {isPlaying ? '● Live' : '⏸ Pause'}
          </span>
        </div>

        {/* VIEWPORT CỬA SỔ NƠI CON TRỎ CHUỘT BÁM ĐÍCH CHÍNH XÁC */}
        <div
          ref={viewportRef}
          className="bg-slate-50 p-4 sm:p-5 relative h-[430px] select-none text-slate-900 overflow-hidden"
        >
          {/* Con trỏ chuột ảo định vị chính xác theo tọa độ vàng (%) */}
          <div
            className="absolute pointer-events-none z-30 transition-all duration-500 ease-out"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: 'translate(-5px, -3px)',
            }}
          >
            {/* SVG Mouse Pointer */}
            <svg
              className={`w-6 h-6 drop-shadow-xl transition-transform ${
                isClicking ? 'scale-75 translate-y-0.5' : 'scale-100'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.88c.45 0 .67-.54.35-.85L5.5 3.21z"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>

            {/* Hiệu ứng Click Ripple tỏa sóng ngay tại đầu mũi tên */}
            {isClicking && (
              <span className="absolute top-[3px] left-[5px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-500/40 animate-ping pointer-events-none" />
            )}
          </div>

          {/* ================================================================= */}
          {/* CẢNH 1: BƯỚC 1 - NHẬP SẢN PHẨM                                    */}
          {/* ================================================================= */}
          {currentPhase === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Bước 1/3: Bạn đang kinh doanh gì?
                </span>
                <span className="text-[11px] text-slate-500">Mô phỏng nhập liệu</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngành hàng *</label>
                  <div
                    className={`h-9 px-3 rounded-lg border transition-all bg-white flex items-center font-medium shadow-2xs ${
                      subStep === 'p1_focus_industry' || subStep === 'p1_typing_industry'
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/20 text-slate-900'
                        : 'border-slate-300 text-slate-800'
                    }`}
                  >
                    {typedIndustry}
                    <span className="w-1.5 h-4 bg-indigo-600 animate-pulse ml-0.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên sản phẩm / dịch vụ *</label>
                  <div
                    className={`h-9 px-3 rounded-lg border transition-all bg-white flex items-center font-medium shadow-2xs ${
                      subStep === 'p1_focus_product' || subStep === 'p1_typing_product'
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/20 text-slate-900'
                        : 'border-slate-300 text-slate-800'
                    }`}
                  >
                    {typedProductName}
                    {typedProductName && <span className="w-1.5 h-4 bg-indigo-600 animate-pulse ml-0.5" />}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <div
                    className={`px-4 py-2 rounded-lg font-semibold text-white text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                      subStep === 'p1_click_next' && isClicking
                        ? 'bg-indigo-700 scale-95 ring-2 ring-indigo-400'
                        : subStep === 'p1_click_next'
                        ? 'bg-indigo-600 ring-2 ring-indigo-300'
                        : 'bg-slate-900'
                    }`}
                  >
                    <span>Tiếp tục (Mục tiêu)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Hệ thống tự động đề xuất ý tưởng theo đặc thù ngành hàng</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* CẢNH 2: BƯỚC 2 - CHỌN MỤC TIÊU                                    */}
          {/* ================================================================= */}
          {currentPhase === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Bước 2/3: Bạn muốn đạt điều gì?
                </span>
                <span className="text-[11px] text-slate-500">Mô phỏng chọn mục tiêu</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mục tiêu chiến dịch *</label>
                  <div className="h-9 px-3 rounded-lg border border-slate-300 bg-white flex items-center font-medium text-slate-800 shadow-2xs">
                    {typedObjective || 'Chọn từ gợi ý bên dưới...'}
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all inline-block ${
                      selectedObjectiveChip
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600/40'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Nhận diện thương hiệu {selectedObjectiveChip ? '✓' : ''}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-600 text-[11px]">
                    Tăng doanh số
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-600 text-[11px]">
                    Thu hút Leads
                  </span>
                </div>

                <div className="pt-8 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Quay lại</span>
                  <div
                    className={`px-4 py-2 rounded-lg font-semibold text-white text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                      subStep === 'p2_click_next' && isClicking
                        ? 'bg-indigo-700 scale-95 ring-2 ring-indigo-400'
                        : subStep === 'p2_click_next'
                        ? 'bg-indigo-600 ring-2 ring-indigo-300'
                        : 'bg-slate-900'
                    }`}
                  >
                    <span>Tiếp tục (Ngân sách)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Định hướng mục tiêu SMART bám sát hành vi khách hàng</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* CẢNH 3: BƯỚC 3 - CHỌN NGÂN SÁCH & SUBMIT                          */}
          {/* ================================================================= */}
          {currentPhase === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Bước 3/3: Chọn mức ngân sách
                </span>
                <span className="text-[11px] text-slate-500">Mô phỏng duyệt chi</span>
              </div>

              {/* 3 Thẻ Ngân Sách */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div
                  className={`p-2 rounded-lg border transition-all ${
                    selectedBudgetLevel === 'low'
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-2 ring-indigo-600/30 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-[10px] text-slate-500">Mức 1</div>
                  <div className="font-bold text-xs mt-0.5">Thấp</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">&lt; 20 Triệu</div>
                </div>

                <div className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 opacity-50">
                  <div className="text-[10px]">Mức 2</div>
                  <div className="font-bold text-xs mt-0.5">Trung bình</div>
                  <div className="text-[10px]">20 – 100M</div>
                </div>

                <div className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 opacity-50">
                  <div className="text-[10px]">Mức 3</div>
                  <div className="font-bold text-xs mt-0.5">Cao</div>
                  <div className="text-[10px]">&gt; 100 Triệu</div>
                </div>
              </div>

              {/* Tóm tắt mini */}
              <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-950 flex items-center justify-between">
                <span>Trà Sữa Mộc Trà • Nhận diện • Dưới 20M</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              </div>

              {/* Nút chính Tạo 5 ý tưởng */}
              <div className="pt-4">
                <div
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-white text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    isSubmitting
                      ? 'bg-indigo-700 scale-95 ring-2 ring-indigo-400'
                      : subStep === 'p3_click_submit'
                      ? 'bg-indigo-600 ring-2 ring-indigo-300'
                      : 'bg-indigo-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang đề xuất 05 ý tưởng...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tạo 05 ý tưởng chiến dịch Marketing</span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-1 text-center">
                <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Dự toán minh bạch kèm 08 case study Việt Nam thật</span>
                </span>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* CẢNH 4: KẾT QUẢ ĐỀ XUẤT & LƯU SHORTLIST                           */}
          {/* ================================================================= */}
          {currentPhase === 4 && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  ✓ Đã tạo 05 ý tưởng chiến dịch
                </span>
                <span className="text-[10px] text-slate-500">Mô phỏng kết quả</span>
              </div>

              {/* Card Ý Tưởng #1 */}
              <div className="p-3 rounded-xl border-2 border-indigo-600 bg-white shadow-sm space-y-2 relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded mr-1.5">
                      #1
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {DEMO_DATA.sampleIdeas[0].title}
                    </span>
                  </div>

                  {/* Nút Lưu Shortlist */}
                  <div
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs ${
                      isSavedInShortlist
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                        : subStep === 'p4_click_save'
                        ? 'bg-slate-800 text-white ring-2 ring-slate-400'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {isSavedInShortlist ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-white" />
                        <span>Đã lưu</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-slate-300" />
                        <span>Lưu</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 italic">"{DEMO_DATA.sampleIdeas[0].tagline}"</p>

                {/* Timeline mini */}
                <div className="grid grid-cols-2 gap-1 text-[10px] pt-0.5">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="font-semibold text-indigo-900">Tuần 1:</span> Teasing TikTok
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="font-semibold text-indigo-900">Tuần 2:</span> Seeding 15 hội nhóm
                  </div>
                </div>

                {/* Case Study Pill */}
                <div className="text-[10px] bg-indigo-50/70 p-1.5 rounded border border-indigo-100 text-indigo-900 flex items-center justify-between">
                  <span>📌 Căn cứ: The Coffee House (Brands VN)</span>
                  <span className="font-semibold text-emerald-700">8.500.000 VNĐ</span>
                </div>
              </div>

              {/* Callout mời trải nghiệm thật */}
              <div
                className="p-2.5 rounded-lg bg-gradient-to-r from-indigo-950 to-slate-900 text-white flex items-center justify-between gap-2 shadow-sm border border-indigo-500/30"
              >
                <span className="text-[11px] font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>👈 Giờ đến lượt bạn điền form thật bên trái!</span>
                </span>
                <button
                  type="button"
                  onClick={handleStartWithMyProduct}
                  className="px-2.5 py-1 rounded bg-white text-slate-950 font-bold text-[10px] shrink-0 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  Nhập ngay
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300">Minh họa cách sử dụng hệ thống</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="text-[11px] hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xem lại</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={handleStartWithMyProduct}
              className="text-[11px] text-indigo-400 font-semibold hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Bắt đầu với sản phẩm của tôi</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

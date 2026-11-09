'use client';

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Zap,
} from 'lucide-react';

interface HeroProps {
  onScrollToForm: () => void;
  onScrollToResults?: () => void;
  hasResults?: boolean;
}

export function Hero({ onScrollToForm, onScrollToResults, hasResults }: HeroProps) {
  return (
    <section className="w-full bg-[#070B18] relative overflow-hidden isolate pt-10 sm:pt-14 pb-32 sm:pb-44 lg:pb-48 text-white print:hidden">
      {/* 1. Ambient Glows (Ánh sáng phát quang nền chuẩn phong cách CFI) */}
      <div className="absolute -bottom-24 -left-20 w-[550px] h-[450px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -top-24 -right-20 w-[500px] h-[400px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* 2. Candlestick & Bar Chart Silhouettes Background (Biểu đồ cột chìm mờ ảo phía sau như CFI) */}
      <div className="absolute right-0 bottom-16 top-10 w-full lg:w-1/2 pointer-events-none -z-10 opacity-15 overflow-hidden flex items-end justify-end gap-3 px-8 pb-4">
        {[40, 65, 30, 85, 55, 95, 70, 110, 80, 130, 95, 150, 115, 175, 140, 190, 160, 210].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0">
            <div
              style={{ height: `${h}px` }}
              className={`w-3 sm:w-4 rounded-t-sm ${
                i % 3 === 0 ? 'bg-emerald-400' : i % 2 === 0 ? 'bg-cyan-400' : 'bg-indigo-400'
              }`}
            />
          </div>
        ))}
      </div>

      {/* 3. Organic Misty Wave Transition (Đường uốn lượn mây sương chuẩn phong cách CFI) */}
      <div className="absolute bottom-0 inset-x-0 w-full pointer-events-none z-10 overflow-hidden leading-none">
        {/* Vùng phát sáng sương mù phía trên ngọn sóng (Atmospheric cloud mist glow) */}
        <div className="absolute bottom-16 sm:bottom-24 right-4 sm:right-1/4 w-[400px] sm:w-[650px] h-[140px] sm:h-[220px] bg-gradient-to-t from-white/30 via-cyan-300/15 to-transparent blur-3xl rounded-full -z-10" />
        <div className="absolute bottom-8 sm:bottom-14 left-4 sm:left-12 w-[300px] sm:w-[450px] h-[100px] sm:h-[160px] bg-white/20 blur-2xl rounded-full -z-10" />

        <svg
          viewBox="0 0 1440 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-36 sm:h-52 lg:h-64 block transform translate-y-px"
        >
          <defs>
            {/* Bộ lọc làm mờ viền sóng sương mù */}
            <filter id="heroMistEdgeBlur" x="-10%" y="-20%" width="120%" height="150%">
              <feGaussianBlur stdDeviation="8" />
            </filter>

            {/* Gradient chuyển tiếp êm từ sương mờ sang nền trang #F8FAFC */}
            <linearGradient id="heroMistGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#F8FAFC" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="heroMistGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.65" />
              <stop offset="40%" stopColor="#F8FAFC" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Lớp sóng 1 (Hậu cảnh): Lượn cao nhất ở mạn phải, mép mờ sương khói */}
          <path
            d="M 0,170 C 260,210 460,195 720,135 C 980,75 1180,35 1440,80 L 1440,280 L 0,280 Z"
            fill="url(#heroMistGrad1)"
            filter="url(#heroMistEdgeBlur)"
          />

          {/* Lớp sóng 2 (Trung cảnh): Độ uốn lượn mềm mại, tôn vinh vùng mockup bên phải */}
          <path
            d="M 0,195 C 300,230 520,215 780,160 C 1020,105 1210,65 1440,105 L 1440,280 L 0,280 Z"
            fill="url(#heroMistGrad2)"
          />

          {/* Lớp sóng 3 (Tiền cảnh): Đường uốn lượn chính màu #F8FAFC hòa 100% vào nền trang */}
          <path
            d="M 0,218 C 340,248 560,236 820,185 C 1050,135 1230,95 1440,132 L 1440,280 L 0,280 Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>

      {/* 4. Nội dung Hero căn khung giữa chuẩn max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* CỘT TRÁI: TIÊU ĐỀ, CHỈ SỐ STATS & BUTTONS */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-200">
                Trợ lý marketing thông minh thế hệ mới
              </span>
            </div>

            {/* Headline Sắc Nét Tuyệt Đối */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl font-extrabold sm:font-black tracking-[-0.025em] leading-[1.12] text-white">
              Lập kế hoạch & ý tưởng Marketing <br />
              <span className="text-cyan-400">
                theo ngân sách thực tế
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Tối ưu hóa đa kênh theo ngân sách thực tế. Nhận ngay 05 chiến dịch chi tiết, lộ trình hành động 04 tuần và bản đề xuất đầu tư đạt chuẩn điều hành.
            </p>

            {/* Financial Stats Bar (CFI 3-metric display) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-2 pb-1 border-y border-white/10 max-w-lg">
              <div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-white flex items-center">
                  <span>3</span>
                  <span className="text-xs text-cyan-400 font-sans ml-1">Mức</span>
                </div>
                <div className="text-[11px] text-slate-400">Ngân sách thực tế</div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-white flex items-center">
                  <span>05</span>
                  <span className="text-xs text-emerald-400 font-sans ml-1">Đề xuất</span>
                </div>
                <div className="text-[11px] text-slate-400">Đa dạng góc nhìn</div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-white flex items-center">
                  <span>04</span>
                  <span className="text-xs text-indigo-300 font-sans ml-1">Tuần</span>
                </div>
                <div className="text-[11px] text-slate-400">Roadmap hành động</div>
              </div>
            </div>

            {/* Action Buttons (WACT Capsule Pill Style) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onScrollToForm}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/10 hover:bg-cyan-50 hover:text-slate-900 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Bắt đầu điền form</span>
                <ArrowRight className="w-4 h-4 text-cyan-600" />
              </button>

              {hasResults && onScrollToResults && (
                <button
                  type="button"
                  onClick={onScrollToResults}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Xem 5 ý tưởng</span>
                </button>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: HIGHLIGHT PILL CARDS (Lơ lửng trên nền tối như CFI) */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-3.5">
            {/* Widget 1: Gold Trade mockup card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl space-y-2 transform hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Tối ưu ROI đa kênh</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                  +320% ROI
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Phân bổ khoa học giữa nhận diện thương hiệu, KOC trải nghiệm và kích hoạt chuyển đổi bán lẻ.
              </p>
            </div>

            {/* Widget 2: Crude Oil style floating card */}
            <div className="p-4 rounded-2xl bg-indigo-950/70 backdrop-blur-md border border-indigo-500/30 shadow-xl space-y-2 transform translate-x-4 hover:translate-x-3 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span>Ma trận chi phí & KPI minh bạch</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono">
                  0 Lãng phí
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Bóc tách chi tiết từng dòng ngân sách, điểm hòa vốn và phương án dự phòng Plan B khi rủi ro phát sinh.
              </p>
            </div>

            {/* Widget 3: Quick insight card */}
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-xs text-slate-400 flex items-center justify-between">
              <span>Đạt chuẩn báo cáo điều hành (Meeting-ready)</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">✓ Sẵn sàng</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


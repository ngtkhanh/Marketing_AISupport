'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, DollarSign, Calendar, Award, Loader2, Clock } from 'lucide-react';

interface LoadingStage {
  id: number;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: LoadingStage[] = [
  {
    id: 1,
    label: 'Phân tích ngành hàng & đặc thù',
    detail: 'Trích xuất hành vi khách hàng mục tiêu và rào cản ra quyết định...',
    icon: Sparkles
  },
  {
    id: 2,
    label: 'Tối ưu phân bổ kênh truyền thông',
    detail: 'Sàng lọc kênh khả thi, loại bỏ kênh vượt trần chi phí ngân sách...',
    icon: DollarSign
  },
  {
    id: 3,
    label: 'Thiết kế timeline hành động 04 tuần',
    detail: 'Phân rã đầu việc cụ thể theo từng tuần từ chuẩn bị đến chuyển đổi...',
    icon: Calendar
  },
  {
    id: 4,
    label: 'Đóng gói căn cứ & thử nghiệm nhỏ',
    detail: 'Đối chiếu case study tham chiếu và xây dựng tiêu chí đo lường...',
    icon: Award
  }
];

export function AILoadingStatus() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedSeconds(Math.floor(elapsed / 1000));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 space-y-4 animate-in fade-in duration-300 shadow-xs">
      {/* Header trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              AI Đang Phân Tích & May Đo 05 Ý Tưởng Chiến Dịch
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Đã trôi qua:</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                {elapsedSeconds}s
              </span>
              <span>— thời gian phản hồi thông thường: 10–25s</span>
            </p>
          </div>
        </div>

        {/* Badge trạng thái hoạt động */}
        <div className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
          <span>Đang tạo nội dung thời gian thực</span>
        </div>
      </div>

      {/* Indeterminate Shimmer Progress Bar (Không dùng phần trăm giả) */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden relative">
        <div className="absolute inset-y-0 bg-indigo-600 rounded-full w-1/3 animate-indeterminate" />
      </div>

      {/* 4 Stepper stages */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                  Tác vụ {idx + 1}
                </span>
                <Icon className="w-3.5 h-3.5 text-indigo-600" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-900 leading-snug">
                  {stage.label}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-2">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, DollarSign, Calendar, Award, CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingStage {
  id: number;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  targetDurationMs: number; // Thời điểm bắt đầu stage này (tính từ 0ms)
}

const STAGES: LoadingStage[] = [
  {
    id: 1,
    label: 'Phân tích ngành hàng & bối cảnh sản phẩm',
    detail: 'Trích xuất đặc thù phân khúc và chân dung khách hàng tiềm năng...',
    icon: Sparkles,
    targetDurationMs: 0,
  },
  {
    id: 2,
    label: 'Tối ưu phân bổ kênh theo mức ngân sách',
    detail: 'Sàng lọc kênh truyền thông khả thi, loại bỏ kênh vượt trần chi phí...',
    icon: DollarSign,
    targetDurationMs: 3500,
  },
  {
    id: 3,
    label: 'Xây dựng timeline hành động 04 tuần',
    detail: 'Phân rã kế hoạch thành từng bước triển khai cụ thể theo từng tuần...',
    icon: Calendar,
    targetDurationMs: 8000,
  },
  {
    id: 4,
    label: 'Hoàn thiện 05 đề xuất chiến dịch',
    detail: 'Đánh giá tính khả thi và đóng gói nội dung chi tiết...',
    icon: Award,
    targetDurationMs: 13500,
  },
];

export function AILoadingStatus() {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(8);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const elapsedSec = Math.floor(elapsed / 1000);
      setElapsedSeconds(elapsedSec);

      // Cập nhật stage hiện tại dựa theo thời gian trôi qua
      let activeIdx = 0;
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (elapsed >= STAGES[i].targetDurationMs) {
          activeIdx = i;
          break;
        }
      }
      setCurrentStageIdx(activeIdx);

      // Mô phỏng thanh tiến trình mượt mà từ 8% đến 92% trong 18s đầu
      // Đường cong chậm dần (asymptotic) để không bao giờ chạm 100% trước khi AI trả về thật
      if (elapsed < 3500) {
        setProgress(Math.min(30, 8 + (elapsed / 3500) * 22));
      } else if (elapsed < 8000) {
        const stageProgress = (elapsed - 3500) / 4500;
        setProgress(Math.min(60, 30 + stageProgress * 30));
      } else if (elapsed < 14000) {
        const stageProgress = (elapsed - 8000) / 6000;
        setProgress(Math.min(85, 60 + stageProgress * 25));
      } else {
        // Sau 14s tăng rất chậm về 92%
        const extraSec = (elapsed - 14000) / 1000;
        setProgress(Math.min(94, 85 + Math.min(extraSec * 0.7, 9)));
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 space-y-4 animate-in fade-in duration-300">
      {/* Header trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Đang Phân Tích & Xây Dựng 05 Ý Tưởng
            </h3>
            <p className="text-xs text-slate-500">
              Thời gian xử lý: <span className="font-semibold text-slate-800">{elapsedSeconds}s</span> (dự kiến ~12–18s)
            </p>
          </div>
        </div>

        {/* Badge tiến độ */}
        <div className="self-start sm:self-auto px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
          Tiến độ: {Math.round(progress)}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-slate-900 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 4 Stepper stages */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = currentStageIdx > idx;
          const isCurrent = currentStageIdx === idx;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-lg border transition-colors flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : isCurrent
                  ? 'bg-slate-50 border-slate-900 text-slate-900'
                  : 'bg-white border-slate-200/80 opacity-50 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                  Bước {idx + 1}
                </span>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-slate-800 animate-spin flex-shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </div>

              <div>
                <p className={`text-xs font-semibold leading-snug ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
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


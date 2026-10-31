'use client';

import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface SourceBadgeProps {
  source: 'ai' | 'mock';
  model?: string;
}

export function SourceBadge({ source, model }: SourceBadgeProps) {
  if (source === 'mock') {
    return (
      <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm animate-in fade-in duration-300">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="flex-1">
          <span className="font-semibold text-amber-800">Chế độ Demo Dự Phòng: </span>
          <span>
            Đang sử dụng dữ liệu mẫu dự phòng chuyên sâu do AI gặp sự cố hạ tầng (quota/mạng). Cả 5 tính năng vẫn hoạt động đầy đủ.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium animate-in fade-in duration-300">
      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
      <span>
        Được sinh bởi <strong>AI Thật (Google Gemini)</strong> {model ? `· ${model}` : ''} qua 3 lớp kiểm soát đầu ra.
      </span>
    </div>
  );
}


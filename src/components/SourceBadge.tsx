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
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Dữ liệu mẫu dự phòng:</strong> Đang chạy chế độ demo dự phòng.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
      <span>
        Google Gemini {model ? `(${model})` : ''}
      </span>
    </div>
  );
}


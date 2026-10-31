'use client';

import React from 'react';
import { WeeklyPlan } from '@/types/marketing';
import { Calendar, CheckCircle } from 'lucide-react';

interface WeeklyTimelineProps {
  timeline: WeeklyPlan[];
}

export function WeeklyTimeline({ timeline }: WeeklyTimelineProps) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-xs tracking-wider uppercase">
        <Calendar className="w-4 h-4 text-indigo-600" />
        <span>Kế hoạch triển khai 04 tuần tóm tắt</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {timeline.map((plan) => (
          <div
            key={plan.week}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-[10px] font-bold text-white shrink-0">
                  W{plan.week}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate" title={plan.title}>
                  {plan.title}
                </span>
              </div>

              <ul className="space-y-1 mt-2">
                {plan.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-tight">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


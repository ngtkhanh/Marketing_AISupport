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
      <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold text-xs tracking-wider uppercase">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span>Kế hoạch triển khai 04 tuần tóm tắt</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {timeline.map((plan) => (
          <div
            key={plan.week}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-bold text-slate-900 shrink-0">
                  Tuần {plan.week}:
                </span>
                <span className="text-xs font-medium text-slate-800 truncate" title={plan.title}>
                  {plan.title}
                </span>
              </div>

              <ul className="space-y-1 mt-1.5">
                {plan.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-normal">
                    <span className="text-slate-400 mt-0.5">•</span>
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


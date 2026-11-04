'use client';

import React from 'react';
import { BudgetLevel } from '@/types/marketing';
import { BUDGET_CONFIGS } from '@/lib/config/budget';

interface BudgetSelectorProps {
  value: BudgetLevel;
  onChange: (level: BudgetLevel) => void;
  error?: string;
}

export function BudgetSelector({ value, onChange, error }: BudgetSelectorProps) {
  const levels: BudgetLevel[] = ['low', 'medium', 'high'];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900">
        Mức ngân sách dự kiến <span className="text-rose-500">*</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {levels.map((lvl) => {
          const cfg = BUDGET_CONFIGS[lvl];
          const isSelected = value === lvl;

          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange(lvl)}
              className={`text-left p-4 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 bg-slate-50/70'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-slate-900">{cfg.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-2 border-slate-900'
                        : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-700 mb-1">{cfg.rangeText}</div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{cfg.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">Kênh: </span>
                {cfg.recommendedChannels.slice(0, 3).join(', ')}...
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs font-medium text-rose-600 mt-1">{error}</p>}
    </div>
  );
}


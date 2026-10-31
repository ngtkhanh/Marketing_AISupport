'use client';

import React from 'react';
import { BudgetLevel } from '@/types/marketing';
import { BUDGET_CONFIGS } from '@/lib/config/budget';
import { CheckCircle2, TrendingUp, Zap, Crown } from 'lucide-react';

interface BudgetSelectorProps {
  value: BudgetLevel;
  onChange: (level: BudgetLevel) => void;
  error?: string;
}

export function BudgetSelector({ value, onChange, error }: BudgetSelectorProps) {
  const levels: BudgetLevel[] = ['low', 'medium', 'high'];

  const getIcon = (level: BudgetLevel) => {
    switch (level) {
      case 'low':
        return <Zap className="w-5 h-5 text-emerald-600" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-amber-600" />;
      case 'high':
        return <Crown className="w-5 h-5 text-purple-600" />;
    }
  };

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
              className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm shadow-indigo-100 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100">{getIcon(lvl)}</div>
                    <span className="font-bold text-base text-slate-900">{cfg.label}</span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>

                <div className="text-sm font-semibold text-indigo-700 mb-1.5">{cfg.rangeText}</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{cfg.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">Kênh tối ưu: </span>
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


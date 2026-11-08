'use client';

import React, { useState } from 'react';
import { KPIScenario, KPIScenarioName } from '@/types/marketing';
import { formatVND } from '@/lib/proposal-calculations';
import {
  TrendingUp,
  Target,
  Sparkles,
  Shield,
  Info,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Users,
  Eye,
  ShoppingBag,
  Coins,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2
} from 'lucide-react';

interface KpiScenariosMatrixProps {
  scenarios: KPIScenario[];
  onChange?: (updatedScenarios: KPIScenario[]) => void;
  readOnly?: boolean;
}

interface ScenarioCardStyle {
  badgeText: string;
  badgeStyle: string;
  headerBorder: string;
  cardBorder: string;
  cardBg: string;
  accentText: string;
  iconBg: string;
  iconColor: string;
  isPopular?: boolean;
  IconComponent: React.ComponentType<{ className?: string }>;
}

const SCENARIO_STYLES: Record<KPIScenarioName, ScenarioCardStyle> = {
  conservative: {
    badgeText: 'Biên An Toàn Ngân Sách',
    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    headerBorder: 'border-slate-200',
    cardBorder: 'border-slate-200 hover:border-slate-300',
    cardBg: 'bg-white',
    accentText: 'text-slate-700',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    IconComponent: Shield
  },
  base: {
    badgeText: 'Kịch Bản Cơ Sở',
    badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold',
    headerBorder: 'border-indigo-200',
    cardBorder: 'border-indigo-400 ring-2 ring-indigo-500/10 shadow-md',
    cardBg: 'bg-indigo-50/20',
    accentText: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    isPopular: false,
    IconComponent: Target
  },
  optimistic: {
    badgeText: 'Tối Ưu Khi Tăng Trưởng / Viral',
    badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
    headerBorder: 'border-emerald-200',
    cardBorder: 'border-emerald-300 hover:border-emerald-400',
    cardBg: 'bg-white',
    accentText: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    IconComponent: Sparkles
  }
};

export const KpiScenariosMatrix: React.FC<KpiScenariosMatrixProps> = ({
  scenarios,
  onChange,
  readOnly = false
}) => {
  const [showAssumptionIndex, setShowAssumptionIndex] = useState<Record<string, boolean>>({
    conservative: true,
    base: true,
    optimistic: true
  });

  const toggleAssumption = (name: string) => {
    setShowAssumptionIndex((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleAddAssumption = (scenarioName: KPIScenarioName) => {
    if (readOnly || !onChange) return;
    const newAssumptionsText = prompt('Nhập giả định đo lường mới cho kịch bản này:');
    if (!newAssumptionsText || !newAssumptionsText.trim()) return;

    const updated = scenarios.map((s) => {
      if (s.name === scenarioName) {
        return {
          ...s,
          assumptions: [...s.assumptions, newAssumptionsText.trim()]
        };
      }
      return s;
    });

    onChange(updated);
  };

  const handleDeleteAssumption = (scenarioName: KPIScenarioName, index: number) => {
    if (readOnly || !onChange) return;
    const updated = scenarios.map((s) => {
      if (s.name === scenarioName) {
        return {
          ...s,
          assumptions: s.assumptions.filter((_, i) => i !== index)
        };
      }
      return s;
    });

    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header & Tiêu đề giải thích */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Ma Trận 3 Kịch Bản KPI & Giả Định Đo Lường
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Minh bạch hóa các khoảng mục tiêu. Mọi con số đều gắn liền với giả định minh họa và công thức phễu có thể chỉnh sửa.
          </p>
        </div>

        {/* Badge cam kết */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="font-medium">
            Giả định minh họa — Ước tính phục vụ duyệt chi, không phải cam kết cố định
          </span>
        </div>
      </div>

      {/* Ma trận 3 cột trực quan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {scenarios.map((scenario) => {
          const style = SCENARIO_STYLES[scenario.name] || SCENARIO_STYLES.conservative;
          const { IconComponent } = style;
          const isExpanded = showAssumptionIndex[scenario.name] ?? true;

          return (
            <div
              key={scenario.name}
              className={`rounded-xl border ${style.cardBorder} ${style.cardBg} transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm`}
            >
              {/* Header của từng thẻ kịch bản */}
              <div className={`p-4 border-b ${style.headerBorder} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${style.badgeStyle}`}
                  >
                    {style.badgeText}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Giả định minh họa
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className={`p-2 rounded-lg shrink-0 ${style.iconBg} ${style.iconColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {scenario.label}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {scenario.name === 'conservative' && 'Chi phí cao, tỷ lệ chuyển đổi an toàn'}
                      {scenario.name === 'base' && 'Mức kỳ vọng chuẩn theo giả định trung bình'}
                      {scenario.name === 'optimistic' && 'Tối ưu chuyển đổi, nội dung lan tỏa tự nhiên'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thân thẻ: Các tầng chỉ số chính */}
              <div className="p-4 space-y-4 flex-1">
                {/* Hàng 1: Chỉ số chính theo mục tiêu */}
                {scenario.objectiveType === 'awareness' ? (
                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/70 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 font-medium mb-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tiếp cận độc lập (Unique Reach):</span>
                    </div>
                    <div className={`text-2xl sm:text-3xl font-black ${style.accentText}`}>
                      {scenario.reach.toLocaleString('vi-VN')}{' '}
                      <span className="text-sm font-semibold text-slate-600">người</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Mục tiêu nhận diện — Chưa đủ dữ liệu doanh số để ước tính đơn hàng
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/70 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 font-medium mb-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scenario.objectiveType === 'lead_generation' ? 'Khách hàng tiềm năng (Leads):' : 'Đơn hàng dự kiến (Estimated Orders):'}</span>
                    </div>
                    <div className={`text-2xl sm:text-3xl font-black ${style.accentText}`}>
                      {(scenario.objectiveType === 'lead_generation' ? scenario.leads : scenario.orders).toLocaleString('vi-VN')}{' '}
                      <span className="text-sm font-semibold text-slate-600">{scenario.objectiveType === 'lead_generation' ? 'leads' : 'đơn'}</span>
                    </div>
                  </div>
                )}

                {/* Chuỗi phễu tính toán minh bạch */}
                {scenario.funnelSteps && scenario.funnelSteps.length > 0 && (
                  <div className="bg-indigo-50/30 rounded-lg p-2.5 border border-indigo-100/80 space-y-1.5 text-xs">
                    <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-indigo-500" />
                      <span>Chuỗi phễu chuyển đổi ({scenario.funnelSteps.length} bước)</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      {scenario.funnelSteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate pr-2">{step.label}:</span>
                          <span className="font-mono font-bold text-slate-800 shrink-0">
                            {step.unit === 'VNĐ' ? formatVND(step.value) : `${step.value.toLocaleString('vi-VN')} ${step.unit}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hàng 2: Reach vs Impressions */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Tiếp cận (Unique Reach):
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {scenario.reach.toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      Hiển thị (Impressions):
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {scenario.impressions.toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-slate-400" />
                      Khách tiềm năng / Leads:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      ~ {scenario.leads.toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Hàng 3: Unit Economics (CPO & CAC) */}
                <div className="bg-slate-50/60 rounded-lg p-2.5 border border-slate-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-slate-400" />
                      Chi phí / Đơn (Target CPO):
                    </span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {formatVND(scenario.targetCPO)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      Chi phí khách mới (Est. CAC):
                    </span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {formatVND(scenario.cac)}
                    </span>
                  </div>
                </div>

                {/* Hàng 4: Khối Giả định đo lường & Điều kiện tiên quyết */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleAssumption(scenario.name)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                  >
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                      Giả định & Điều kiện đạt KPI ({scenario.assumptions.length}):
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="space-y-1.5 pt-1">
                      <ul className="space-y-1 text-slate-600 text-xs">
                        {scenario.assumptions.map((assumption, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-1.5 group bg-slate-50/50 p-1.5 rounded border border-slate-100"
                          >
                            <span className="text-indigo-500 font-bold shrink-0 mt-0.5">•</span>
                            <span className="flex-1 leading-snug">{assumption}</span>
                            {!readOnly && onChange && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAssumption(scenario.name, idx)}
                                title="Xóa giả định này"
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>

                      {!readOnly && onChange && (
                        <button
                          type="button"
                          onClick={() => handleAddAssumption(scenario.name)}
                          className="w-full mt-2 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 rounded border border-dashed border-indigo-200 flex items-center justify-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3" />
                          Thêm giả định đo lường
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lời khuyên chuyên môn khi mang đi họp */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Lời khuyên khi trình Sếp:</strong> Đừng đưa ra duy nhất một con số cam kết tuyệt đối. Hãy trình bày kịch bản <em>Cơ sở</em> làm mục tiêu phấn đấu, đồng thời chứng minh cho Sếp thấy kịch bản <em>Thận trọng</em> đã đủ bù đắp chi phí vận hành (CPO trong ngưỡng an toàn) để tự tin xin duyệt giải ngân ngay trong cuộc họp.
        </p>
      </div>
    </div>
  );
};


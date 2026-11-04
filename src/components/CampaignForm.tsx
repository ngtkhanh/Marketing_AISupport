'use client';

import React, { useState, useEffect } from 'react';
import { CampaignInput, BudgetLevel } from '@/types/marketing';
import { BudgetSelector } from './BudgetSelector';
import { campaignInputSchema } from '@/lib/schemas';
import { Sparkles, Wand2, ArrowRight, RotateCcw } from 'lucide-react';
import { useCampaign } from '@/context/CampaignContext';
import { useToast } from '@/components/Toast';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => Promise<void>;
  isLoading: boolean;
  onReset?: () => void;
  serverFieldErrors?: Record<string, string>;
}

const PRESET_SAMPLES: Array<{
  name: string;
  data: CampaignInput;
}> = [
  {
    name: 'Mẫu 1: F&B (Ngân sách Thấp)',
    data: {
      industry: 'F&B (Đồ uống & Trà sữa)',
      productName: 'Trà Sữa Trân Châu Mộc Trà',
      budgetLevel: 'low',
      objective: 'Tăng tương tác và độ nhận diện trong giới học sinh, sinh viên',
      additionalNotes: 'Tập trung kênh TikTok và hoạt động minigame truyền miệng'
    }
  },
  {
    name: 'Mẫu 2: Thời trang (Ngân sách Cao)',
    data: {
      industry: 'Thời trang & May mặc',
      productName: 'Bộ Sưu Tập Áo Khoác Mùa Thu Aurora',
      budgetLevel: 'high',
      objective: 'Ra mắt sản phẩm mới và tạo cơn sốt bùng nổ doanh số quý 4',
      additionalNotes: 'Có thể hợp tác KOL lớn và biển quảng cáo ngoài trời'
    }
  },
  {
    name: 'Mẫu 3: Công nghệ SaaS (Ngân sách Trung bình)',
    data: {
      industry: 'Công nghệ & Phần mềm',
      productName: 'Ứng Dụng Học Tiếng Anh AI EngMaster',
      budgetLevel: 'medium',
      objective: 'Thu thập 5.000 khách hàng tiềm năng đăng ký dùng thử ứng dụng',
      additionalNotes: 'Khai thác video trải nghiệm ngắn và quảng cáo chuyển đổi'
    }
  }
];

const POPULAR_INDUSTRIES = ['F&B', 'Mỹ phẩm & Làm đẹp', 'Thời trang', 'Công nghệ & SaaS', 'Giáo dục', 'Bất động sản'];

const POPULAR_OBJECTIVES = [
  'Nhận diện thương hiệu',
  'Tăng trưởng doanh số bán hàng',
  'Thu thập khách hàng tiềm năng (Leads)',
  'Ra mắt sản phẩm mới',
  'Gia tăng tương tác cộng đồng'
];

export function CampaignForm({ onSubmit, isLoading, onReset, serverFieldErrors }: CampaignFormProps) {
  const { formData, updateFormField, setFormData, clearAllCampaignData, ideas, lastInput } = useCampaign();
  const { showToast } = useToast();
  const { industry, productName, budgetLevel, objective, additionalNotes } = formData;

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...serverFieldErrors }));
    }
  }, [serverFieldErrors]);

  const isFormDirty =
    Boolean(industry.trim()) ||
    Boolean(productName.trim()) ||
    Boolean(objective.trim()) ||
    Boolean(additionalNotes.trim());

  const canReset = isFormDirty || ideas.length > 0 || Boolean(lastInput);

  const handlePrefill = (preset: (typeof PRESET_SAMPLES)[number]) => {
    setFormData({
      industry: preset.data.industry,
      productName: preset.data.productName,
      budgetLevel: preset.data.budgetLevel,
      objective: preset.data.objective,
      additionalNotes: preset.data.additionalNotes || '',
    });
    setFieldErrors({});
  };

  const handleReset = () => {
    clearAllCampaignData();
    setFieldErrors({});
    if (onReset) {
      onReset();
    }
    showToast('Đã làm mới thông tin chiến dịch và đề xuất ý tưởng', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawInput = {
      industry,
      productName,
      budgetLevel,
      objective,
      additionalNotes
    };

    // Client-side Validation bằng Zod
    const result = campaignInputSchema.safeParse(rawInput);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 space-y-6">
      {/* Top Banner: Header + Reset & Presets */}
      <div className="pb-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Thông tin chiến dịch</h2>
            <p className="text-xs text-slate-500">Điền thông tin bên dưới hoặc bấm nút điền mẫu để thử nghiệm nhanh</p>
          </div>

          {canReset && (
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="Làm mới form và xóa toàn bộ ý tưởng đề xuất"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-slate-400" /> Điền thử mẫu:
          </span>
          {PRESET_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePrefill(sample)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
            >
              Mẫu {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Ngành hàng */}
        <div>
          <label htmlFor="industry" className="block text-sm font-semibold text-slate-900 mb-1.5">
            Ngành hàng <span className="text-rose-500">*</span>
          </label>
          <input
            id="industry"
            type="text"
            value={industry}
            onChange={(e) => {
              updateFormField('industry', e.target.value);
              if (fieldErrors.industry) setFieldErrors((prev) => ({ ...prev, industry: '' }));
            }}
            placeholder="Ví dụ: F&B, Thời trang, Mỹ phẩm..."
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-1 ${
              fieldErrors.industry
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'
            }`}
          />
          {fieldErrors.industry && <p className="text-xs font-medium text-rose-600 mt-1">{fieldErrors.industry}</p>}

          {/* Quick industry chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {POPULAR_INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => {
                  updateFormField('industry', ind);
                  if (fieldErrors.industry) setFieldErrors((prev) => ({ ...prev, industry: '' }));
                }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Tên sản phẩm / dịch vụ */}
        <div>
          <label htmlFor="productName" className="block text-sm font-semibold text-slate-900 mb-1.5">
            Tên sản phẩm / dịch vụ <span className="text-rose-500">*</span>
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => {
              updateFormField('productName', e.target.value);
              if (fieldErrors.productName) setFieldErrors((prev) => ({ ...prev, productName: '' }));
            }}
            placeholder="Ví dụ: Trà sữa kem trứng dừa nướng Mộc Trà"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-1 ${
              fieldErrors.productName
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'
            }`}
          />
          {fieldErrors.productName && (
            <p className="text-xs font-medium text-rose-600 mt-1">{fieldErrors.productName}</p>
          )}
        </div>
      </div>

      {/* Mức ngân sách (3 mức) */}
      <BudgetSelector
        value={budgetLevel}
        onChange={(val) => {
          updateFormField('budgetLevel', val);
          if (fieldErrors.budgetLevel) setFieldErrors((prev) => ({ ...prev, budgetLevel: '' }));
        }}
        error={fieldErrors.budgetLevel}
      />

      {/* Mục tiêu chiến dịch */}
      <div>
        <label htmlFor="objective" className="block text-sm font-semibold text-slate-900 mb-1.5">
          Mục tiêu chiến dịch <span className="text-rose-500">*</span>
        </label>
        <input
          id="objective"
          type="text"
          value={objective}
          onChange={(e) => {
            updateFormField('objective', e.target.value);
            if (fieldErrors.objective) setFieldErrors((prev) => ({ ...prev, objective: '' }));
          }}
          placeholder="Ví dụ: Tăng độ nhận diện thương hiệu và kéo khách tới cửa hàng mới"
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-1 ${
            fieldErrors.objective
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'
          }`}
        />
        {fieldErrors.objective && <p className="text-xs font-medium text-rose-600 mt-1">{fieldErrors.objective}</p>}

        {/* Quick objective chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {POPULAR_OBJECTIVES.map((obj) => (
            <button
              key={obj}
              type="button"
              onClick={() => {
                updateFormField('objective', obj);
                if (fieldErrors.objective) setFieldErrors((prev) => ({ ...prev, objective: '' }));
              }}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {obj}
            </button>
          ))}
        </div>
      </div>

      {/* Ghi chú bổ sung (tùy chọn) */}
      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-slate-700 mb-1.5">
          Ghi chú bổ sung <span className="text-xs text-slate-400">(Tùy chọn, tối đa 300 ký tự)</span>
        </label>
        <textarea
          id="additionalNotes"
          rows={2}
          value={additionalNotes}
          onChange={(e) => updateFormField('additionalNotes', e.target.value)}
          placeholder="Ví dụ: Tone giọng hóm hỉnh, đối tượng chính là Gen Z, muốn tập trung TikTok và Threads..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none"
        />
      </div>

      {/* Nút Submit & Nút Làm Mới */}
      <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-3">
        {canReset && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-700 hover:text-rose-600 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Làm mới form và xóa toàn bộ ý tưởng đề xuất"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Làm mới</span>
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            isLoading
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang phân tích & tạo 05 ý tưởng...</span>
            </>
          ) : (
            <>
              <span>Đề xuất 05 ý tưởng Marketing</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}


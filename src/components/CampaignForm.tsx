'use client';

import React, { useState, useEffect } from 'react';
import { CampaignInput, BudgetLevel } from '@/types/marketing';
import { BudgetSelector } from './BudgetSelector';
import { step1Schema, step2Schema, step3Schema, campaignInputSchema } from '@/lib/schemas';
import {
  Sparkles,
  Wand2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Layers,
  HelpCircle
} from 'lucide-react';
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
      additionalNotes: 'Tập trung kênh TikTok và hoạt động minigame truyền miệng',
      targetAudiencePrompt: 'Học sinh, sinh viên và nhân viên văn phòng trẻ từ 16–25 tuổi',
      sellingArea: 'Hà Nội & TP.HCM',
      brandProfile: {
        brandToneAdjectives: ['Gần gũi', 'Tươi trẻ', 'Năng động'],
        permittedClaims: '100% trà tự nhiên nấu mới mỗi ngày',
        wordsToAvoid: 'Rẻ nhất, Cam kết số 1'
      }
    }
  },
  {
    name: 'Mẫu 2: Thời trang (Ngân sách Cao)',
    data: {
      industry: 'Thời trang & May mặc',
      productName: 'Bộ Sưu Tập Áo Khoác Mùa Thu Aurora',
      budgetLevel: 'high',
      objective: 'Ra mắt sản phẩm mới và tạo cơn sốt bùng nổ doanh số quý 4',
      additionalNotes: 'Có thể hợp tác KOL lớn và biển quảng cáo ngoài trời',
      targetAudiencePrompt: 'Phái đẹp công sở 24–35 tuổi, thu nhập trung bình khá',
      sellingArea: 'Toàn quốc',
      brandProfile: {
        brandToneAdjectives: ['Thanh lịch', 'Hiện đại', 'Tự tin'],
        permittedClaims: 'Chất liệu lụa satin cao cấp chống nhăn',
        wordsToAvoid: 'Đại hạ giá, Xả kho'
      }
    }
  },
  {
    name: 'Mẫu 3: Công nghệ SaaS (Ngân sách Trung bình)',
    data: {
      industry: 'Công nghệ & Phần mềm',
      productName: 'Ứng Dụng Học Tiếng Anh AI EngMaster',
      budgetLevel: 'medium',
      objective: 'Thu thập 5.000 khách hàng tiềm năng đăng ký dùng thử ứng dụng',
      additionalNotes: 'Khai thác video trải nghiệm ngắn và quảng cáo chuyển đổi',
      targetAudiencePrompt: 'Người đi làm bận rộn muốn nâng cao phản xạ giao tiếp',
      sellingArea: 'Toàn quốc',
      brandProfile: {
        brandToneAdjectives: ['Chuyên nghiệp', 'Đột phá', 'Tận tâm'],
        permittedClaims: 'Công nghệ AI phát âm chuẩn Oxford',
        wordsToAvoid: 'Học vẹt, Cam kết giỏi ngay'
      }
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
  const {
    industry,
    productName,
    budgetLevel,
    objective,
    additionalNotes,
    targetAudiencePrompt,
    sellingArea,
    productPrice,
    keyDifferentiator,
    availableResources,
    specificBudgetVnd,
    brandToneAdjectives,
    permittedClaims,
    wordsToAvoid
  } = formData;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showAdvancedContext, setShowAdvancedContext] = useState(false);

  useEffect(() => {
    if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...serverFieldErrors }));
    }
  }, [serverFieldErrors]);

  const isFormDirty =
    Boolean(industry.trim()) ||
    Boolean(productName.trim()) ||
    Boolean(objective.trim()) ||
    Boolean(additionalNotes.trim()) ||
    Boolean(targetAudiencePrompt?.trim());

  const canReset = isFormDirty || ideas.length > 0 || Boolean(lastInput);

  const handlePrefill = (preset: (typeof PRESET_SAMPLES)[number]) => {
    setFormData({
      industry: preset.data.industry,
      productName: preset.data.productName,
      budgetLevel: preset.data.budgetLevel,
      objective: preset.data.objective,
      additionalNotes: preset.data.additionalNotes || '',
      targetAudiencePrompt: preset.data.targetAudiencePrompt || '',
      sellingArea: preset.data.sellingArea || '',
      productPrice: preset.data.productPrice || '',
      keyDifferentiator: preset.data.keyDifferentiator || '',
      availableResources: preset.data.availableResources || '',
      specificBudgetVnd: preset.data.specificBudgetVnd,
      brandToneAdjectives: preset.data.brandProfile?.brandToneAdjectives || [],
      permittedClaims: preset.data.brandProfile?.permittedClaims || '',
      wordsToAvoid: preset.data.brandProfile?.wordsToAvoid || ''
    });
    setFieldErrors({});
    // Nhảy thẳng tới Bước 3 để xem tóm tắt và sẵn sàng tạo ý tưởng ngay
    setCurrentStep(3);
    showToast(`Đã áp dụng ${preset.name}. Bạn có thể bấm tạo ý tưởng ngay!`, 'success');
  };

  const handleReset = () => {
    clearAllCampaignData();
    setCurrentStep(1);
    setFieldErrors({});
    if (onReset) {
      onReset();
    }
    showToast('Đã làm mới thông tin chiến dịch và đề xuất ý tưởng', 'info');
  };

  const handleNextStep1 = () => {
    const res = step1Schema.safeParse({ industry, productName });
    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.errors.forEach((err) => {
        errs[err.path.join('.')] = err.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    const res = step2Schema.safeParse({ objective, targetAudiencePrompt, keyDifferentiator });
    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.errors.forEach((err) => {
        errs[err.path.join('.')] = err.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasBrandProfile =
      (brandToneAdjectives && brandToneAdjectives.length > 0) ||
      Boolean(permittedClaims?.trim()) ||
      Boolean(wordsToAvoid?.trim());

    const rawInput: CampaignInput = {
      industry,
      productName,
      budgetLevel,
      objective,
      additionalNotes,
      targetAudiencePrompt: targetAudiencePrompt || undefined,
      sellingArea: sellingArea || undefined,
      productPrice: productPrice || undefined,
      keyDifferentiator: keyDifferentiator || undefined,
      availableResources: availableResources || undefined,
      specificBudgetVnd: specificBudgetVnd || undefined,
      brandProfile: hasBrandProfile
        ? {
            brandToneAdjectives: brandToneAdjectives && brandToneAdjectives.length > 0 ? brandToneAdjectives : undefined,
            permittedClaims: permittedClaims?.trim() || undefined,
            wordsToAvoid: wordsToAvoid?.trim() || undefined
          }
        : undefined
    };

    // Client-side Validation toàn bộ
    const result = campaignInputSchema.safeParse(rawInput);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      setFieldErrors(errors);

      // Nếu lỗi thuộc bước 1 hoặc 2, điều hướng về bước đó
      if (errors.industry || errors.productName) {
        setCurrentStep(1);
      } else if (errors.objective) {
        setCurrentStep(2);
      }
      return;
    }

    setFieldErrors({});
    await onSubmit(result.data);
  };

  const getBudgetLabel = (lvl: BudgetLevel) => {
    if (lvl === 'low') return 'Thấp (Dưới 20 triệu VNĐ)';
    if (lvl === 'medium') return 'Trung bình (20 – 100 triệu VNĐ)';
    return 'Cao (Trên 100 triệu VNĐ)';
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
      {/* Top Banner: Header + Step Indicator & Presets */}
      <div className="pb-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Bước {currentStep}/3
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {currentStep === 1 && 'Bạn đang kinh doanh gì?'}
                {currentStep === 2 && 'Bạn muốn đạt điều gì?'}
                {currentStep === 3 && 'Bạn dự định chi bao nhiêu?'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentStep === 1 && 'Cung cấp ngành hàng và tên sản phẩm để AI nhận diện đặc thù phân khúc.'}
              {currentStep === 2 && 'Xác định mục tiêu cốt lõi và tệp khách hàng tiềm năng cần tiếp cận.'}
              {currentStep === 3 && 'Chọn mức ngân sách, xem lại tóm tắt và tạo 5 ý tưởng chiến dịch.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-2 px-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
              currentStep === 1
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-1 ring-indigo-600/20'
                : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>1. Sản phẩm</span>
              {industry.trim() && productName.trim() && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (industry.trim() && productName.trim()) setCurrentStep(2);
              else handleNextStep1();
            }}
            className={`py-2 px-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
              currentStep === 2
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-1 ring-indigo-600/20'
                : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>2. Mục tiêu</span>
              {objective.trim() && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (industry.trim() && productName.trim() && objective.trim()) setCurrentStep(3);
              else if (!industry.trim() || !productName.trim()) handleNextStep1();
              else handleNextStep2();
            }}
            className={`py-2 px-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
              currentStep === 3
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-1 ring-indigo-600/20'
                : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>3. Ngân sách</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </button>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-slate-400" /> Điền nhanh mẫu:
          </span>
          {PRESET_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePrefill(sample)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
            >
              Mẫu {idx + 1} ({sample.data.industry.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BƯỚC 1: BẠN ĐANG KINH DOANH GÌ?                                           */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fadeIn">
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

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep1}
              className="px-6 py-2.5 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer shadow-sm text-sm"
            >
              <span>Tiếp tục (Mục tiêu chiến dịch)</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 2: BẠN MUỐN ĐẠT ĐIỀU GÌ?                                             */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fadeIn">
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

          {/* Bổ sung đối tượng tiếp cận (Tùy chọn) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label htmlFor="targetAudiencePrompt" className="block text-sm font-medium text-slate-700 mb-1">
                Bạn muốn tiếp cận ai? <span className="text-xs text-slate-400 font-normal">(Tùy chọn)</span>
              </label>
              <input
                id="targetAudiencePrompt"
                type="text"
                value={targetAudiencePrompt || ''}
                onChange={(e) => updateFormField('targetAudiencePrompt', e.target.value)}
                placeholder="VD: Học sinh, sinh viên 16–22 tuổi hoặc Chưa xác định"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label htmlFor="keyDifferentiator" className="block text-sm font-medium text-slate-700 mb-1">
                Điểm khác biệt / Lợi thế sản phẩm <span className="text-xs text-slate-400 font-normal">(Tùy chọn)</span>
              </label>
              <input
                id="keyDifferentiator"
                type="text"
                value={keyDifferentiator || ''}
                onChange={(e) => updateFormField('keyDifferentiator', e.target.value)}
                placeholder="VD: Trân châu tươi làm thủ công trong ngày, giá tốt"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Quay lại Bước 1</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep2}
              className="px-6 py-2.5 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer shadow-sm text-sm"
            >
              <span>Tiếp tục (Ngân sách & Xác nhận)</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 3: BẠN DỰ ĐỊNH CHI BAO NHIÊU? & XÁC NHẬN                             */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Mức ngân sách (3 mức) */}
          <BudgetSelector
            value={budgetLevel}
            onChange={(val) => {
              updateFormField('budgetLevel', val);
              if (fieldErrors.budgetLevel) setFieldErrors((prev) => ({ ...prev, budgetLevel: '' }));
            }}
            error={fieldErrors.budgetLevel}
          />

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

          {/* Khối Bổ sung bối cảnh nâng cao tùy chọn (Accordion) */}
          <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowAdvancedContext(!showAdvancedContext)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Bổ sung bối cảnh để đề xuất sát hơn (Khu vực, giá, nguồn lực...)</span>
                <span className="text-[11px] font-normal text-slate-400">— Tùy chọn</span>
              </span>
              {showAdvancedContext ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdvancedContext && (
              <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-fadeIn">
                <div>
                  <label htmlFor="sellingArea" className="block font-medium text-slate-700 mb-1">
                    Khu vực bán hàng
                  </label>
                  <input
                    id="sellingArea"
                    type="text"
                    value={sellingArea || ''}
                    onChange={(e) => updateFormField('sellingArea', e.target.value)}
                    placeholder="VD: Toàn quốc, TP.HCM, Hà Nội, Đà Nẵng..."
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="productPrice" className="block font-medium text-slate-700 mb-1">
                    Giá bán sản phẩm / dịch vụ
                  </label>
                  <input
                    id="productPrice"
                    type="text"
                    value={productPrice || ''}
                    onChange={(e) => updateFormField('productPrice', e.target.value)}
                    placeholder="VD: 35.000 – 55.000 VNĐ / cốc"
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="availableResources" className="block font-medium text-slate-700 mb-1">
                    Nguồn lực / Nhân sự hiện có
                  </label>
                  <input
                    id="availableResources"
                    type="text"
                    value={availableResources || ''}
                    onChange={(e) => updateFormField('availableResources', e.target.value)}
                    placeholder="VD: 1 nhân sự marketing part-time, có sẵn fanpage 2.000 like"
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="specificBudgetVnd" className="block font-medium text-slate-700 mb-1">
                    Ngân sách dự chi cụ thể (VNĐ)
                  </label>
                  <input
                    id="specificBudgetVnd"
                    type="number"
                    value={specificBudgetVnd || ''}
                    onChange={(e) =>
                      updateFormField(
                        'specificBudgetVnd',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="VD: 15000000 (15 triệu)"
                    className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>

                {/* Tiểu mục: Hồ sơ thương hiệu nhỏ (Mục 5) */}
                <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-xs">Hồ sơ thương hiệu nhỏ (Mục 5)</span>
                    <span className="text-[11px] text-slate-400">— Tùy chọn để AI may đo đúng phong cách</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="brandToneAdjectives" className="block font-medium text-slate-700 mb-1">
                        Giọng thương hiệu (3 tính từ)
                      </label>
                      <input
                        id="brandToneAdjectives"
                        type="text"
                        value={(brandToneAdjectives || []).join(', ')}
                        onChange={(e) => {
                          const val = e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          updateFormField('brandToneAdjectives', val);
                        }}
                        placeholder="VD: Chuyên nghiệp, Tươi trẻ, Độc bản"
                        className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="permittedClaims" className="block font-medium text-slate-700 mb-1">
                        Bằng chứng / Cam kết khẳng định
                      </label>
                      <input
                        id="permittedClaims"
                        type="text"
                        value={permittedClaims || ''}
                        onChange={(e) => updateFormField('permittedClaims', e.target.value)}
                        placeholder="VD: 100% tự nhiên, đổi trả 30 ngày"
                        className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="wordsToAvoid" className="block font-medium text-slate-700 mb-1">
                        Từ ngữ / Cách nói cần tránh
                      </label>
                      <input
                        id="wordsToAvoid"
                        type="text"
                        value={wordsToAvoid || ''}
                        onChange={(e) => updateFormField('wordsToAvoid', e.target.value)}
                        placeholder="VD: Rẻ nhất, Cam kết số 1"
                        className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Khối Tóm Tắt Thông Tin Chiến Dịch (Review Block) */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Tóm tắt thông tin chiến dịch
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">Bấm "Sửa" nếu muốn chỉnh lại</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-indigo-100/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-medium text-slate-600">Sản phẩm (Bước 1)</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-indigo-600 hover:text-indigo-800 p-0.5"
                    title="Chỉnh sửa bước 1"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-semibold text-slate-900 truncate">{productName || '(Chưa nhập)'}</div>
                <div className="text-[11px] text-slate-500 truncate">{industry || '(Chưa chọn ngành)'}</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-indigo-100/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-medium text-slate-600">Mục tiêu (Bước 2)</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-indigo-600 hover:text-indigo-800 p-0.5"
                    title="Chỉnh sửa bước 2"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-semibold text-slate-900 line-clamp-2">{objective || '(Chưa nhập)'}</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-indigo-100/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-medium text-slate-600">Ngân sách (Bước 3)</span>
                </div>
                <div className="font-semibold text-slate-900">{getBudgetLabel(budgetLevel)}</div>
                {specificBudgetVnd && (
                  <div className="text-[11px] text-emerald-600 font-medium">
                    {specificBudgetVnd.toLocaleString('vi-VN')} VNĐ
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Quay lại Bước 2</span>
            </button>

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
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tạo 05 ý tưởng chiến dịch Marketing</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

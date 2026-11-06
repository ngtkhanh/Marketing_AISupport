'use client';

import React from 'react';
import { ContingencyTrigger } from '@/types/marketing';
import { formatVND } from '@/lib/proposal-calculations';
import {
  ShieldAlert,
  Calendar,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  HelpCircle,
  Plus,
  Trash2
} from 'lucide-react';

interface ContingencyPlanCardProps {
  triggers: ContingencyTrigger[];
  contingencyFundAmount: number;
  onChange?: (updatedTriggers: ContingencyTrigger[]) => void;
  readOnly?: boolean;
}

export const ContingencyPlanCard: React.FC<ContingencyPlanCardProps> = ({
  triggers,
  contingencyFundAmount,
  onChange,
  readOnly = false
}) => {
  const handleDeleteTrigger = (triggerId: string) => {
    if (readOnly || !onChange) return;
    onChange(triggers.filter((t) => t.id !== triggerId));
  };

  const handleAddTrigger = () => {
    if (readOnly || !onChange) return;
    const risk = prompt('Nhập rủi ro cần dự phòng:');
    if (!risk || !risk.trim()) return;

    const newTrigger: ContingencyTrigger = {
      id: `trigger_custom_${Date.now()}`,
      risk: risk.trim(),
      checkpointDay: 'Ngày 7',
      triggerMetric: 'Lượt tương tác và tỷ lệ chuyển đổi',
      triggerCondition: 'Kết quả thấp hơn 50% chỉ số mục tiêu tuần',
      correctiveAction: 'Điều chỉnh thông điệp và tối ưu lại nhóm đối tượng quảng cáo',
      maxBudgetCap: Math.round(contingencyFundAmount * 0.3)
    };

    onChange([...triggers, newTrigger]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Tiêu đề & Quỹ dự phòng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Kế Hoạch Dự Phòng Rủi Ro & Ngưỡng Kích Hoạt Plan B
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Xác định trước các điểm cảnh báo (Checkpoints) để kịp thời kích hoạt phương án xoay trục mà không bị động.
          </p>
        </div>

        {/* Khối Quỹ an toàn khả dụng */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-rose-50/70 border border-rose-200 px-3.5 py-2 rounded-xl text-xs">
          <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="text-[11px] text-rose-700 font-medium block">
              Quỹ an toàn khả dụng:
            </span>
            <span className="text-sm font-extrabold text-rose-800 font-mono">
              {formatVND(contingencyFundAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Danh sách các kịch bản dự phòng rủi ro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {triggers.map((trigger, index) => (
          <div
            key={trigger.id}
            className="rounded-xl border border-slate-200 hover:border-slate-300 bg-gradient-to-b from-white to-slate-50/50 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs transition"
          >
            {/* Header của thẻ rủi ro: Checkpoint & Rủi ro */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Điểm kiểm tra: {trigger.checkpointDay}
                </span>

                {!readOnly && onChange && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTrigger(trigger.id)}
                    title="Xóa kịch bản này"
                    className="text-slate-300 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  Rủi ro #{index + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                  {trigger.risk}
                </h4>
              </div>
            </div>

            {/* Chi tiết điều kiện kích hoạt & Hành động */}
            <div className="space-y-2.5 text-xs">
              {/* Chỉ số theo dõi */}
              <div className="bg-slate-100/70 p-2 rounded-lg flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Chỉ số theo dõi:
                </span>
                <span className="font-semibold text-slate-800">
                  {trigger.triggerMetric}
                </span>
              </div>

              {/* Ngưỡng kích hoạt Plan B */}
              <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 space-y-1">
                <span className="font-bold text-rose-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Ngưỡng kích hoạt Plan B (Trigger Condition):
                </span>
                <p className="text-slate-700 pl-4 font-medium italic">
                  &ldquo;{trigger.triggerCondition}&rdquo;
                </p>
              </div>

              {/* Hành động ứng phó cụ thể */}
              <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  Hành động ứng phó (Corrective Action):
                </span>
                <p className="text-slate-700 pl-4 font-medium leading-relaxed">
                  {trigger.correctiveAction}
                </p>
              </div>
            </div>

            {/* Giới hạn ngân sách tối đa trích từ Quỹ dự phòng */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Ngân sách trần cho phép:
              </span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                Tối đa {formatVND(trigger.maxBudgetCap)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm kịch bản rủi ro nếu chưa ở chế độ readOnly */}
      {!readOnly && onChange && (
        <button
          type="button"
          onClick={handleAddTrigger}
          className="w-full py-2.5 rounded-xl border border-dashed border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50/40 flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          Bổ sung kịch bản dự phòng rủi ro mới
        </button>
      )}

      {/* Lời khuyên xử lý chất vấn tại bàn họp */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Bảo vệ kế hoạch khi Sếp hỏi:</strong>{' '}
          &ldquo;Nếu tuần đầu chiến dịch không ai tương tác thì sao?&rdquo; &rarr; Bạn có thể tự tin trả lời:
          &ldquo;Dạ, team đã thiết lập Checkpoint vào <strong>Ngày 5</strong>. Nếu lượng Reach hữu cơ dưới 3.000, chúng em sẽ trích ngay tối đa <strong>{formatVND(triggers[0]?.maxBudgetCap || contingencyFundAmount)}</strong> từ Quỹ an toàn để chạy Spark Ads cứu bài, đảm bảo không ảnh hưởng đến dòng tiền chính.&rdquo;
        </p>
      </div>
    </div>
  );
};


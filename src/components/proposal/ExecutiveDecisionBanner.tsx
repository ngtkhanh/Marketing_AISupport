'use client';

import React from 'react';
import { ExecutiveDecision, ProposalStatus } from '@/types/marketing';
import { formatVND } from '@/lib/proposal-calculations';
import {
  FileCheck2,
  Calendar,
  UserCheck,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  FileQuestion
} from 'lucide-react';

interface ExecutiveDecisionBannerProps {
  decision: ExecutiveDecision;
  onChange?: (updated: ExecutiveDecision) => void;
  readOnly?: boolean;
  status?: ProposalStatus;
}

export const ExecutiveDecisionBanner: React.FC<ExecutiveDecisionBannerProps> = ({
  decision,
  onChange,
  readOnly = false,
  status = 'draft'
}) => {
  const handleDecisionAskChange = (text: string) => {
    if (readOnly || !onChange) return;
    onChange({
      ...decision,
      decisionAsk: text
    });
  };

  const handleDeadlineChange = (deadline: string) => {
    if (readOnly || !onChange) return;
    onChange({
      ...decision,
      approvalDeadline: deadline
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-xl border border-indigo-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Tiêu đề & Vai trò phê duyệt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Executive Summary
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {decision.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {status === 'draft' ? (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
              <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
              Bản Nháp (Cần xác nhận giả định)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Sẵn Sàng Duyệt
            </span>
          )}

          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-xs text-xs">
            <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-500 font-medium">Người duyệt thẩm quyền:</span>
            <span className="font-bold text-slate-800">{decision.approverRole}</span>
          </div>
        </div>
      </div>

      {/* Khối yêu cầu phê duyệt cốt lõi (The Ask) */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-indigo-100/90 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-indigo-600" />
            Yêu cầu phê duyệt cốt lõi (Core Decision Ask):
          </span>
          {!readOnly && (
            <span className="text-slate-400 flex items-center gap-1 text-[11px] font-normal">
              <Edit3 className="w-3 h-3" />
              Có thể chỉnh sửa
            </span>
          )}
        </div>

        {readOnly ? (
          <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
            {decision.decisionAsk}
          </p>
        ) : (
          <textarea
            rows={2}
            value={decision.decisionAsk}
            onChange={(e) => handleDecisionAskChange(e.target.value)}
            className="w-full text-slate-800 text-sm sm:text-base font-medium leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            aria-label="Nội dung yêu cầu phê duyệt"
          />
        )}
      </div>

      {/* 2 Khối thông tin then chốt: Ngân sách & Hạn chót */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Ngân sách đề nghị */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-indigo-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Ngân sách đề xuất:</span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono">
              {formatVND(decision.proposedBudget)}
            </div>
          </div>
        </div>

        {/* Hạn chót phê duyệt */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-indigo-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-500 font-medium">Hạn chót phê duyệt duyệt chi:</span>
            {readOnly ? (
              <div className="text-sm sm:text-base font-bold text-slate-900">
                {decision.approvalDeadline || 'Trước giờ G 5 ngày'}
              </div>
            ) : (
              <input
                type="text"
                value={decision.approvalDeadline || ''}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                placeholder="Ví dụ: Trước ngày 15/11/2026"
                className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-0.5"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tiêu chí đánh giá Go/No-Go trước khi giải ngân */}
      <div className="bg-white/80 rounded-xl p-4 border border-indigo-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            4 Tiêu chí Go / No-Go trước khi bấm nút giải ngân:
          </span>
          <span className="text-[11px] text-slate-500">
            (Đạt cả 4 tiêu chí mới bắt đầu chạy quảng cáo)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {decision.goNoGoCriteria.map((criterion, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                ✓
              </div>
              <span className="text-slate-700 leading-snug">{criterion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


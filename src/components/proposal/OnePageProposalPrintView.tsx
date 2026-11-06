'use client';

import React, { useState } from 'react';
import { CampaignProposal } from '@/types/marketing';
import { formatVND } from '@/lib/proposal-calculations';
import {
  Printer,
  X,
  FileText,
  Layout,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  DollarSign,
  Target,
  Sparkles,
  Info
} from 'lucide-react';

interface OnePageProposalPrintViewProps {
  proposal: CampaignProposal;
  onClose?: () => void;
}

export const OnePageProposalPrintView: React.FC<OnePageProposalPrintViewProps> = ({
  proposal,
  onClose
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formattedDate = new Date(proposal.updatedAt || proposal.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Print CSS: Đảm bảo chỉ in chính xác khu vực A4, ẩn toàn bộ UI thừa của web */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
                margin: 6mm 8mm;
              }
              body * {
                visibility: hidden !important;
              }
              #one-page-proposal-print-area, #one-page-proposal-print-area * {
                visibility: visible !important;
              }
              #one-page-proposal-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                box-shadow: none !important;
                border: none !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-no-break {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          `
        }}
      />

      {/* Thanh công cụ điều khiển xem trước & In ấn (Ẩn hoàn toàn khi in) */}
      <div className="print:hidden bg-slate-900 text-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500 text-white uppercase tracking-wider">
              Bản In Chuẩn A4
            </span>
            <h3 className="font-bold text-sm sm:text-base">
              Bản Tóm Tắt 1 Trang Trình Sếp & Đối Tác (1-Page Pitch)
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Bố cục Bento Grid 4 góc cân đối chính xác vừa vặn 1 trang giấy A4. Khi in chọn &ldquo;Đồ họa nền&rdquo; để hiển thị đầy đủ màu sắc.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tùy chọn khổ dọc / ngang */}
          <div className="flex p-0.5 bg-slate-800 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
                orientation === 'portrait'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Khổ Dọc
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
                orientation === 'landscape'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Khổ Ngang
            </button>
          </div>

          {/* Nút In ấn chính */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            In / Xuất PDF A4
          </button>

          {/* Nút đóng */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Đóng bản in"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* VÙNG IN CHUẨN A4 — ĐƯỢC CĂN CHỈNH TỶ LỆ CHÍNH XÁC (PRINT CONTAINER) */}
      <div className="overflow-x-auto pb-4">
        <div
          id="one-page-proposal-print-area"
          className={`mx-auto bg-white border border-slate-300 text-slate-900 shadow-xl transition-all duration-300 ${
            orientation === 'landscape'
              ? 'w-[297mm] min-h-[205mm] p-6'
              : 'w-[210mm] min-h-[292mm] p-6'
          }`}
          style={{ boxSizing: 'border-box' }}
        >
          {/* 1. Header Trang A4: Thương hiệu & Tiêu đề đề xuất */}
          <div className="border-b-2 border-slate-900 pb-3 mb-3 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded">
                  MEETING-READY PROPOSAL
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Mã: {proposal.id.slice(0, 18)}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">
                {proposal.ideaSnapshot.title}
              </h1>
              <p className="text-xs font-semibold text-indigo-700 italic">
                &ldquo;{proposal.ideaSnapshot.tagline}&rdquo;
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-600 font-medium space-y-0.5">
              <div>
                Ngày lập: <strong className="text-slate-900">{formattedDate}</strong>
              </div>
              <div>
                Người duyệt: <strong className="text-slate-900">{proposal.executiveDecision.approverRole}</strong>
              </div>
              <div>
                Trạng thái: <strong className="text-emerald-700 uppercase">Chờ Phê Duyệt</strong>
              </div>
            </div>
          </div>

          {/* 2. Dải tóm tắt Yêu Cầu Phê Duyệt (Executive Decision Strip) */}
          <div className="bg-slate-100 p-2.5 rounded border border-slate-300 mb-3 flex items-center justify-between gap-3 text-xs print-no-break">
            <div className="flex-1">
              <strong className="text-indigo-950 uppercase text-[10px] tracking-wide block">
                Yêu cầu phê duyệt cốt lõi (The Decision Ask):
              </strong>
              <span className="font-semibold text-slate-800 leading-snug">
                {proposal.executiveDecision.decisionAsk}
              </span>
            </div>
            <div className="text-right shrink-0 border-l border-slate-300 pl-3">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Hạn mức đề xuất</span>
              <span className="text-base font-black text-indigo-900 font-mono">
                {formatVND(proposal.budgetAllocation.totalBudget)}
              </span>
            </div>
          </div>

          {/* 3. BỐ CỤC BENTO 4 GÓC (4 QUADRANTS GRID) */}
          <div
            className={`grid gap-3 ${
              orientation === 'landscape' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {/* GÓC 1: TỔNG QUAN CHIẾN LƯỢC & ĐỐI TƯỢNG */}
            <div className="border border-slate-300 rounded p-3 bg-white space-y-2.5 print-no-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                  1. Chiến Lược Cốt Lõi & Khách Hàng
                </h2>
                <span className="text-[10px] text-slate-500 font-medium">
                  {proposal.context.industry}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div>
                  <span className="font-bold text-slate-900">Sản phẩm:</span>{' '}
                  {proposal.context.productName}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Mục tiêu:</span>{' '}
                  {proposal.context.objective}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Khách hàng mục tiêu:</span>{' '}
                  {proposal.ideaSnapshot.targetAudience}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Nội dung then chốt:</span>{' '}
                  <span className="leading-snug">{proposal.ideaSnapshot.mainContent}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Kênh triển khai:</span>{' '}
                  <span className="inline-flex flex-wrap gap-1 mt-0.5">
                    {proposal.ideaSnapshot.channels.map((ch, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded text-[10px] font-semibold border border-slate-200"
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>

            {/* GÓC 2: PHÂN BỔ NGÂN SÁCH & 3 KỊCH BẢN KPI */}
            <div className="border border-slate-300 rounded p-3 bg-white space-y-2.5 print-no-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                  2. Ngân Sách & 3 Kịch Bản KPI Kỳ Vọng
                </h2>
                <span className="text-[10px] font-bold text-emerald-800">
                  Cân bằng 100%
                </span>
              </div>

              {/* Bảng nhỏ phân bổ ngân sách 5 nhóm */}
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-1">Nhóm chi phí</th>
                    <th className="py-1 text-center w-12">Tỷ lệ</th>
                    <th className="py-1 text-right">Số tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposal.budgetAllocation.items.map((item) => (
                    <tr key={item.id} className={item.isContingency ? 'bg-rose-50/50 font-semibold' : ''}>
                      <td className="py-0.8 flex items-center gap-1">
                        {item.isContingency && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                        {item.label}
                      </td>
                      <td className="py-0.8 text-center font-mono">{item.percentage}%</td>
                      <td className="py-0.8 text-right font-mono font-medium">
                        {formatVND(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bảng so sánh 3 kịch bản KPI */}
              <div className="pt-1 border-t border-slate-200">
                <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Chỉ số kỳ vọng theo 3 kịch bản:
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {proposal.kpiScenarios.map((s) => (
                    <div
                      key={s.name}
                      className={`p-1.5 rounded border ${
                        s.name === 'base'
                          ? 'bg-indigo-50/60 border-indigo-300 font-bold'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-[9px] text-slate-500 uppercase">{s.label}</div>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        {s.orders} đơn
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono">
                        CPO: {formatVND(s.targetCPO)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GÓC 3: LỘ TRÌNH 4 TUẦN THỰC THI & PHÂN VAI */}
            <div className="border border-slate-300 rounded p-3 bg-white space-y-2 print-no-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-600 rounded-full" />
                  3. Lộ Trình 4 Tuần Thực Thi & Phân Vai
                </h2>
                <span className="text-[10px] text-slate-500 font-medium">
                  Trách nhiệm rõ ràng
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {proposal.ideaSnapshot.timeline.map((w) => (
                  <div key={w.week} className="border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                    <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>Tuần {w.week}: {w.title}</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {w.activities.length} đầu việc
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-slate-700 text-[10.5px] space-y-0.5 mt-0.5 pl-0.5">
                      {w.activities.slice(0, 2).map((act, idx) => (
                        <li key={idx} className="leading-snug">
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* GÓC 4: CHUẨN BỊ, RỦI RO PLAN B & CHỮ KÝ DUYỆT CHI */}
            <div className="border border-slate-300 rounded p-3 bg-white space-y-2.5 print-no-break flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-rose-600 rounded-full" />
                    4. Tiền Chiến Dịch & Kế Hoạch Dự Phòng
                  </h2>
                  <span className="text-[10px] text-rose-700 font-bold">
                    Plan B Triggers
                  </span>
                </div>

                {/* Checklist chuẩn bị tiền chiến dịch */}
                <div className="space-y-1 text-[10.5px] text-slate-700">
                  <span className="font-bold text-slate-900 block text-[10px] uppercase">
                    Chuẩn bị trước giờ G (Pre-launch):
                  </span>
                  {proposal.checklist
                    .filter((t) => t.stage === 'pre_launch')
                    .slice(0, 3)
                    .map((t) => (
                      <div key={t.id} className="flex items-start gap-1 leading-tight">
                        <span className="text-indigo-600 font-bold">[{t.dueDate}]</span>
                        <span>{t.task}</span>
                      </div>
                    ))}
                </div>

                {/* Điểm kích hoạt Plan B */}
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10.5px] space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1 text-[10px] uppercase">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    Checkpoint Rủi Ro: {proposal.contingencyTriggers[0]?.checkpointDay}
                  </div>
                  <p className="text-slate-700 leading-snug">
                    Nếu: {proposal.contingencyTriggers[0]?.triggerCondition} &rarr;{' '}
                    <strong>{proposal.contingencyTriggers[0]?.correctiveAction}</strong> (Trần chi: {formatVND(proposal.contingencyTriggers[0]?.maxBudgetCap || 0)}).
                  </p>
                </div>
              </div>

              {/* KHỐI 2 Ô CHỮ KÝ PHÊ DUYỆT CỦA 2 BÊN */}
              <div className="pt-2 border-t-2 border-slate-900 grid grid-cols-2 gap-4 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-900 uppercase text-[10.5px]">
                    Người Lập Kế Hoạch
                  </div>
                  <div className="text-[9.5px] text-slate-500 italic mb-8">
                    (Ký và ghi rõ họ tên)
                  </div>
                  <div className="text-xs font-semibold text-slate-800 border-t border-dashed border-slate-300 pt-1 mx-2">
                    Marketer / Brand Owner
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 uppercase text-[10.5px]">
                    Đại Diện Phê Duyệt / Sếp
                  </div>
                  <div className="text-[9.5px] text-slate-500 italic mb-8">
                    (Ký duyệt giải ngân & đóng dấu)
                  </div>
                  <div className="text-xs font-semibold text-slate-800 border-t border-dashed border-slate-300 pt-1 mx-2">
                    {proposal.executiveDecision.approverRole}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dòng chân trang A4 */}
          <div className="mt-3 pt-2 border-t border-slate-200 text-[9.5px] text-slate-400 flex items-center justify-between">
            <span>Hệ thống Marketing AI Supporter — Meeting-Ready Campaign Proposal</span>
            <span>Bản in chuẩn tỷ lệ A4 (1-Page Executive Pitch) • Bảo toàn vốn & Minh bạch KPI</span>
          </div>
        </div>
      </div>
    </div>
  );
};


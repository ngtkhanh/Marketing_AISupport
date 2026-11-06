'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CampaignProposal,
  MarketingIdea,
  CampaignInput
} from '@/types/marketing';
import { generateDefaultProposal } from '@/lib/proposal-generator';
import {
  getProposalByCampaignId,
  saveProposal
} from '@/lib/proposal-storage';
import { useToast } from '../Toast';
import { ExecutiveDecisionBanner } from './ExecutiveDecisionBanner';
import { BudgetAllocationEditor } from './BudgetAllocationEditor';
import { KpiScenariosMatrix } from './KpiScenariosMatrix';
import { ActionChecklistEditor } from './ActionChecklistEditor';
import { ContingencyPlanCard } from './ContingencyPlanCard';
import { OnePageProposalPrintView } from './OnePageProposalPrintView';
import {
  X,
  FileCheck2,
  DollarSign,
  BarChart3,
  CheckSquare,
  ShieldAlert,
  Printer,
  Save,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: MarketingIdea;
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  onProposalSaved?: (savedProposal: CampaignProposal) => void;
}

type ProposalTab = 'overview' | 'budget' | 'kpi' | 'checklist' | 'risk' | 'print';

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  idea,
  context,
  onProposalSaved
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ProposalTab>('overview');
  const [proposal, setProposal] = useState<CampaignProposal | null>(null);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Khởi tạo hoặc tải proposal đã lưu từ localStorage
  const initProposal = useCallback(() => {
    if (!isOpen || !idea) return;

    const existing = getProposalByCampaignId(idea.id, idea.version || 1);
    if (existing) {
      setProposal(existing);
    } else {
      const generated = generateDefaultProposal(idea, context);
      setProposal(generated);
    }
  }, [isOpen, idea, context]);

  useEffect(() => {
    initProposal();
    setActiveTab('overview');
    setIsSavedRecently(false);
  }, [initProposal]);

  if (!isOpen || !proposal) return null;

  // Xử lý lưu proposal
  const handleSave = (silent = false) => {
    if (!proposal) return;
    const ok = saveProposal(proposal);
    if (ok) {
      setIsSavedRecently(true);
      if (!silent) {
        showToast('Đã lưu bản Proposal thành công vào trình duyệt!', 'success');
      }
      if (onProposalSaved) {
        onProposalSaved(proposal);
      }
      setTimeout(() => setIsSavedRecently(false), 2500);
    } else {
      if (!silent) {
        showToast('Không thể lưu proposal. Vui lòng thử lại.', 'error');
      }
    }
  };

  // Làm mới lại proposal từ template gốc
  const handleResetToDefault = () => {
    if (confirm('Bạn có chắc muốn đặt lại toàn bộ phân bổ ngân sách và checklist về mẫu ban đầu?')) {
      const refreshed = generateDefaultProposal(idea, context);
      setProposal(refreshed);
      saveProposal(refreshed);
      showToast('Đã khôi phục bản đề xuất về mẫu chuẩn Playbook ban đầu.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="bg-white border-b border-slate-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                Meeting-Ready Proposal
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Phiên bản: v{idea.version || 1}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 line-clamp-1">
              Bản Đề Xuất Chiến Dịch: {idea.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Nút reset */}
            <button
              type="button"
              onClick={handleResetToDefault}
              title="Đặt lại về mẫu chuẩn ban đầu"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Nút lưu */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
                isSavedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Proposal</span>
                </>
              )}
            </button>

            {/* Nút in nhanh */}
            <button
              type="button"
              onClick={() => setActiveTab('print')}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Xuất A4</span>
            </button>

            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => {
                handleSave(true); // Tự động lưu nháp khi đóng
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 overflow-x-auto flex items-center gap-1 sm:gap-2 shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>Quyết định & Tổng quan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'budget'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Ngân sách bóc tách</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kpi')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'kpi'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>3 Kịch bản KPI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'checklist'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>Lộ trình & Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'risk'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Rủi ro & Plan B</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('print')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'print'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Xem & In Bản A4</span>
          </button>
        </div>

        {/* Body Modal: Chứa nội dung từng Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ExecutiveDecisionBanner
                decision={proposal.executiveDecision}
                onChange={(updatedDecision) =>
                  setProposal({ ...proposal, executiveDecision: updatedDecision })
                }
              />

              {/* Tóm tắt nhanh thẻ chiến lược */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Chiến lược cốt lõi của chiến dịch
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {proposal.ideaSnapshot.mainContent}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Kênh triển khai:</span>
                  {proposal.ideaSnapshot.channels.map((ch, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <BudgetAllocationEditor
              allocation={proposal.budgetAllocation}
              onChange={(updatedAllocation) =>
                setProposal({ ...proposal, budgetAllocation: updatedAllocation })
              }
            />
          )}

          {activeTab === 'kpi' && (
            <KpiScenariosMatrix
              scenarios={proposal.kpiScenarios}
              onChange={(updatedScenarios) =>
                setProposal({ ...proposal, kpiScenarios: updatedScenarios })
              }
            />
          )}

          {activeTab === 'checklist' && (
            <ActionChecklistEditor
              checklist={proposal.checklist}
              onChange={(updatedChecklist) =>
                setProposal({ ...proposal, checklist: updatedChecklist })
              }
            />
          )}

          {activeTab === 'risk' && (
            <ContingencyPlanCard
              triggers={proposal.contingencyTriggers}
              contingencyFundAmount={
                proposal.budgetAllocation.items.find(
                  (i) => i.isContingency || i.category === 'contingency_fund'
                )?.amount || 0
              }
              onChange={(updatedTriggers) =>
                setProposal({ ...proposal, contingencyTriggers: updatedTriggers })
              }
            />
          )}

          {activeTab === 'print' && (
            <OnePageProposalPrintView
              proposal={proposal}
              onClose={() => setActiveTab('overview')}
            />
          )}
        </div>
      </div>
    </div>
  );
};


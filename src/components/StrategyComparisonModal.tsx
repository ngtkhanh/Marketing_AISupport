'use client';

import React, { useState, useEffect } from 'react';
import { ShortlistEntry } from '@/types/marketing';
import { evaluateStrategy, generateComparisonMarkdown } from '@/lib/comparison-analysis';
import {
  X,
  Star,
  Copy,
  Check,
  DollarSign,
  Tv,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Wrench,
  Target,
  Edit3,
  Sparkles
} from 'lucide-react';
import { copyToClipboard } from '@/lib/format-summary';
import { useToast } from './Toast';

interface StrategyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ShortlistEntry[];
  onTogglePrimary: (entryId: string) => void;
  onUpdateNotes: (entryId: string, notes: string) => void;
}

export function StrategyComparisonModal({
  isOpen,
  onClose,
  entries,
  onTogglePrimary,
  onUpdateNotes
}: StrategyComparisonModalProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Đóng modal bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || entries.length === 0) return null;

  const handleCopyMarkdown = async () => {
    const md = generateComparisonMarkdown(entries);
    const ok = await copyToClipboard(md);
    if (ok) {
      setCopied(true);
      showToast('Đã sao chép bảng so sánh (Markdown) vào Clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Không thể sao chép bảng so sánh.', 'error');
    }
  };

  const handleStartEditNote = (entry: ShortlistEntry) => {
    setEditingNoteId(entry.id);
    setTempNote(entry.userNotes || '');
  };

  const handleSaveNote = (entryId: string) => {
    onUpdateNotes(entryId, tempNote);
    setEditingNoteId(null);
    showToast('Đã lưu ghi chú cá nhân thành công!', 'success');
  };

  // Tính toán trước phân tích định tính cho từng chiến dịch
  const evaluations = entries.map((e) =>
    evaluateStrategy(e.idea, {
      budgetLevel: e.context.budgetLevel,
      objective: e.context.objective,
      industry: e.context.industry
    })
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 shrink-0">
          <div>
            <h2
              id="comparison-modal-title"
              className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Bảng So Sánh Chiến Lược ({entries.length} phương án)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh đa tiêu chí, phân tích định tính thực tế và chọn ra phương án ưu tiên triển khai
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              title="Sao chép toàn bộ bảng so sánh dạng Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép MD' : 'Sao chép Markdown'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ so sánh"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Body (Responsive Scroll Table) */}
        <div className="overflow-x-auto overflow-y-auto flex-1 p-4 sm:p-6 divide-y divide-slate-100">
          <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
            {/* Table Header: Campaign Names & Primary Star */}
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-3 w-40 sm:w-48 font-bold text-slate-500 uppercase tracking-wider text-[11px] align-top bg-slate-50/80 rounded-tl-xl">
                  Tiêu chí so sánh
                </th>
                {entries.map((entry) => (
                  <th
                    key={entry.id}
                    className={`p-3 align-top transition-colors ${
                      entry.isPrimary
                        ? 'bg-emerald-50/60 border-x-2 border-emerald-400'
                        : 'bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Nút gắn nhãn Ưu tiên triển khai */}
                      <button
                        type="button"
                        onClick={() => onTogglePrimary(entry.id)}
                        className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          entry.isPrimary
                            ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${entry.isPrimary ? 'fill-current' : ''}`} />
                        <span>{entry.isPrimary ? '⭐ Đang Ưu Tiên Triển Khai' : 'Đặt làm Ưu tiên'}</span>
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {entry.idea.title}
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold shrink-0">
                            v{entry.idea.version || 1}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 font-medium italic mt-0.5">
                          "{entry.idea.tagline}"
                        </p>
                      </div>

                      {/* Ghi chú cá nhân */}
                      <div className="pt-2 border-t border-slate-100 text-xs">
                        {editingNoteId === entry.id ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              placeholder="Nhập ghi chú riêng của bạn cho chiến dịch này..."
                              className="w-full text-xs p-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-700"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveNote(entry.id)}
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                              >
                                Lưu ghi chú
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditNote(entry)}
                            className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/70 text-amber-900 cursor-pointer hover:bg-amber-100/70 transition-colors flex items-start gap-1.5"
                            title="Bấm để chỉnh sửa ghi chú"
                          >
                            <Edit3 className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-tight line-clamp-2">
                              {entry.userNotes ? entry.userNotes : <span className="text-amber-700/60 italic">+ Thêm ghi chú riêng...</span>}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix Rows */}
            <tbody className="divide-y divide-slate-100">
              {/* Row 1: Ngân sách */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Ngân sách dự tính</span>
                  </div>
                </td>
                {entries.map((e) => (
                  <td
                    key={e.id}
                    className={`p-3 align-top font-bold text-slate-900 ${
                      e.isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                      {e.idea.estimatedBudget}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 2: Kênh tiếp thị */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-indigo-600" />
                    <span>Kênh tiếp thị chính</span>
                  </div>
                </td>
                {entries.map((e) => (
                  <td
                    key={e.id}
                    className={`p-3 align-top ${
                      e.isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    <div className="flex flex-wrap gap-1">
                      {e.idea.channels.map((ch, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 3: Khách hàng mục tiêu */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Khách hàng mục tiêu</span>
                  </div>
                </td>
                {entries.map((e) => (
                  <td
                    key={e.id}
                    className={`p-3 align-top text-xs text-slate-700 leading-relaxed ${
                      e.isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    {e.idea.targetAudience}
                  </td>
                ))}
              </tr>

              {/* Row 4: Cốt lõi chiến lược */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Nội dung chiến lược</span>
                  </div>
                </td>
                {entries.map((e) => (
                  <td
                    key={e.id}
                    className={`p-3 align-top text-xs text-slate-700 leading-relaxed ${
                      e.isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      {e.idea.mainContent}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 5: Kế hoạch 4 tuần */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Kế hoạch 4 tuần</span>
                  </div>
                </td>
                {entries.map((e) => (
                  <td
                    key={e.id}
                    className={`p-3 align-top space-y-1.5 ${
                      e.isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      {e.idea.timeline.map((w) => (
                        <div key={w.week} className="text-xs bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                          <span className="font-bold text-indigo-700">T{w.week}: </span>
                          <span className="font-medium text-slate-800">{w.title}</span>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {w.activities.join(' • ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 6: Độ phức tạp thực thi (Định tính) */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-slate-600" />
                    <span>Độ phức tạp thực thi</span>
                  </div>
                </td>
                {evaluations.map((ev, idx) => (
                  <td
                    key={entries[idx].id}
                    className={`p-3 align-top space-y-1 ${
                      entries[idx].isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        ev.complexityLevel === 'Thấp'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.complexityLevel === 'Trung bình'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Mức độ: {ev.complexityLevel}
                    </span>
                    <p className="text-xs text-slate-600 leading-snug">{ev.complexityReason}</p>
                  </td>
                ))}
              </tr>

              {/* Row 7: Nguồn lực cần chuẩn bị */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Nguồn lực cần chuẩn bị</span>
                  </div>
                </td>
                {evaluations.map((ev, idx) => (
                  <td
                    key={entries[idx].id}
                    className={`p-3 align-top ${
                      entries[idx].isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    <ul className="text-xs text-slate-700 space-y-1 list-disc pl-3.5 leading-snug">
                      {ev.requiredResources.map((res, i) => (
                        <li key={i}>{res}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Row 8: Rủi ro & Phòng ngừa */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Rủi ro chính & Phòng tránh</span>
                  </div>
                </td>
                {evaluations.map((ev, idx) => (
                  <td
                    key={entries[idx].id}
                    className={`p-3 align-top space-y-2 ${
                      entries[idx].isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-rose-800 uppercase">Rủi ro:</p>
                      <ul className="text-xs text-slate-700 list-disc pl-3.5 space-y-0.5">
                        {ev.keyRisks.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-emerald-800 uppercase">Phòng tránh:</p>
                      <ul className="text-xs text-slate-700 list-disc pl-3.5 space-y-0.5">
                        {ev.mitigationTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 9: Phù hợp mục tiêu ban đầu */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50 align-top rounded-bl-xl">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-rose-600" />
                    <span>Mức độ phù hợp mục tiêu</span>
                  </div>
                </td>
                {evaluations.map((ev, idx) => (
                  <td
                    key={entries[idx].id}
                    className={`p-3 align-top text-xs text-slate-700 leading-relaxed ${
                      entries[idx].isPrimary ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''
                    }`}
                  >
                    {ev.goalAlignmentScoreRationale}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
          <p className="text-xs text-slate-500">
            Tip: Bấm ⭐ trên chiến dịch để đánh dấu phương án được chọn cho toàn team.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy MD</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              Đóng bảng so sánh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


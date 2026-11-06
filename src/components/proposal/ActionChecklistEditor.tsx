'use client';

import React, { useState, useMemo } from 'react';
import { ExecutionTask, ExecutionStage } from '@/types/marketing';
import {
  CheckSquare,
  Clock,
  User,
  Package,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Filter,
  Sparkles,
  Layers
} from 'lucide-react';

interface ActionChecklistEditorProps {
  checklist: ExecutionTask[];
  onChange: (updatedChecklist: ExecutionTask[]) => void;
  readOnly?: boolean;
}

// Màu sắc và cấu hình nhãn vai trò chuyên môn
const ROLE_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  'Content/Thiết kế': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Vận hành/Ads': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'CSKH/Sales': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Lead/Điều phối': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
};

export const ActionChecklistEditor: React.FC<ActionChecklistEditorProps> = ({
  checklist,
  onChange,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<'pre_launch' | 'timeline'>('pre_launch');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');

  // Tính toán tỷ lệ hoàn thành
  const stats = useMemo(() => {
    const total = checklist.length;
    const completed = checklist.filter((t) => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const preLaunchTasks = checklist.filter((t) => t.stage === 'pre_launch');
    const preLaunchCompleted = preLaunchTasks.filter((t) => t.completed).length;

    const weeklyTasks = checklist.filter((t) => t.stage !== 'pre_launch');
    const weeklyCompleted = weeklyTasks.filter((t) => t.completed).length;

    return {
      total,
      completed,
      percent,
      preLaunchTotal: preLaunchTasks.length,
      preLaunchCompleted,
      weeklyTotal: weeklyTasks.length,
      weeklyCompleted
    };
  }, [checklist]);

  // Toggle hoàn thành task
  const handleToggleComplete = (taskId: string) => {
    if (readOnly) return;
    const updated = checklist.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onChange(updated);
  };

  // Cập nhật người phụ trách
  const handleAssigneeChange = (taskId: string, assigneeName: string) => {
    if (readOnly) return;
    const updated = checklist.map((t) =>
      t.id === taskId ? { ...t, assigneeName } : t
    );
    onChange(updated);
  };

  // Cập nhật hạn chót
  const handleDueDateChange = (taskId: string, dueDate: string) => {
    if (readOnly) return;
    const updated = checklist.map((t) =>
      t.id === taskId ? { ...t, dueDate } : t
    );
    onChange(updated);
  };

  // Thêm công việc mới
  const handleAddTask = () => {
    if (readOnly) return;
    const taskName = prompt('Nhập tên công việc mới:');
    if (!taskName || !taskName.trim()) return;

    const stage: ExecutionStage = activeTab === 'pre_launch'
      ? 'pre_launch'
      : selectedWeekFilter === 'week_1' || selectedWeekFilter === 'week_2' || selectedWeekFilter === 'week_3' || selectedWeekFilter === 'week_4'
      ? (selectedWeekFilter as ExecutionStage)
      : 'week_1';

    const newTask: ExecutionTask = {
      id: `task_custom_${Date.now()}`,
      stage,
      task: taskName.trim(),
      role: 'Vận hành/Ads',
      dueDate: activeTab === 'pre_launch' ? 'D-2' : 'Trong tuần',
      deliverable: 'Bàn giao nghiệm thu công việc',
      completed: false
    };

    onChange([...checklist, newTask]);
  };

  // Xóa công việc
  const handleDeleteTask = (taskId: string) => {
    if (readOnly) return;
    onChange(checklist.filter((t) => t.id !== taskId));
  };

  // Lọc danh sách công việc hiển thị theo Tab
  const visibleTasks = useMemo(() => {
    if (activeTab === 'pre_launch') {
      return checklist.filter((t) => t.stage === 'pre_launch');
    }
    const weekly = checklist.filter((t) => t.stage !== 'pre_launch');
    if (selectedWeekFilter === 'all') return weekly;
    return weekly.filter((t) => t.stage === selectedWeekFilter);
  }, [checklist, activeTab, selectedWeekFilter]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Tiêu đề & Thanh tiến độ tổng quan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Checklist Thực Thi & Phân Vai Trách Nhiệm
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gắn vai trò, hạn chót và đầu ra bàn giao (Deliverable) cho từng mốc chuẩn bị và lộ trình 4 tuần.
          </p>
        </div>

        {/* Thanh tiến độ */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Tiến độ hoàn tất:</div>
            <div className="text-sm font-extrabold text-indigo-700">
              {stats.completed} / {stats.total} ({stats.percent}%)
            </div>
          </div>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Điều hướng: Pre-launch vs 4 Tuần */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 rounded-xl max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('pre_launch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pre_launch'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Tiền chiến dịch (Pre-launch)
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-600 font-mono">
              {stats.preLaunchCompleted}/{stats.preLaunchTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Lộ trình 4 tuần thực thi
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {stats.weeklyCompleted}/{stats.weeklyTotal}
            </span>
          </button>
        </div>

        {/* Lọc theo tuần khi đang ở Tab Timeline */}
        {activeTab === 'timeline' && (
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium hidden sm:inline">Xem:</span>
            {['all', 'week_1', 'week_2', 'week_3', 'week_4'].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWeekFilter(w)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedWeekFilter === w
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {w === 'all' && 'Tất cả 4 tuần'}
                {w === 'week_1' && 'Tuần 1'}
                {w === 'week_2' && 'Tuần 2'}
                {w === 'week_3' && 'Tuần 3'}
                {w === 'week_4' && 'Tuần 4'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Danh sách các công việc */}
      <div className="space-y-2.5">
        {visibleTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chưa có công việc nào trong danh sách này.
          </div>
        ) : (
          visibleTasks.map((task) => {
            const roleStyle = ROLE_BADGES[task.role] || {
              bg: 'bg-slate-100',
              text: 'text-slate-700',
              border: 'border-slate-200'
            };

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  task.completed
                    ? 'bg-emerald-50/20 border-emerald-200/60 opacity-80'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Checkbox & Tên công việc */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task.id)}
                    disabled={readOnly}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition shrink-0"
                    aria-label={`Đánh dấu hoàn thành: ${task.task}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                      >
                        [{task.role}]
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.task}
                      </span>
                    </div>

                    {/* Sản phẩm bàn giao (Deliverable) */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-600">Đầu ra:</span>
                      <span className="italic">{task.deliverable}</span>
                    </div>
                  </div>
                </div>

                {/* Hạn chót & Nhân sự phụ trách */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 text-xs">
                  {/* Hạn chót */}
                  <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {readOnly ? (
                      <span className="font-medium text-slate-700">{task.dueDate || 'D-1'}</span>
                    ) : (
                      <input
                        type="text"
                        value={task.dueDate || ''}
                        onChange={(e) => handleDueDateChange(task.id, e.target.value)}
                        placeholder="Hạn chót"
                        className="w-20 text-xs font-medium text-slate-700 bg-transparent focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Nhân sự phụ trách */}
                  <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {readOnly ? (
                      <span className="font-semibold text-slate-800">
                        {task.assigneeName || 'Chưa gán'}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={task.assigneeName || ''}
                        onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                        placeholder="Tên phụ trách"
                        className="w-24 text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Nút xóa */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Xóa đầu việc này"
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Nút thêm công việc mới */}
      {!readOnly && (
        <button
          type="button"
          onClick={handleAddTask}
          className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 text-indigo-700 text-xs font-bold hover:bg-indigo-50/50 flex items-center justify-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm đầu việc mới vào{' '}
          {activeTab === 'pre_launch' ? 'Checklist Tiền chiến dịch' : 'Lộ trình tuần'}
        </button>
      )}
    </div>
  );
};


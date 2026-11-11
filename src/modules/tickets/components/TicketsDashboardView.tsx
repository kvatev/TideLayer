import { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Inbox,
  Plus,
  TrendingUp,
  User,
} from 'lucide-react';
import {
  isTaskOverdue,
  normalizeTaskStatus,
  STATUS_LABELS,
  type InAppNotification,
  type SchoolTicket,
  type TaskActivityLog,
  type TaskDocumentAttachment,
  type TicketAnnouncement,
  type TicketDepartment,
} from '../types';
import type { SchoolUserRole } from '../../../lib/supabase';
import { cn } from '../../../utils/helpers';

interface TicketsDashboardViewProps {
  tickets: SchoolTicket[];
  departments: TicketDepartment[];
  announcements: TicketAnnouncement[];
  allDocuments?: TaskDocumentAttachment[];
  taskActivityLogs?: TaskActivityLog[];
  notifications?: InAppNotification[];
  currentUserId?: string;
  userRole?: SchoolUserRole;
  isDirectorOrAdmin?: boolean;
  onNavigate: (view: string, params?: { ticketId?: string }) => void;
  canCreateTicket: boolean;
}

export function TicketsDashboardView({
  tickets,
  departments,
  announcements: _announcements,
  allDocuments: _allDocuments = [],
  taskActivityLogs = [],
  notifications: _notifications = [],
  currentUserId,
  userRole,
  isDirectorOrAdmin = false,
  onNavigate,
  canCreateTicket,
}: TicketsDashboardViewProps) {
  // Determine if default view should be Management or Employee
  const isManagement =
    isDirectorOrAdmin ||
    userRole === 'director' ||
    userRole === 'school_admin' ||
    userRole === 'department_manager' ||
    userRole === 'deputy_director';

  const [dashboardMode, setDashboardMode] = useState<'management' | 'employee'>(
    isManagement ? 'management' : 'employee'
  );

  // My tasks
  const myTasks = useMemo(() => {
    if (!currentUserId) return [];
    return tickets.filter(
      (t) =>
        t.primary_assignee_id === currentUserId ||
        t.assigned_to_user_id === currentUserId ||
        t.assigned_user_ids?.includes(currentUserId)
    );
  }, [tickets, currentUserId]);

  // Management KPIs
  const totalActive = tickets.filter((t) => normalizeTaskStatus(t.status) !== 'completed').length;
  const inProgressCount = tickets.filter(
    (t) => normalizeTaskStatus(t.status) === 'in_progress'
  ).length;
  const awaitingApprovalCount = tickets.filter(
    (t) => normalizeTaskStatus(t.status) === 'awaiting_approval'
  ).length;
  const _completedCount = tickets.filter(
    (t) => normalizeTaskStatus(t.status) === 'completed'
  ).length;
  const overdueCount = tickets.filter((t) => isTaskOverdue(t)).length;

  // Employee KPIs
  const myActiveTasks = myTasks.filter((t) => normalizeTaskStatus(t.status) !== 'completed');
  const myRequiresAction = myTasks.filter(
    (t) =>
      (normalizeTaskStatus(t.status) === 'new' && !t.completed_at) ||
      Boolean(t.return_reason && normalizeTaskStatus(t.status) === 'in_progress')
  );
  const myOverdueTasks = myTasks.filter((t) => isTaskOverdue(t));

  // Upcoming deadlines (next 7 days, active tasks)
  const upcomingDeadlines = useMemo(() => {
    const list = dashboardMode === 'employee' ? myActiveTasks : tickets.filter((t) => normalizeTaskStatus(t.status) !== 'completed');
    return list
      .filter((t) => t.due_date && new Date(t.due_date).getTime() >= Date.now())
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);
  }, [dashboardMode, myActiveTasks, tickets]);

  // Overdue list
  const overdueList = useMemo(() => {
    const list = dashboardMode === 'employee' ? myTasks : tickets;
    return list
      .filter((t) => isTaskOverdue(t))
      .sort((a, b) => (new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime()))
      .slice(0, 5);
  }, [dashboardMode, myTasks, tickets]);

  // Tasks by department breakdown
  const deptBreakdown = useMemo(() => {
    return departments.map((d) => {
      const deptTasks = tickets.filter((t) => t.department_id === d.id);
      const done = deptTasks.filter((t) => normalizeTaskStatus(t.status) === 'completed').length;
      const active = deptTasks.length - done;
      const rate = deptTasks.length > 0 ? Math.round((done / deptTasks.length) * 100) : 0;
      return {
        id: d.id,
        name: d.name,
        color: d.color || 'blue',
        total: deptTasks.length,
        active,
        done,
        rate,
      };
    });
  }, [departments, tickets]);

  // Recent task activity logs (last 6)
  const recentActivity = useMemo(() => {
    return taskActivityLogs.slice(0, 6);
  }, [taskActivityLogs]);

  return (
    <div className="space-y-6">
      {/* View Switcher Header (Management vs Employee) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-heading text-navy-900 mb-0.5">
            {dashboardMode === 'management'
              ? 'Ръководно табло на училището'
              : 'Моето индивидуално работно табло'}
          </h2>
          <p className="text-xs text-slate-500 mb-0">
            {dashboardMode === 'management'
              ? 'Цялостен преглед на активните задачи, сроковете и натовареността по направления.'
              : 'Преглед на вашите възложени задачи, изискващи действие и наближаващи срокове.'}
          </p>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDashboardMode('management')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                dashboardMode === 'management'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Училищен обзор
            </button>
            <button
              type="button"
              onClick={() => setDashboardMode('employee')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1',
                dashboardMode === 'employee'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              <span>Моите задачи</span>
              {myRequiresAction.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          {canCreateTicket && (
            <button
              type="button"
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Възложи задача</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Section */}
      {dashboardMode === 'management' ? (
        /* Management KPIs */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Активни задачи</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Inbox className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-navy-900">{totalActive}</div>
            <p className="text-[11px] text-slate-400 mt-1 mb-0">от общо {tickets.length} задачи</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>В процес</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-amber-600">{inProgressCount}</div>
            <p className="text-[11px] text-slate-400 mt-1 mb-0">активно изпълнение</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Чакащи одобрение</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-purple-600">
              {awaitingApprovalCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 mb-0">изискват преглед</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Просрочени</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-rose-600">{overdueCount}</div>
            <p className="text-[11px] text-rose-500 font-medium mt-1 mb-0">
              {overdueCount > 0 ? 'Изискват внимание' : 'Няма просрочени'}
            </p>
          </div>
        </div>
      ) : (
        /* Employee KPIs */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Моите задачи</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-navy-900">{myTasks.length}</div>
            <p className="text-[11px] text-slate-400 mt-1 mb-0">{myActiveTasks.length} активни</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Изискващи действие</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-amber-600">
              {myRequiresAction.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 mb-0">нови или за корекция</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Предстоящи срокове</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-emerald-600">
              {upcomingDeadlines.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 mb-0">в следващите 7 дни</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Просрочени за мен</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-heading text-rose-600">
              {myOverdueTasks.length}
            </div>
            <p className="text-[11px] text-rose-500 font-medium mt-1 mb-0">
              {myOverdueTasks.length > 0 ? 'Спешно предаване' : 'Всичко е в срок'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Split: Tasks List / Upcoming / Department Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Tasks & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Alert banner if any */}
          {overdueList.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Просрочени задачи, изискващи спешно изпълнение</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {overdueList.length} задачи
                </span>
              </div>
              <div className="divide-y divide-rose-100">
                {overdueList.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('detail', { ticketId: t.id })}
                    className="py-2 flex items-center justify-between hover:bg-rose-100/50 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-rose-700">
                          {t.code}
                        </span>
                        <span className="text-xs font-semibold text-rose-950 truncate">
                          {t.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-rose-600 mb-0">
                        Краен срок:{' '}
                        {t.due_date ? new Date(t.due_date).toLocaleString('bg-BG') : '—'} • Отговорник:{' '}
                        {t.assignee_name}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tasks Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-heading text-navy-900 mb-0.5">
                  {dashboardMode === 'management' ? 'Текущи активни задачи' : 'Моите активни задачи'}
                </h3>
                <p className="text-xs text-slate-500 mb-0">
                  {dashboardMode === 'management'
                    ? 'Списък на най-актуалните училищни задачи в процес'
                    : 'Задачи, по които сте определени като главен или съотговорник'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('list')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                <span>Виж всички</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {(dashboardMode === 'employee' ? myActiveTasks : tickets.filter((t) => normalizeTaskStatus(t.status) !== 'completed'))
                .slice(0, 6)
                .map((task) => {
                  const normStatus = normalizeTaskStatus(task.status);
                  const isOverdue = isTaskOverdue(task);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onNavigate('detail', { ticketId: task.id })}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {task.code || 'TSK'}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                              normStatus === 'in_progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : normStatus === 'awaiting_approval'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                            )}
                          >
                            {STATUS_LABELS[normStatus]?.label || normStatus}
                          </span>

                          {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Просрочена
                            </span>
                          )}

                          {task.return_reason && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Върната за корекция
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-navy-900 group-hover:text-blue-600 transition-colors truncate mb-1">
                          {task.title}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>{task.department_name}</span>
                          <span>•</span>
                          <span>Отговорник: {task.assignee_name}</span>
                          {task.due_date && (
                            <>
                              <span>•</span>
                              <span
                                className={cn(
                                  'flex items-center gap-0.5',
                                  isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                                )}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{new Date(task.due_date).toLocaleDateString('bg-BG')}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                    </div>
                  );
                })}

              {(dashboardMode === 'employee' ? myActiveTasks : tickets.filter((t) => normalizeTaskStatus(t.status) !== 'completed')).length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                  <p className="text-xs font-semibold mb-0">Няма текущи активни задачи!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Department Workload & Recent Activity */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-navy-900 mb-0">
                  Предстоящи крайни срокове
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-400 italic mb-0">Няма предстоящи срокове</p>
              ) : (
                upcomingDeadlines.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('detail', { ticketId: t.id })}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate mb-0.5">
                        {t.title}
                      </p>
                      <p className="text-[10px] text-blue-600 font-medium mb-0">
                        {new Date(t.due_date!).toLocaleDateString('bg-BG')} (
                        {t.assignee_name})
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Workload Breakdown */}
          {dashboardMode === 'management' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-navy-900 mb-0">
                    Задачи по направления
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {deptBreakdown.map((dept) => (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                        {dept.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {dept.active} акт. / {dept.done} прикл.
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${dept.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-navy-900 mb-0">
                  Последна активност
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 italic mb-0">Няма регистрирана активност</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-3 py-1">
                    <p className="font-semibold text-slate-800 mb-0.5 leading-snug">
                      {typeof log.details === 'string'
                        ? log.details
                        : log.details
                          ? JSON.stringify(log.details)
                          : log.action}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{log.actor_name || 'Служител'}</span>
                      <span>•</span>
                      <span>{new Date(log.created_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

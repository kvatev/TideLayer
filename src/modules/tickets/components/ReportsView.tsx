import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  PieChart,
  Printer,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import {
  isTaskOverdue,
  normalizeTaskStatus,
  type DocumentRegisterItem,
  type SchoolTicket,
  type TaskDocumentAttachment,
  type TicketDepartment,
} from '../types';
import type { SchoolUserRecord } from '../../../lib/supabase';
import { cn } from '../../../utils/helpers';

interface ReportsViewProps {
  tickets: SchoolTicket[];
  departments: TicketDepartment[];
  allDocuments?: TaskDocumentAttachment[];
  documentRegister?: DocumentRegisterItem[];
  schoolUsers?: SchoolUserRecord[];
  onExportCsv: () => void;
  onExportDocumentRegisterCsv?: () => void;
}

export function ReportsView({
  tickets,
  departments,
  allDocuments = [],
  documentRegister = [],
  schoolUsers = [],
  onExportCsv,
  onExportDocumentRegisterCsv,
}: ReportsViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'tasks' | 'departments' | 'employees' | 'documents'>('tasks');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const filteredTickets = useMemo(() => {
    if (deptFilter === 'all') return tickets;
    return tickets.filter((t) => t.department_id === deptFilter);
  }, [tickets, deptFilter]);

  const total = filteredTickets.length;

  // 4 Primary Statuses
  const statusCounts = useMemo(() => {
    return {
      new: filteredTickets.filter((t) => normalizeTaskStatus(t.status) === 'new').length,
      in_progress: filteredTickets.filter((t) => normalizeTaskStatus(t.status) === 'in_progress').length,
      awaiting_approval: filteredTickets.filter((t) => normalizeTaskStatus(t.status) === 'awaiting_approval').length,
      completed: filteredTickets.filter((t) => normalizeTaskStatus(t.status) === 'completed').length,
      overdue: filteredTickets.filter((t) => isTaskOverdue(t)).length,
    };
  }, [filteredTickets]);

  const completionRate = total > 0 ? Math.round((statusCounts.completed / total) * 100) : 0;

  // Department breakdown
  const deptStats = useMemo(() => {
    return departments.map((d) => {
      const dTasks = tickets.filter((t) => t.department_id === d.id);
      const dDone = dTasks.filter((t) => normalizeTaskStatus(t.status) === 'completed').length;
      const dActive = dTasks.filter((t) => normalizeTaskStatus(t.status) !== 'completed').length;
      const dOverdue = dTasks.filter((t) => isTaskOverdue(t)).length;
      const rate = dTasks.length > 0 ? Math.round((dDone / dTasks.length) * 100) : 0;
      const dDocs = documentRegister.filter((doc) => doc.department_id === d.id).length;

      return {
        id: d.id,
        name: d.name,
        total: dTasks.length,
        active: dActive,
        done: dDone,
        overdue: dOverdue,
        rate,
        docsCount: dDocs,
      };
    });
  }, [departments, tickets, documentRegister]);

  // Employee workload breakdown
  const employeeStats = useMemo(() => {
    return schoolUsers.map((u) => {
      const uTasks = tickets.filter(
        (t) =>
          t.primary_assignee_id === u.id ||
          t.assigned_to_user_id === u.id ||
          t.assigned_user_ids?.includes(u.id)
      );
      const uDone = uTasks.filter((t) => normalizeTaskStatus(t.status) === 'completed').length;
      const uActive = uTasks.filter((t) => normalizeTaskStatus(t.status) !== 'completed').length;
      const uOverdue = uTasks.filter((t) => isTaskOverdue(t)).length;
      const rate = uTasks.length > 0 ? Math.round((uDone / uTasks.length) * 100) : 0;

      return {
        id: u.id,
        name: u.full_name,
        role: u.role,
        total: uTasks.length,
        active: uActive,
        done: uDone,
        overdue: uOverdue,
        rate,
      };
    }).filter((item) => item.total > 0 || item.role === 'teacher' || item.role === 'deputy_director');
  }, [schoolUsers, tickets]);

  // Document register breakdown
  const docStats = useMemo(() => {
    return {
      total: documentRegister.length,
      incoming: documentRegister.filter((d) => d.doc_type === 'incoming').length,
      outgoing: documentRegister.filter((d) => d.doc_type === 'outgoing').length,
      internal: documentRegister.filter((d) => d.doc_type === 'internal').length,
      archived: documentRegister.filter((d) => d.is_archived).length,
      linkedToTasks: documentRegister.filter((d) => Boolean(d.linked_task_id)).length,
    };
  }, [documentRegister]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            Оперативни справки и отчети
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Обобщени показатели за задачи, срокове, изпълнение по направления и деловоден регистър
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Печат / PDF</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Експорт на задачи (CSV)</span>
          </button>

          {onExportDocumentRegisterCsv && (
            <button
              type="button"
              onClick={onExportDocumentRegisterCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Експорт регистър (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Sub-Tabs Switcher & Dept Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
            {[
              { id: 'tasks', label: 'Обзор на задачите', icon: BarChart3 },
              { id: 'departments', label: 'По направления', icon: Building2 },
              { id: 'employees', label: 'По служители', icon: Users },
              { id: 'documents', label: 'Деловоден регистър', icon: FileText },
            ].map((tab) => {
              const IconEl = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveReportTab(tab.id as any)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
                    activeReportTab === tab.id
                      ? 'bg-white text-navy-900 shadow-2xs'
                      : 'text-slate-600 hover:text-navy-900'
                  )}
                >
                  <IconEl className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeReportTab === 'tasks' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Направление:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Всички направления</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content: Tasks Overview */}
      {activeReportTab === 'tasks' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block mb-1">Общо задачи</span>
              <span className="text-2xl font-bold font-heading text-navy-900">{total}</span>
              <span className="text-[11px] text-slate-400 block mt-1">в системата</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-amber-600 font-semibold block mb-1">В процес</span>
              <span className="text-2xl font-bold font-heading text-amber-600">
                {statusCounts.in_progress}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">активно се работят</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-purple-600 font-semibold block mb-1">
                Чакащи одобрение
              </span>
              <span className="text-2xl font-bold font-heading text-purple-600">
                {statusCounts.awaiting_approval}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">предадени отчети</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-emerald-600 font-semibold block mb-1">
                Приключени и одобрени
              </span>
              <span className="text-2xl font-bold font-heading text-emerald-600">
                {statusCounts.completed}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                {completionRate}% изпълнение
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-xs text-rose-600 font-semibold block mb-1">Просрочени</span>
              <span className="text-2xl font-bold font-heading text-rose-600">
                {statusCounts.overdue}
              </span>
              <span className="text-[11px] text-rose-500 font-semibold block mt-1">
                {statusCounts.overdue > 0 ? 'Изискват намеса' : 'Всички са в срок'}
              </span>
            </div>
          </div>

          {/* Overdue Tasks List if any */}
          {statusCounts.overdue > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Списък на просрочените задачи</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {filteredTickets
                  .filter((t) => isTaskOverdue(t))
                  .map((t) => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-700">{t.code}</span>
                          <span className="font-bold text-navy-900">{t.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-0">
                          {t.department_name} • Отговорник: {t.assignee_name} • Краен срок:{' '}
                          <span className="text-rose-600 font-semibold">
                            {t.due_date ? new Date(t.due_date).toLocaleDateString('bg-BG') : '—'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Departments Breakdown */}
      {activeReportTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-navy-900 mb-0.5">
              Справка за натовареност и изпълнение по направления
            </h3>
            <p className="text-xs text-slate-500 mb-0">
              Показва процент на завършеност, активни задачи и брой официални документи
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Направление</th>
                  <th className="py-3 px-3">Общо задачи</th>
                  <th className="py-3 px-3">Активни</th>
                  <th className="py-3 px-3">Приключени</th>
                  <th className="py-3 px-3">Просрочени</th>
                  <th className="py-3 px-3">Документи в регистъра</th>
                  <th className="py-3 px-4">% Изпълнение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deptStats.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-navy-900">{d.name}</td>
                    <td className="py-3 px-3 font-semibold">{d.total}</td>
                    <td className="py-3 px-3 text-amber-700 font-medium">{d.active}</td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">{d.done}</td>
                    <td className="py-3 px-3">
                      {d.overdue > 0 ? (
                        <span className="font-bold text-rose-600">{d.overdue}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{d.docsCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${d.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{d.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Employees Workload */}
      {activeReportTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-navy-900 mb-0.5">
              Справка за индивидуално изпълнение по служители
            </h3>
            <p className="text-xs text-slate-500 mb-0">
              Възложени индивидуални отговорности, завършени отчети и просрочени ангажименти
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Служител</th>
                  <th className="py-3 px-3">Длъжност</th>
                  <th className="py-3 px-3">Възложени задачи</th>
                  <th className="py-3 px-3">В процес</th>
                  <th className="py-3 px-3">Одобрени</th>
                  <th className="py-3 px-3">Просрочени</th>
                  <th className="py-3 px-4">% Изпълнение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employeeStats.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-navy-900">{emp.name}</td>
                    <td className="py-3 px-3 text-slate-500">{emp.role}</td>
                    <td className="py-3 px-3 font-semibold">{emp.total}</td>
                    <td className="py-3 px-3 text-amber-700 font-medium">{emp.active}</td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">{emp.done}</td>
                    <td className="py-3 px-3">
                      {emp.overdue > 0 ? (
                        <span className="font-bold text-rose-600">{emp.overdue}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${emp.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{emp.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Document Register Report */}
      {activeReportTab === 'documents' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block mb-1">
                Общо в регистъра
              </span>
              <span className="text-2xl font-bold font-heading text-navy-900">
                {docStats.total}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">документа</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-blue-600 font-semibold block mb-1">
                Входящи документи (ВХ)
              </span>
              <span className="text-2xl font-bold font-heading text-blue-600">
                {docStats.incoming}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">от МОН, РУО и външни</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-emerald-600 font-semibold block mb-1">
                Изходящи документи (ИЗХ)
              </span>
              <span className="text-2xl font-bold font-heading text-emerald-600">
                {docStats.outgoing}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">официална кореспонденция</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-purple-600 font-semibold block mb-1">
                Вътрешни актове (ВЪТР)
              </span>
              <span className="text-2xl font-bold font-heading text-purple-600">
                {docStats.internal}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">заповеди, протоколи, решения</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-navy-900 mb-0">
                Свързаност със задачи
              </h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                {docStats.linkedToTasks} от {docStats.total} документа са свързани със задачи
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-0">
              Системата поддържа пълна проследимост между деловодните преписки и оперативните задачи
              на учителите и администрацията.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

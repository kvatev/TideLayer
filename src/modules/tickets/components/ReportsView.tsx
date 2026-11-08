import {
  BarChart3,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import {
  formatEur,
  type SchoolTicket,
  type TicketDepartment,
  type TicketOrder,
} from '../types';

interface ReportsViewProps {
  tickets: SchoolTicket[];
  departments: TicketDepartment[];
  orders: TicketOrder[];
  onExportCsv: () => void;
}

export function ReportsView({
  tickets,
  departments,
  orders,
  onExportCsv,
}: ReportsViewProps) {
  const total = tickets.length;

  // Breakdown by Status
  const statusCounts = {
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  // Breakdown by Priority
  const priorityCounts = {
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    high: tickets.filter((t) => t.priority === 'high').length,
    medium: tickets.filter((t) => t.priority === 'medium').length,
    low: tickets.filter((t) => t.priority === 'low').length,
  };

  // Orders stats
  const totalOrdersCostEur = orders.reduce(
    (sum, o) => sum + (o.estimated_price || 0) * (o.quantity || 1),
    0
  );
  const deliveredCostEur = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.estimated_price || 0) * (o.quantity || 1), 0);

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Статистика и отчети</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Обобщени графични справки за изпълнението на заявките и разходите за поръчки
          </p>
        </div>

        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Експорт в Excel / CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">
            Общо заявки
          </div>
          <div className="text-3xl font-heading font-bold text-navy-900">{total}</div>
          <div className="text-xs text-slate-500 mt-1">
            Решени или затворени:{' '}
            <strong className="text-emerald-700">
              {statusCounts.resolved + statusCounts.closed}
            </strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">
            Процент на успеваемост
          </div>
          <div className="text-3xl font-heading font-bold text-emerald-700">
            {total > 0
              ? `${Math.round(
                  ((statusCounts.resolved + statusCounts.closed) / total) * 100
                )}%`
              : '100%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Активни в момента: <strong>{statusCounts.open + statusCounts.in_progress}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">
            Обща стойност на поръчките
          </div>
          <div className="text-3xl font-heading font-bold text-purple-700">
            {formatEur(totalOrdersCostEur)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Доставено оборудване: <strong>{formatEur(deliveredCostEur)}</strong>
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-heading font-bold text-navy-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <span>Разпределение по статус</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Нови заявки', val: statusCounts.open, color: 'bg-blue-600' },
              { label: 'В процес на работа', val: statusCounts.in_progress, color: 'bg-amber-500' },
              { label: 'Решени', val: statusCounts.resolved, color: 'bg-emerald-600' },
              { label: 'Затворени', val: statusCounts.closed, color: 'bg-slate-400' },
            ].map((item) => {
              const pct = total > 0 ? Math.round((item.val / total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>{item.label}</span>
                    <span>
                      {item.val} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-heading font-bold text-navy-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span>Разпределение по приоритет</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: '🚨 Спешни', val: priorityCounts.urgent, color: 'bg-red-600' },
              { label: 'Висок приоритет', val: priorityCounts.high, color: 'bg-amber-600' },
              { label: 'Нормален приоритет', val: priorityCounts.medium, color: 'bg-blue-600' },
              { label: 'Нисък приоритет', val: priorityCounts.low, color: 'bg-slate-400' },
            ].map((item) => {
              const pct = total > 0 ? Math.round((item.val / total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>{item.label}</span>
                    <span>
                      {item.val} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 md:col-span-2">
          <h3 className="text-base font-heading font-bold text-navy-900">
            Заявки по отдели и направления
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const count = tickets.filter((t) => t.department_id === dept.id).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div
                  key={dept.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-xs sm:text-sm text-navy-900 leading-tight">
                      {dept.name}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                      {count}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {pct}% от всички регистрирани заявки
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  Megaphone,
  Pin,
  Plus,
  ShoppingCart,
  Ticket,
} from 'lucide-react';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type SchoolTicket,
  type TicketAnnouncement,
  type TicketDepartment,
} from '../types';

interface TicketsDashboardViewProps {
  tickets: SchoolTicket[];
  departments: TicketDepartment[];
  announcements: TicketAnnouncement[];
  onNavigate: (view: string, params?: { ticketId?: string }) => void;
  canCreateTicket: boolean;
}

export function TicketsDashboardView({
  tickets,
  departments,
  announcements,
  onNavigate,
  canCreateTicket,
}: TicketsDashboardViewProps) {
  const total = tickets.length;
  const newCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const recentTickets = tickets.slice(0, 6);

  const statCards = [
    {
      label: 'Общо заявки',
      value: total,
      icon: Ticket,
      bg: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: 'Нови (Чакащи)',
      value: newCount,
      icon: Inbox,
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      label: 'В процес на работа',
      value: inProgressCount,
      icon: Clock,
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Решени сигнали',
      value: resolvedCount,
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pinned Announcement Banner if any */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-2.5">
          {pinnedAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5 flex items-start gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Pin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    Забодено съобщение
                  </span>
                  <span className="text-[11px] text-slate-500">
                    • {new Date(ann.created_at).toLocaleDateString('bg-BG')}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-heading font-bold text-navy-900 mb-1">
                  {ann.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-0">
                  {ann.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => {
          const IconEl = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.bg}`}>
                <IconEl className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900 leading-none">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Tickets (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-0.5">
                Последни заявки
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Най-новите регистрирани сигнали и проблеми
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('list')}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Виж всички</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTickets.map((t) => {
              const st = STATUS_LABELS[t.status];
              const pr = PRIORITY_LABELS[t.priority];

              return (
                <div
                  key={t.id}
                  onClick={() => onNavigate('detail', { ticketId: t.id })}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${st.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${pr.bg} ${pr.text} ${pr.border}`}>
                        {pr.label}
                      </span>
                      {t.room_or_location && (
                        <span className="text-xs text-slate-500 font-medium">
                          📍 {t.room_or_location}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-heading font-bold text-navy-900 truncate">
                      {t.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{t.department_name}</span>
                      <span>•</span>
                      <span>{new Date(t.created_at).toLocaleDateString('bg-BG')}</span>
                      <span>•</span>
                      <span>От: {t.creator_name}</span>
                      {t.messages_count ? (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">
                            💬 {t.messages_count} съобщения
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 text-slate-400 group-hover:text-blue-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}

            {recentTickets.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                Няма въведени заявки.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions & Department Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Action Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-heading font-bold text-navy-900 mb-1">
              Бързи действия
            </h3>

            {canCreateTicket && (
              <button
                type="button"
                onClick={() => onNavigate('create')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Подай нова заявка</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-purple-600" />
                <span>Заявки за доставки и поръчки</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('channels')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                <span>Комуникационни канали</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-heading font-bold text-navy-900 mb-1">
              Заявки по отдели
            </h3>

            <div className="space-y-2">
              {departments.map((dept) => {
                const count = tickets.filter((t) => t.department_id === dept.id).length;
                return (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="min-w-0 font-medium text-navy-900 truncate">
                      {dept.name}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}

              {departments.length === 0 && (
                <p className="text-xs text-slate-400 py-3 text-center mb-0">
                  Няма регистрирани отдели.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

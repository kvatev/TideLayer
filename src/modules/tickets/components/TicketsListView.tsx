import { useState, useMemo } from 'react';
import {
  ArrowRight,
  Calendar,
  Inbox,
  Paperclip,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';
import {
  isTaskOverdue,
  normalizeTaskStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type SchoolTicket,
  type TicketDepartment,
} from '../types';

interface TicketsListViewProps {
  tickets: SchoolTicket[];
  departments: TicketDepartment[];
  currentUserId: string;
  onNavigate: (view: string, params?: { ticketId?: string }) => void;
  canCreateTicket: boolean;
}

export function TicketsListView({
  tickets,
  departments,
  currentUserId,
  onNavigate,
  canCreateTicket,
}: TicketsListViewProps) {
  const [tab, setTab] = useState<'all' | 'assigned_to_me' | 'created_by_me'>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (tab === 'assigned_to_me') {
        const isDirect =
          t.assigned_to_user_id === currentUserId || t.primary_assignee_id === currentUserId;
        const isAssignedList = t.assigned_user_ids?.includes(currentUserId);
        const isGroup = Boolean(t.assigned_role_target);
        if (!isDirect && !isAssignedList && !isGroup) return false;
      } else if (tab === 'created_by_me') {
        if (t.created_by_user_id !== currentUserId) return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          if (!isTaskOverdue(t)) return false;
        } else {
          if (normalizeTaskStatus(t.status) !== statusFilter) return false;
        }
      }
      if (deptFilter !== 'all' && t.department_id !== deptFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchCode = (t.code || '').toLowerCase().includes(q);
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchRoom = (t.room_or_location || '').toLowerCase().includes(q);
        const matchCreator = (t.creator_name || '').toLowerCase().includes(q);
        const matchAssignee = (t.assignee_name || '').toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchDesc && !matchRoom && !matchCreator && !matchAssignee) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, tab, currentUserId, statusFilter, deptFilter, priorityFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTickets = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDeptFilter('all');
    setPriorityFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'all' || deptFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div className="space-y-5">
      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            Списък със задачи
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Възложени задачи, срокове за изпълнение, прикачени документи и отчети
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCreateTicket && (
            <button
              type="button"
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Възложи задача</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* View Switcher: All vs Assigned to me vs Created by me */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setTab('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                tab === 'all'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Всички задачи ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('assigned_to_me');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                tab === 'assigned_to_me'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Възложени на мен ({tickets.filter((t) => t.assigned_to_user_id === currentUserId || Boolean(t.assigned_role_target)).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('created_by_me');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                tab === 'created_by_me'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Възложени от мен ({tickets.filter((t) => t.created_by_user_id === currentUserId).length})
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Изчисти филтрите</span>
            </button>
          )}
        </div>

        {/* Inputs & Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Търсене по текст, стая..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 font-medium text-navy-900 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Всички статуси</option>
            <option value="new">Нови задачи</option>
            <option value="in_progress">В процес</option>
            <option value="awaiting_approval">Чакащи одобрение</option>
            <option value="completed">Приключени / Одобрени</option>
            <option value="overdue">⚠️ Просрочени задачи</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 font-medium text-navy-900 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Всички отдели</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 font-medium text-navy-900 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Всички приоритети</option>
            <option value="urgent">🚨 Спешен</option>
            <option value="high">Висок</option>
            <option value="medium">Нормален</option>
            <option value="low">Нисък</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {pagedTickets.map((t) => {
          const normStatus = normalizeTaskStatus(t.status);
          const st = STATUS_LABELS[normStatus] || STATUS_LABELS.new;
          const pr = PRIORITY_LABELS[t.priority] || PRIORITY_LABELS.medium;
          const isOverdue = isTaskOverdue(t);

          return (
            <div
              key={t.id}
              onClick={() => onNavigate('detail', { ticketId: t.id })}
              className="p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">
                    {t.code || 'TSK'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${st.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  {isOverdue && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Просрочена
                    </span>
                  )}
                  {t.return_reason && normStatus === 'in_progress' && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Върната за корекция
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${pr.bg} ${pr.text} ${pr.border}`}>
                    {pr.label}
                  </span>
                  {t.room_or_location && (
                    <span className="text-xs text-slate-500 font-medium">
                      📍 {t.room_or_location}
                    </span>
                  )}
                  {t.due_date && (() => {
                    const due = new Date(t.due_date);
                    const now = new Date();
                    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = diffDays < 0;
                    const isUrgentDue = diffDays >= 0 && diffDays <= 1;

                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isUrgentDue
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>
                          {isOverdue ? 'Изтекъл: ' : 'Срок: '}
                          {due.toLocaleDateString('bg-BG')}
                        </span>
                      </span>
                    );
                  })()}
                  {((t.attachments?.length || t.attachments_count || 0) > 0) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Paperclip className="w-3 h-3" />
                      <span>
                        {(t.attachments?.length || t.attachments_count)} {(t.attachments?.length || t.attachments_count) === 1 ? 'документ' : 'документа'}
                      </span>
                    </span>
                  )}
                  {t.assigned_role_target && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      <Users className="w-3 h-3" />
                      <span>
                        {t.assigned_role_target === 'all_teachers'
                          ? 'Всички учители'
                          : t.assigned_role_target === 'all_administration'
                          ? 'Всички администратори'
                          : t.assigned_role_target === 'all_staff'
                          ? 'Целият персонал'
                          : t.assigned_role_target}
                      </span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-heading font-bold text-navy-900 truncate">
                  {t.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-0">
                  {t.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>🏢 {t.department_name}</span>
                  <span>•</span>
                  <span>Подател: <strong>{t.creator_name}</strong></span>
                  <span>•</span>
                  <span>Отговорник: <strong>{t.assignee_name}</strong></span>
                  <span>•</span>
                  <span>{new Date(t.created_at).toLocaleDateString('bg-BG')}</span>
                  {t.messages_count ? (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">
                        💬 {t.messages_count}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 text-xs font-semibold text-navy-900 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <span>Детайли</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {pagedTickets.length === 0 && (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium mb-0">Няма намерени задачи с тези филтри.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 px-2 text-xs sm:text-sm text-slate-600">
          <div>
            Страница <strong>{currentPage}</strong> от <strong>{totalPages}</strong> (общо {filtered.length} задачи)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold"
            >
              Предишна
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold"
            >
              Следваща
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

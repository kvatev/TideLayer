import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  History,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import type { TicketAuditLog } from '../types';

interface AuditLogsViewProps {
  logs: TicketAuditLog[];
  onDeleteLog?: (id: string) => Promise<void>;
  onClearAll?: () => Promise<void>;
}

export function AuditLogsView({
  logs,
}: AuditLogsViewProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      // Action type filter
      if (actionFilter !== 'all') {
        const act = l.action.toLowerCase();
        if (actionFilter === 'tasks' && !act.includes('задач') && !act.includes('статус') && !act.includes('приоритет')) {
          return false;
        }
        if (actionFilter === 'approval' && !act.includes('одобр') && !act.includes('корекц') && !act.includes('предаден')) {
          return false;
        }
        if (actionFilter === 'documents' && !act.includes('документ') && !act.includes('файл') && !act.includes('регист')) {
          return false;
        }
        if (actionFilter === 'departments' && !act.includes('направлен') && !act.includes('зачислен') && !act.includes('член')) {
          return false;
        }
      }

      // Date filter
      if (dateFilter) {
        if (!l.created_at.startsWith(dateFilter)) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchActor = l.actor_name.toLowerCase().includes(q);
        const matchAction = l.action.toLowerCase().includes(q);
        const matchDetails = l.details ? JSON.stringify(l.details).toLowerCase().includes(q) : false;
        if (!matchActor && !matchAction && !matchDetails) return false;
      }

      return true;
    });
  }, [logs, actionFilter, dateFilter, search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-0">
              Административен журнал на събитията
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Защитен и неизтриваем</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Официален хронологичен регистър за всички действия, възлагания, одобрения, корекции и документи в училището
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търсене по автор, действие, детайли..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-navy-900 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Всички категории събития</option>
              <option value="tasks">Задачи и статуси</option>
              <option value="approval">Одобрения и корекции</option>
              <option value="documents">Документи и файлове</option>
              <option value="departments">Направления и служители</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-500"
              title="Филтър по дата"
            />

            {(search || actionFilter !== 'all' || dateFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActionFilter('all');
                  setDateFilter('');
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Изчисти филтрите"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredLogs.map((log) => (
          <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-navy-900">{log.action}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date(log.created_at).toLocaleString('bg-BG')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 ml-4">
              <User className="w-3 h-3 text-slate-400" />
              <span>
                Извършено от: <strong className="text-slate-800">{log.actor_name}</strong>
              </span>
            </div>

            {log.details && (
              <div className="mt-2 ml-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 break-words">
                {JSON.stringify(log.details, null, 2)}
              </div>
            )}
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold mb-0">Няма намерени събития в журнала.</p>
          </div>
        )}
      </div>
    </div>
  );
}

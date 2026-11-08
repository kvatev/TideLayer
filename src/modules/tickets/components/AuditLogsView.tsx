import { useState, useMemo } from 'react';
import {
  Clock,
  History,
  Search,
  Trash2,
} from 'lucide-react';
import type { TicketAuditLog } from '../types';
import { ModuleConfirmDialog } from '../../shared/ModulePrimitives';

interface AuditLogsViewProps {
  logs: TicketAuditLog[];
  onDeleteLog: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export function AuditLogsView({
  logs,
  onDeleteLog,
  onClearAll,
}: AuditLogsViewProps) {
  const [search, setSearch] = useState('');
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchActor = l.actor_name.toLowerCase().includes(q);
      const matchAction = l.action.toLowerCase().includes(q);
      const matchDetails = l.details ? JSON.stringify(l.details).toLowerCase().includes(q) : false;
      return matchActor || matchAction || matchDetails;
    });
  }, [logs, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>Журнал на събитията (Audit Log)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Пълна проследимост на всички извършени промени, заявки, поръчки и статуси
          </p>
        </div>

        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => setClearModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Изчисти журнала</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Търсене по потребител или действие..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px] text-xs sm:text-sm">
            <thead>
              <tr className="bg-navy-900 text-white font-heading font-semibold">
                <th className="py-3 px-4 w-44">Дата и час</th>
                <th className="py-3 px-3 w-48">Потребител</th>
                <th className="py-3 px-3">Извършено действие</th>
                <th className="py-3 px-3">Детайли</th>
                <th className="py-3 px-4 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(item.created_at).toLocaleString('bg-BG')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-navy-900">
                    {item.actor_name}
                  </td>
                  <td className="py-3 px-3 text-slate-800">
                    {item.action}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-xs font-mono">
                    {item.details ? (
                      <span className="truncate max-w-[280px] block" title={JSON.stringify(item.details)}>
                        {JSON.stringify(item.details)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => void onDeleteLog(item.id)}
                      className="text-slate-300 hover:text-red-600 p-1 transition-colors"
                      title="Премахни записа"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Няма регистрирани събития в журнала.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Confirmation */}
      <ModuleConfirmDialog
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={onClearAll}
        title="Изчистване на целия журнал"
        confirmLabel="Изчисти"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете цялата хронология от събития за това училище? Действието не може да бъде отменено."
      />
    </div>
  );
}

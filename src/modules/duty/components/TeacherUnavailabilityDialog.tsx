import { useState } from 'react';
import { CalendarOff, Check, CheckCircle2, Plus, X } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { WEEKDAY_TO_BG, type UnavailabilityEntry, type Weekday } from '../types';
import { ModuleModal } from '../../shared/ModulePrimitives';

const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

interface TeacherUnavailabilityDialogProps {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  entries: UnavailabilityEntry[];
  onAddWeekday: (teacherId: string, weekday: Weekday, note?: string) => Promise<boolean>;
  onAddDate: (teacherId: string, date: string, note?: string) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

function formatDateDisplay(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export function TeacherUnavailabilityDialog({
  open,
  onClose,
  teacherId,
  teacherName,
  entries,
  onAddWeekday,
  onAddDate,
  onRemove,
  onNotify,
}: TeacherUnavailabilityDialogProps) {
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [busyDay, setBusyDay] = useState<Weekday | null>(null);

  const weekdayEntries = entries.filter((e) => e.weekday);
  const dateEntries = entries
    .filter((e) => e.specific_date)
    .sort((a, b) => ((a.specific_date || '') < (b.specific_date || '') ? -1 : 1));

  const toggleWeekday = async (wd: Weekday) => {
    if (busyDay === wd) return;
    setBusyDay(wd);
    try {
      const existing = weekdayEntries.find((e) => e.weekday === wd);
      const bgDay = WEEKDAY_TO_BG[wd];
      if (existing) {
        const ok = await onRemove(existing.id);
        if (ok) {
          onNotify?.('success', `${teacherName} е отбелязан като СВОБОДЕН за ${bgDay}.`);
        }
      } else {
        const cleanNote = note.trim() || undefined;
        const ok = await onAddWeekday(teacherId, wd, cleanNote);
        if (ok) {
          onNotify?.(
            'info',
            `${teacherName} НЕ МОЖЕ да дежури в ${bgDay}${cleanNote ? ` (${cleanNote})` : ''}.`
          );
          setNote('');
        }
      }
    } finally {
      setBusyDay(null);
    }
  };

  const handleAddDate = async () => {
    if (!selectedDate) return;
    if (dateEntries.some((e) => e.specific_date === selectedDate)) {
      onNotify?.('error', 'Тази дата вече е добавена.');
      return;
    }
    const cleanNote = note.trim() || undefined;
    const ok = await onAddDate(teacherId, selectedDate, cleanNote);
    if (ok) {
      onNotify?.('success', `Добавена дата на отсъствие: ${formatDateDisplay(selectedDate)}`);
      setSelectedDate('');
      setNote('');
    }
  };

  return (
    <ModuleModal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-blue-600 shrink-0" />
          <span>Достъпност: {teacherName}</span>
        </span>
      }
      subtitle="Отбележете дните или конкретни дати, в които учителят не може да бъде дежурен. Автоматичното разпределение ще ги избягва."
      maxWidthClass="max-w-lg"
      footer={
        <div className="w-full flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">Промените се запазват автоматично</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
          >
            Готово
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Optional Reason */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
          <label
            htmlFor="duty-unavail-note"
            className="block text-xs font-semibold text-navy-900"
          >
            Бележка / Причина (по желание)
          </label>
          <input
            id="duty-unavail-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
            placeholder="напр. методически ден, свободен по разписание, болничен..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Weekdays */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-navy-900">
              Дни от седмицата
            </span>
            {weekdayEntries.length > 0 ? (
              <span className="text-xs font-semibold text-red-600">
                Недостъпен в {weekdayEntries.length}{' '}
                {weekdayEntries.length === 1 ? 'ден' : 'дни'}
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Свободен през всички дни
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WEEKDAYS.map((wd) => {
              const entry = weekdayEntries.find((e) => e.weekday === wd);
              const isUnavail = !!entry;

              return (
                <button
                  key={wd}
                  type="button"
                  onClick={() => void toggleWeekday(wd)}
                  className={cn(
                    'flex items-center justify-between gap-2.5 p-3 rounded-xl border text-left transition-all',
                    isUnavail
                      ? 'border-red-300 bg-red-50 text-red-900 hover:bg-red-100'
                      : 'border-slate-200 bg-white text-navy-900 hover:bg-slate-50 hover:border-blue-300'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                        isUnavail
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-slate-300 bg-white'
                      )}
                    >
                      {isUnavail && <Check className="w-3 h-3" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold leading-tight">
                        {WEEKDAY_TO_BG[wd]}
                      </div>
                      {entry?.note && (
                        <div className="text-[11px] text-red-700 truncate mt-0.5">
                          {entry.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                      isUnavail ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {isUnavail ? 'НЕ МОЖЕ' : 'СВОБОДЕН'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific Dates */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200">
          <label
            htmlFor="duty-unavail-date"
            className="block text-xs sm:text-sm font-bold text-navy-900"
          >
            Конкретни дати (отпуск, командировка, болничен)
          </label>
          <div className="flex gap-2">
            <input
              id="duty-unavail-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => void handleAddDate()}
              disabled={!selectedDate}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Добави дата</span>
            </button>
          </div>

          {dateEntries.length > 0 ? (
            <ul className="space-y-1.5 mt-2">
              {dateEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-navy-900">
                      {formatDateDisplay(entry.specific_date!)}
                    </span>
                    {entry.note && (
                      <span className="text-slate-600 ml-2">— {entry.note}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void onRemove(entry.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-100 shrink-0"
                    title="Премахни датата"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 mb-0">
              Няма въведени конкретни дати за отсъствие.
            </p>
          )}
        </div>
      </div>
    </ModuleModal>
  );
}


import { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  Sparkles,
  Smartphone,
  Table,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const DAYS = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък'];

const FLOORS = [
  { id: 'f1', name: 'I етаж (Фоайе и Вход)' },
  { id: 'f2', name: 'II етаж (STEM и Лаборатории)' },
  { id: 'f3', name: 'III етаж (Хуманитарни кабинети)' },
  { id: 'f4', name: 'Двор и Спортна площадка' },
];

const INITIAL_SCHEDULE: Record<string, string[]> = {
  Понеделник: ['инж. Г. Димитров', 'Мария Георгиева', 'Петър Василев', 'Красимир Тодоров'],
  Вторник: ['Даниела Стоянова', 'Иван Петров', 'Елена Стоянова', 'Стефан Николов'],
  Сряда: ['инж. Г. Димитров', 'Десислава Попова', 'Петър Василев', 'Радослав Ангелов'],
  Четвъртък: ['Мария Георгиева', 'Даниела Стоянова', 'Иван Петров', 'Красимир Тодоров'],
  Петък: ['Елена Стоянова', 'Стефан Николов', 'Десислава Попова', 'инж. Г. Димитров'],
};

const AUTO_ARRANGED_SCHEDULE: Record<string, string[]> = {
  Понеделник: ['Даниела Стоянова (STEM)', 'инж. Г. Димитров (ИТ)', 'Мария Георгиева (БЕЛ)', 'Красимир Тодоров (ФВС)'],
  Вторник: ['Петър Василев (МАТ)', 'Елена Стоянова (Англ.)', 'Иван Петров (История)', 'Стефан Николов (Геогр.)'],
  Сряда: ['инж. Г. Димитров (ИТ)', 'Даниела Стоянова (STEM)', 'Десислава Попова (Музика)', 'Красимир Тодоров (ФВС)'],
  Четвъртък: ['Мария Георгиева (БЕЛ)', 'Петър Василев (МАТ)', 'Иван Петров (История)', 'Радослав Ангелов (ФВС)'],
  Петък: ['Елена Стоянова (Англ.)', 'Десислава Попова (Музика)', 'Стефан Николов (Геогр.)', 'инж. Г. Димитров (ИТ)'],
};

export function DutySchedulerDemo() {
  const [activeDay, setActiveDay] = useState('Понеделник');
  const [viewMode, setViewMode] = useState<'table' | 'mobile' | 'print'>('table');
  const [scheduleData, setScheduleData] = useState(INITIAL_SCHEDULE);
  const [isArranging, setIsArranging] = useState(false);
  const [arrangedNotice, setArrangedNotice] = useState(false);

  const handleAutoArrange = () => {
    setIsArranging(true);
    setArrangedNotice(false);
    setTimeout(() => {
      setScheduleData(AUTO_ARRANGED_SCHEDULE);
      setIsArranging(false);
      setArrangedNotice(true);
      setTimeout(() => setArrangedNotice(false), 4000);
    }, 600);
  };

  return (
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
      {/* macOS Window Title Bar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400 font-medium hidden sm:inline">
            tidelayer.com/school/demo-school/duty
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Интерактивна Демонстрация</span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Days Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeDay === day
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              {day}
            </button>
          ))}
        </div>

        {/* View Switcher & Auto-Arrange Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                viewMode === 'table' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              )}
            >
              <Table className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Таблица</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                viewMode === 'mobile' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              )}
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Мобилен за учители</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('print')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                viewMode === 'print' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              )}
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">A4 за печат</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAutoArrange}
            disabled={isArranging}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Sparkles className={cn('w-3.5 h-3.5', isArranging && 'animate-spin')} />
            <span>{isArranging ? 'Оптимизиране...' : 'Автоматично разпределение'}</span>
          </button>
        </div>
      </div>

      {/* Success Notice Banner */}
      {arrangedNotice && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Алгоритъмът разпредели дежурствата справедливо според норматива и свободните часове без конфликти!
          </span>
        </div>
      )}

      {/* Demo View Content */}
      <div className="p-5 sm:p-6 min-h-[320px] bg-slate-900/60">
        {/* VIEW 1: TABLE */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="p-3.5">Локация / Етаж</th>
                  <th className="p-3.5">I смяна (Сутрин)</th>
                  <th className="p-3.5">II смяна (Следобед)</th>
                  <th className="p-3.5">Голямо междучасие</th>
                  <th className="p-3.5 text-right">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {FLOORS.map((floor, idx) => {
                  const teacher = scheduleData[activeDay]?.[idx] || '—';
                  return (
                    <tr key={floor.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{floor.name}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-medium border border-blue-500/20">
                          {teacher}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 font-medium border border-purple-500/20">
                          {scheduleData[activeDay]?.[(idx + 1) % 4] || 'Свободно'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        2 учители на пост
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Покрит
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: MOBILE CARDS FOR TEACHERS */}
        {viewMode === 'mobile' && (
          <div className="max-w-md mx-auto space-y-3">
            <div className="text-center pb-2">
              <span className="text-xs text-slate-400">
                Оптимизиран изглед за смартфон на учители за <strong>{activeDay}</strong>
              </span>
            </div>
            {FLOORS.map((floor, idx) => {
              const teacher = scheduleData[activeDay]?.[idx] || '—';
              return (
                <div
                  key={floor.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Пост {idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                      07:30 - 13:30 ч.
                    </span>
                  </div>
                  <div className="font-bold text-slate-100 text-sm">
                    {floor.name}
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Дежурен:</span>
                    <strong className="text-blue-400">{teacher}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: A4 PRINT PREVIEW */}
        {viewMode === 'print' && (
          <div className="max-w-xl mx-auto p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-4 font-serif text-xs">
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <div className="text-[10px] uppercase tracking-widest font-sans font-semibold text-slate-500">
                СУ „ПРИМЕРНО УЧИЛИЩЕ“ • ГРАФИК ЗА ДЕЖУРСТВА
              </div>
              <h4 className="text-sm font-bold uppercase">
                СЕДМИЧНО РАЗПРЕДЕЛЕНИЕ — {activeDay.toUpperCase()}
              </h4>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                  <th className="p-2 border-r border-slate-300">Пост / Етаж</th>
                  <th className="p-2 border-r border-slate-300">Сутрешна смяна</th>
                  <th className="p-2">Следобедна смяна</th>
                </tr>
              </thead>
              <tbody>
                {FLOORS.map((floor, idx) => (
                  <tr key={floor.id} className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-200 font-medium">{floor.name}</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-blue-900">
                      {scheduleData[activeDay]?.[idx]}
                    </td>
                    <td className="p-2 text-slate-700">
                      {scheduleData[activeDay]?.[(idx + 1) % 4]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 flex items-center justify-between text-[11px] text-slate-600 font-sans">
              <span>Утвърдил Директор: ............................. (Печат)</span>
              <span>Дата: 2026-11-08</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

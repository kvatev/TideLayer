import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Calendar, CalendarDays, Eye, Printer, Table as TableIcon } from 'lucide-react';
import {
  DAYS,
  type CellTeacher,
  type DutyAppSettings,
  type SchoolPeriod,
  type SchoolStage,
  type Teacher,
  type UnavailabilityEntry,
} from '../types';
import { ScheduleCell } from './ScheduleCell';
import { PrintableSchedule } from './PrintableSchedule';
import { ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

function getTodayBgDay(): string {
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, ..., 5 = Fri
  const map: Record<number, string> = {
    1: 'Понеделник',
    2: 'Вторник',
    3: 'Сряда',
    4: 'Четвъртък',
    5: 'Петък',
  };
  return map[dayIndex] || 'Понеделник';
}

interface ScheduleTableProps {
  getAssignmentsForCell: (day: string, location: string) => CellTeacher[];
  counts: Record<string, number>;
  canEdit: boolean;
  onAssign: (
    teacherId: string,
    day: string,
    location: string,
    shiftNumber?: string | number | null,
    note?: string | null
  ) => Promise<boolean>;
  onUnassign: (teacherId: string, day: string, location: string) => Promise<void>;
  onMove: (
    teacherId: string,
    fromDay: string,
    fromLocation: string,
    toDay: string,
    toLocation: string
  ) => Promise<void>;
  onUpdateShiftNumber: (
    teacherId: string,
    day: string,
    location: string,
    shiftNumber: string | number | null
  ) => Promise<void>;
  onUpdateNote: (
    teacherId: string,
    day: string,
    location: string,
    note: string | null
  ) => Promise<void>;
  currentPeriod: SchoolPeriod;
  currentStage: SchoolStage;
  settings: DutyAppSettings;
  teachers: Teacher[];
  locations: string[];
  getTeacherDayCount: (teacherId: string, day: string) => number;
  isTeacherUnavailable: (teacherId: string, day: string) => UnavailabilityEntry | null;
  onExportReady?: (exportFn: () => void) => void;
  onNotify?: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export function ScheduleTable({
  getAssignmentsForCell,
  counts,
  canEdit,
  onAssign,
  onUnassign,
  onMove,
  onUpdateShiftNumber,
  onUpdateNote,
  currentPeriod,
  currentStage,
  settings,
  teachers,
  locations,
  getTeacherDayCount,
  isTeacherUnavailable,
  onExportReady,
  onNotify,
}: ScheduleTableProps) {
  const [selectedDay, setSelectedDay] = useState<string>(getTodayBgDay);
  const [viewMode, setViewMode] = useState<'day' | 'table'>('table');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const getTeacherName = useCallback(
    (id: string) => teachers.find((t) => t.id === id)?.name,
    [teachers]
  );

  const shiftLocation = useMemo(() => {
    if (currentStage === 'primary') {
      return settings.primary_location_1 || locations[0] || '';
    }
    return settings.location_4 || locations[locations.length - 1] || '';
  }, [currentStage, settings, locations]);

  const handlePrint = useCallback(() => {
    setPrintModalOpen(true);
  }, []);

  useEffect(() => {
    if (onExportReady) {
      onExportReady(handlePrint);
    }
  }, [onExportReady, handlePrint]);

  const executeBrowserPrint = () => {
    if (!printableRef.current) return;
    const contentHtml = printableRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>График за дежурства — ${settings.pdf_school_name || 'Училище'}</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 8mm;
              }
              body {
                margin: 0;
                padding: 12px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #000;
                background: #fff;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 8px;
              }
              th, td {
                border: 1px solid #111;
                padding: 5px 6px;
                font-size: 11px;
                line-height: 1.25;
              }
              th {
                background: #f1f5f9;
                font-weight: 700;
              }
              img {
                max-width: 70px;
                max-height: 70px;
                object-fit: contain;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${contentHtml}
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: View Mode & Day Pills for Mobile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-navy-900">
            Изглед на графика:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'day'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>По дни (Карти)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'table'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Пълна таблица</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Преглед и Печат</span>
          </button>
        </div>
      </div>

      {/* Day Selector Pills for "По дни" mode */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0',
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-navy-900 border border-slate-200 hover:bg-slate-50'
              )}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* 1. Mobile Cards View */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-semibold text-navy-900 text-sm">📅 {selectedDay}</span>
            <span>{locations.length} дежурни поста</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {locations.map((loc, idx) => (
              <div
                key={`${selectedDay}-${loc}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5 transition-all hover:border-blue-300"
              >
                <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-heading font-bold text-navy-900 leading-snug">
                      {loc}
                    </h4>
                    {loc === shiftLocation && (
                      <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        Смени 1 / 2 / 1, 2
                      </span>
                    )}
                  </div>
                </div>

                <ScheduleCell
                  day={selectedDay}
                  location={loc}
                  teachers={getAssignmentsForCell(selectedDay, loc)}
                  counts={counts}
                  canEdit={canEdit}
                  onAssign={onAssign}
                  onUnassign={onUnassign}
                  onMove={onMove}
                  onUpdateShiftNumber={onUpdateShiftNumber}
                  onUpdateNote={onUpdateNote}
                  isShiftLocation={loc === shiftLocation}
                  getTeacherName={getTeacherName}
                  isTeacherUnavailable={isTeacherUnavailable}
                  getTeacherDayCount={getTeacherDayCount}
                  allTeachers={teachers}
                  onNotify={onNotify}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Full Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="block sm:hidden px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>↔️ Плъзнете хоризонтално за останалите постове</span>
            <span>{locations.length} локации</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-navy-900 text-white text-xs sm:text-sm">
                  <th className="sticky left-0 bg-navy-900 z-20 py-3.5 px-4 font-heading font-semibold w-36 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.2)]">
                    {settings.day_column_header || 'Ден от седмицата'}
                  </th>
                  {locations.map((loc) => (
                    <th
                      key={loc}
                      className="py-3.5 px-3 font-heading font-semibold text-center border-l border-navy-800 min-w-[170px]"
                    >
                      <div className="text-xs sm:text-sm font-bold leading-snug">{loc}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {DAYS.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50 align-top">
                    <td className="sticky left-0 z-10 py-3 px-4 font-heading font-bold text-navy-900 bg-slate-50/90 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] border-r border-slate-200">
                      {day}
                    </td>
                    {locations.map((loc) => (
                      <td
                        key={`${day}-${loc}`}
                        className="py-2.5 px-2 border-l border-slate-200 align-top"
                      >
                        <ScheduleCell
                          day={day}
                          location={loc}
                          teachers={getAssignmentsForCell(day, loc)}
                          counts={counts}
                          canEdit={canEdit}
                          onAssign={onAssign}
                          onUnassign={onUnassign}
                          onMove={onMove}
                          onUpdateShiftNumber={onUpdateShiftNumber}
                          onUpdateNote={onUpdateNote}
                          isShiftLocation={loc === shiftLocation}
                          getTeacherName={getTeacherName}
                          isTeacherUnavailable={isTeacherUnavailable}
                          getTeacherDayCount={getTeacherDayCount}
                          allTeachers={teachers}
                          onNotify={onNotify}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print / PDF Preview Modal */}
      <ModuleModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Печат и PDF преглед на графика"
        subtitle={`${settings.pdf_school_name || 'Училищен график'} • ${currentPeriod.year}, ${
          currentPeriod.term === 1 ? 'I' : 'II'
        } срок`}
        maxWidthClass="max-w-5xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPrintModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Затвори
            </button>
            <button
              type="button"
              onClick={executeBrowserPrint}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Печат / Свали като PDF</span>
            </button>
          </>
        }
      >
        <div className="bg-slate-100 p-3 sm:p-5 rounded-2xl overflow-x-auto border border-slate-200">
          <PrintableSchedule
            ref={printableRef}
            getAssignmentsForCell={getAssignmentsForCell}
            currentPeriod={currentPeriod}
            settings={settings}
            currentStage={currentStage}
            locations={locations}
          />
        </div>
      </ModuleModal>
    </div>
  );
}

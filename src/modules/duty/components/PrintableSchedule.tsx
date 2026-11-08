import { forwardRef } from 'react';
import {
  DAYS,
  type CellTeacher,
  type DutyAppSettings,
  type SchoolPeriod,
  type SchoolStage,
} from '../types';

interface PrintableScheduleProps {
  getAssignmentsForCell: (day: string, location: string) => CellTeacher[];
  currentPeriod: SchoolPeriod;
  settings: DutyAppSettings;
  currentStage: SchoolStage;
  locations: string[];
}

export const PrintableSchedule = forwardRef<HTMLDivElement, PrintableScheduleProps>(
  ({ getAssignmentsForCell, currentPeriod, settings, currentStage, locations }, ref) => {
    const termText =
      currentPeriod.term === 1 ? settings.term_1_label || 'I учебен срок' : settings.term_2_label || 'II учебен срок';
    const yearText = `${currentPeriod.year} учебна година`;
    const description =
      currentStage === 'primary'
        ? settings.pdf_schedule_description_primary ||
          'за дежурство на учителите от начален етап (I - IV клас)'
        : settings.pdf_schedule_description ||
          'за дежурство на учителите от прогимназиален и гимназиален етап';

    return (
      <div
        ref={ref}
        className="bg-white p-8 text-black print:p-0"
        style={{
          fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          width: '1120px',
          minHeight: '760px',
          margin: '0 auto',
        }}
      >
        {/* Header with School Details & Dynamic Logo */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Училищен герб / лого"
                className="max-h-20 max-w-20 object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl border border-slate-400 flex items-center justify-center bg-slate-50 text-slate-700">
                <svg
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center flex-1 px-4">
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-950 mb-1 leading-tight">
              {settings.pdf_school_name || 'УЧИЛИЩНО РЕШЕНИЕ'}
            </h1>
            {settings.pdf_school_info1 && (
              <p className="text-xs text-slate-700 mb-0.5">{settings.pdf_school_info1}</p>
            )}
            {settings.pdf_school_info2 && (
              <p className="text-xs text-slate-600 mb-0">{settings.pdf_school_info2}</p>
            )}
          </div>

          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Училищен герб / лого"
                className="max-h-20 max-w-20 object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl border border-slate-400 flex items-center justify-center bg-slate-50 text-slate-700">
                <svg
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Approval block */}
        <div className="flex justify-between items-start text-xs mb-4">
          <div className="text-left space-y-0.5">
            <div className="font-bold uppercase tracking-wider">{settings.approval_text || 'УТВЪРЖДАВАМ:'}</div>
            <div className="font-bold text-sm text-slate-950">{settings.pdf_director_name}</div>
            <div className="text-slate-700">{settings.approval_role || 'ДИРЕКТОР'}</div>
          </div>
          <div className="text-right text-slate-600 space-y-0.5">
            <div>Дата на утвърждаване: ________________ г.</div>
            <div>гр. {settings.pdf_school_info1?.replace(/^гр\.\s*/i, '') || ''}</div>
          </div>
        </div>

        {/* Title & Stage Period */}
        <div className="text-center mb-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-0.5">
            {settings.schedule_title || 'ГРАФИК'}
          </h2>
          <p className="text-xs text-slate-700 font-medium mb-0">
            {description} — {termText}, {yearText}
          </p>
        </div>

        {/* Schedule Table */}
        <table className="w-full border-collapse border border-slate-900 text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-900 py-2.5 px-3 text-left font-bold w-28 uppercase text-[11px]">
                {settings.day_column_header || 'Ден от седмицата'}
              </th>
              {locations.map((loc) => (
                <th
                  key={loc}
                  className="border border-slate-900 py-2.5 px-2 text-center font-bold text-[11px] leading-tight"
                >
                  {loc}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day} className="border-t border-slate-900">
                <td className="border border-slate-900 py-2.5 px-3 font-bold align-top bg-slate-50/60">
                  {day}
                </td>
                {locations.map((loc) => {
                  const cellTeachers = getAssignmentsForCell(day, loc);
                  return (
                    <td
                      key={`${day}-${loc}`}
                      className="border border-slate-900 py-2 px-2 align-top text-left"
                    >
                      {cellTeachers.length > 0 ? (
                        <div className="space-y-1">
                          {cellTeachers.map((t) => (
                            <div key={t.id} className="leading-tight text-[11px] text-slate-950">
                              {t.shiftNumber ? (
                                <strong className="text-slate-800">{t.shiftNumber}. </strong>
                              ) : null}
                              <span>{t.name}</span>
                              {t.note ? (
                                <span className="text-slate-600 italic"> ({t.note})</span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-center block">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Notes */}
        <div className="mt-4 pt-2 border-t border-slate-300 text-[11px] text-slate-600 flex justify-between items-end">
          <p className="max-w-3xl mb-0 italic">{settings.footer_note}</p>
          <div className="text-right text-[10px] text-slate-400 shrink-0">
            Генерирано чрез TideLayer SaaS
          </div>
        </div>
      </div>
    );
  }
);

PrintableSchedule.displayName = 'PrintableSchedule';

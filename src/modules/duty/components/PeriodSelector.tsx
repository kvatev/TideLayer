import { useState } from 'react';
import { Calendar, Copy, Plus, Trash2 } from 'lucide-react';
import type { DBPeriod, SchoolPeriod } from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface PeriodSelectorProps {
  currentPeriod: SchoolPeriod;
  availableYears: string[];
  availablePeriods: DBPeriod[];
  getTermsForYear: (year: string) => number[];
  onPeriodChange: (period: SchoolPeriod) => void;
  onAddPeriod: (year: string, term: 1 | 2) => Promise<boolean>;
  onDeletePeriod: (year: string, term: 1 | 2) => Promise<boolean>;
  onCopyAssignments: (sourceYear: string, sourceTerm: 1 | 2) => Promise<boolean>;
  canEdit: boolean;
  term1Label?: string;
  term2Label?: string;
  onNotify?: (type: 'error' | 'info' | 'success', msg: string) => void;
}

export function PeriodSelector({
  currentPeriod,
  availableYears,
  availablePeriods,
  getTermsForYear,
  onPeriodChange,
  onAddPeriod,
  onDeletePeriod,
  onCopyAssignments,
  canEdit,
  term1Label,
  term2Label,
  onNotify,
}: PeriodSelectorProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [newYear, setNewYear] = useState('');
  const [newTerm, setNewTerm] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  const [copySourceYear, setCopySourceYear] = useState('');
  const [copySourceTerm, setCopySourceTerm] = useState<1 | 2>(1);

  const otherPeriods = availablePeriods.filter(
    (p) => !(p.year === currentPeriod.year && p.term === currentPeriod.term)
  );

  const term1 = term1Label || 'I срок';
  const term2 = term2Label || 'II срок';

  const displayedYears =
    availableYears.length > 0
      ? availableYears.includes(currentPeriod.year)
        ? availableYears
        : [currentPeriod.year, ...availableYears]
      : [currentPeriod.year];

  const termsForCurrentYear = getTermsForYear(currentPeriod.year);
  const displayedTerms = [
    { value: 1 as const, label: term1 },
    { value: 2 as const, label: term2 },
  ].filter(
    (t) => termsForCurrentYear.length === 0 || termsForCurrentYear.includes(t.value)
  );

  const handleYearChange = (year: string) => {
    const terms = getTermsForYear(year);
    const term = terms.includes(currentPeriod.term)
      ? currentPeriod.term
      : ((terms[0] as 1 | 2) || 1);
    onPeriodChange({ year, term });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newYear.trim();
    if (!/^\d{4}\/\d{4}$/.test(trimmed)) {
      onNotify?.('error', 'Използвайте формат ГГГГ/ГГГГ (напр. 2026/2027).');
      return;
    }
    setSaving(true);
    const ok = await onAddPeriod(trimmed, newTerm);
    setSaving(false);
    if (ok) {
      setNewYear('');
      setNewTerm(1);
      setAddOpen(false);
    }
  };

  const handleCopySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copySourceYear) return;
    setSaving(true);
    const ok = await onCopyAssignments(copySourceYear, copySourceTerm);
    setSaving(false);
    if (ok) {
      setCopyOpen(false);
    }
  };

  const copySourceYears = Array.from(new Set(otherPeriods.map((p) => p.year))).sort().reverse();
  const copySourceTerms = copySourceYear
    ? getTermsForYear(copySourceYear).filter(
        (t) => !(copySourceYear === currentPeriod.year && t === currentPeriod.term)
      )
    : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-slate-600">
        <Calendar className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-xs sm:text-sm text-navy-900">Период:</span>
      </div>

      <select
        aria-label="Учебна година"
        value={currentPeriod.year}
        onChange={(e) => handleYearChange(e.target.value)}
        className="h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-medium text-navy-900 focus:outline-none focus:border-blue-500"
      >
        {displayedYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select
        aria-label="Учебен срок"
        value={String(currentPeriod.term)}
        onChange={(e) =>
          onPeriodChange({
            ...currentPeriod,
            term: Number(e.target.value) === 2 ? 2 : 1,
          })
        }
        className="h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-medium text-navy-900 focus:outline-none focus:border-blue-500"
      >
        {displayedTerms.map((t) => (
          <option key={t.value} value={String(t.value)}>
            {t.label}
          </option>
        ))}
      </select>

      {canEdit && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="w-9 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors"
            title="Добави нов период"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={otherPeriods.length === 0}
            onClick={() => {
              const firstYear = copySourceYears[0] || '';
              setCopySourceYear(firstYear);
              const firstTerms = firstYear ? getTermsForYear(firstYear) : [1];
              setCopySourceTerm((firstTerms[0] as 1 | 2) || 1);
              setCopyOpen(true);
            }}
            className="w-9 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 flex items-center justify-center transition-colors"
            title="Копирай дежурства от друг период"
          >
            <Copy className="w-4 h-4" />
          </button>

          {availablePeriods.length > 1 && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="w-9 h-9 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
              title="Изтрий текущия период"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Add Period Modal */}
      <ModuleModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Добавяне на нов период"
        subtitle="Въведете учебна година и срок."
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Учебна година *
            </label>
            <input
              type="text"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="напр. 2026/2027"
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1 mb-0">Формат: ГГГГ/ГГГГ</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Срок</label>
            <select
              value={String(newTerm)}
              onChange={(e) => setNewTerm(Number(e.target.value) === 2 ? 2 : 1)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="1">{term1}</option>
              <option value="2">{term2}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={saving || !newYear.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold"
            >
              {saving ? 'Добавяне...' : 'Добави'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Copy Assignments Modal */}
      <ModuleModal
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        title="Копиране на дежурства от друг период"
        subtitle={`Цел: ${currentPeriod.year}, ${currentPeriod.term === 1 ? 'I' : 'II'} срок`}
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleCopySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Учебна година източник
            </label>
            <select
              value={copySourceYear}
              onChange={(e) => {
                const yr = e.target.value;
                setCopySourceYear(yr);
                const terms = getTermsForYear(yr).filter(
                  (t) => !(yr === currentPeriod.year && t === currentPeriod.term)
                );
                if (terms[0]) setCopySourceTerm(terms[0] as 1 | 2);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
            >
              <option value="">Изберете година...</option>
              {copySourceYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {copySourceYear && (
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">Срок източник</label>
              <select
                value={String(copySourceTerm)}
                onChange={(e) => setCopySourceTerm(Number(e.target.value) === 2 ? 2 : 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {copySourceTerms.map((t) => (
                  <option key={t} value={String(t)}>
                    {t === 1 ? term1 : term2}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-xs text-slate-500 mb-0">
            Дежурствата, които вече съществуват в текущия период, няма да се дублират.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCopyOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={saving || !copySourceYear}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold"
            >
              {saving ? 'Копиране...' : 'Копирай'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Period Confirmation */}
      <ModuleConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await onDeletePeriod(currentPeriod.year, currentPeriod.term);
        }}
        title="Изтриване на период"
        confirmLabel="Изтрий периода"
        tone="danger"
        description={
          <>
            Сигурни ли сте, че искате да изтриете дежурствата за{' '}
            <strong>
              {currentPeriod.year}, {currentPeriod.term === 1 ? 'I' : 'II'} срок
            </strong>
            ? Действието не може да бъде отменено.
          </>
        }
      />
    </div>
  );
}


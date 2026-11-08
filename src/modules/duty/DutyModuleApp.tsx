import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Eye,
  Megaphone,
  Pencil,
  Settings,
  Users,
} from 'lucide-react';
import { useSchoolPortal } from '../../components/layout/schoolPortalContext';
import { useDutyStore } from './useDutyStore';
import { BroadcastBanner } from './components/BroadcastBanner';
import { PeriodSelector } from './components/PeriodSelector';
import { StageSelector } from './components/StageSelector';
import { Legend } from './components/Legend';
import { TeacherList } from './components/TeacherList';
import { ScheduleTable } from './components/ScheduleTable';
import { DutySettingsDialog } from './components/DutySettingsDialog';
import { ModuleModal, ModuleToastContainer } from '../shared/ModulePrimitives';
import { cn } from '../../utils/helpers';
import type { DutyBroadcast } from './types';

export function DutyModuleApp() {
  const { bundle, session } = useSchoolPortal();
  const school = bundle.school;

  const store = useDutyStore(school);

  const isSchoolAdmin =
    session.isSuperAdminPreview || session.role === 'school_admin';
  const [editorMode, setEditorMode] = useState<boolean>(isSchoolAdmin);
  const [mobileSection, setMobileSection] = useState<'schedule' | 'teachers'>('schedule');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickBcOpen, setQuickBcOpen] = useState(false);
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcPriority, setBcPriority] = useState<DutyBroadcast['priority']>('info');
  const [exportTrigger, setExportTrigger] = useState<(() => void) | null>(null);

  const handlePostQuickBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcMessage.trim()) return;
    await store.addBroadcast(bcMessage.trim(), bcPriority, bcTitle.trim() || undefined);
    setBcTitle('');
    setBcMessage('');
    setBcPriority('info');
    setQuickBcOpen(false);
  };

  const handleExportReady = useCallback((fn: () => void) => {
    setExportTrigger(() => fn);
  }, []);

  const handleExportPDF = useCallback(() => {
    if (exportTrigger) {
      exportTrigger();
    }
  }, [exportTrigger]);

  if (store.isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-0">
          Зареждане на графика за дежурства...
        </p>
      </div>
    );
  }

  const effectiveCanEdit = isSchoolAdmin && editorMode;
  const currentLogo = store.settings.logo_url || school.logo_url || '';

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link
            to={`/school/${school.slug}`}
            className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>Табло на училището</span>
          </Link>
          <span>/</span>
          <span className="text-navy-900 font-bold">График за дежурства</span>
        </div>

        <div className="flex items-center gap-2">
          {store.usingSupabase ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Supabase Cloud</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
              title="Таблиците в Supabase още не са инициализирани. Промените се пазят надеждно в локалния сторидж на браузъра."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Локален режим</span>
            </span>
          )}

          {isSchoolAdmin && (
            <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setEditorMode(true)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
                  editorMode
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                )}
                title="Режим редактор — пълни права за промяна на дежурства и учители"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Редактор</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorMode(false)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
                  !editorMode
                    ? 'bg-navy-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                )}
                title="Режим преглед — изглед без бутони за редактиране (както виждат учителите)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Преглед</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic School Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {currentLogo ? (
            <img
              src={currentLogo}
              alt={school.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-slate-50 border border-slate-200 p-1.5 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-8 h-8" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 leading-tight truncate mb-1">
              {store.settings.header_title || 'График за дежурства'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mb-0">
              {store.settings.header_subtitle ||
                (school.city ? `${school.name}, гр. ${school.city}` : school.name)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSchoolAdmin && (
            <>
              <button
                type="button"
                onClick={() => setQuickBcOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <Megaphone className="w-4 h-4" />
                <span>Ново известие</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Настройки на модула</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Broadcast Announcements Banner */}
      <BroadcastBanner
        broadcasts={store.broadcasts}
        dismissedIds={store.dismissedBroadcastIds}
        onDismiss={store.dismissBroadcast}
      />

      {/* Period & Stage Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <PeriodSelector
            currentPeriod={store.currentPeriod}
            availableYears={store.availableYears}
            availablePeriods={store.periods}
            getTermsForYear={store.getTermsForYear}
            onPeriodChange={(p) => void store.changePeriod(p)}
            onAddPeriod={store.addPeriod}
            onDeletePeriod={store.deletePeriod}
            onCopyAssignments={store.copyAssignmentsFromPeriod}
            canEdit={effectiveCanEdit}
            term1Label={store.settings.term_1_label}
            term2Label={store.settings.term_2_label}
            onNotify={store.pushToast}
          />

          <div className="hidden sm:block w-px h-7 bg-slate-200" />

          <StageSelector
            currentStage={store.currentStage}
            onStageChange={store.changeStage}
          />
        </div>

        <Legend onExportPDF={handleExportPDF} />
      </div>

      {/* Mobile section switcher when editable */}
      {effectiveCanEdit && (
        <div className="flex sm:hidden rounded-xl bg-slate-200/80 p-1 gap-1">
          <button
            type="button"
            onClick={() => setMobileSection('schedule')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
              mobileSection === 'schedule'
                ? 'bg-white text-navy-900 shadow-2xs'
                : 'text-slate-600 hover:text-navy-900'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>График</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSection('teachers')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
              mobileSection === 'teachers'
                ? 'bg-white text-navy-900 shadow-2xs'
                : 'text-slate-600 hover:text-navy-900'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              Учители ({store.teachers.length})
            </span>
          </button>
        </div>
      )}

      {/* Main Workspace Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Teachers Sidebar (Only visible in editor mode, or if on mobile "teachers" tab) */}
        {effectiveCanEdit && (
          <aside
            className={cn(
              'lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20',
              mobileSection !== 'teachers' && 'hidden lg:block'
            )}
          >
            <TeacherList
              teachers={store.teachers}
              counts={store.teacherAssignmentCounts}
              canEdit={effectiveCanEdit}
              onAddTeacher={store.addTeacher}
              onRemoveTeacher={store.removeTeacher}
              onRenameTeacher={store.renameTeacher}
              onAutoArrange={store.autoArrangeTeachers}
              onClearSchedule={store.clearSchedule}
              currentStage={store.currentStage}
              getTeacherUnavailabilities={store.getTeacherUnavailabilities}
              onAddWeekdayUnavail={store.addWeekdayUnavailability}
              onAddDateUnavail={store.addDateUnavailability}
              onRemoveUnavail={store.removeUnavailability}
              onNotify={store.pushToast}
            />
          </aside>
        )}

        {/* Schedule Table Section */}
        <section
          className={cn(
            effectiveCanEdit
              ? 'lg:col-span-8 xl:col-span-9'
              : 'col-span-1 lg:col-span-12',
            effectiveCanEdit && mobileSection !== 'schedule' && 'hidden lg:block'
          )}
        >
          <ScheduleTable
            getAssignmentsForCell={store.getAssignmentsForCell}
            counts={store.teacherAssignmentCounts}
            canEdit={effectiveCanEdit}
            onAssign={store.assignTeacher}
            onUnassign={store.unassignTeacher}
            onMove={store.moveTeacher}
            onUpdateShiftNumber={store.updateShiftNumber}
            onUpdateNote={store.updateAssignmentNote}
            currentPeriod={store.currentPeriod}
            currentStage={store.currentStage}
            settings={store.settings}
            teachers={store.teachers}
            locations={store.locationNames}
            getTeacherDayCount={store.getTeacherDayCount}
            isTeacherUnavailable={store.isTeacherUnavailable}
            onExportReady={handleExportReady}
            onNotify={store.pushToast}
          />

          {effectiveCanEdit && store.settings.tip_text && (
            <p className="mt-4 text-xs sm:text-sm text-slate-500 text-center mb-0">
              {store.settings.tip_text}
            </p>
          )}
        </section>
      </div>

      {/* Minimal footer note & contact */}
      <footer className="pt-6 pb-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <p className="mb-0">{store.settings.footer_note}</p>
        <p className="text-[11px] text-slate-400 mb-0">
          Администратор: <strong>{store.settings.admin_name}</strong>
          {store.settings.admin_email ? ` • ${store.settings.admin_email}` : ''}
        </p>
      </footer>

      {/* Settings Modal */}
      {isSchoolAdmin && (
        <DutySettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={store.settings}
          onSaveSettings={store.updateMultipleSettings}
          broadcasts={store.broadcasts}
          onAddBroadcast={store.addBroadcast}
          onDeleteBroadcast={store.deleteBroadcast}
          onExportBackup={store.exportBackup}
          onImportBackup={store.importBackup}
          onLoadSampleTemplate={store.loadSampleTemplate}
          onResetToEmpty={store.resetToEmpty}
          onNotify={store.pushToast}
        />
      )}

      {/* Quick Admin Broadcast Modal */}
      {isSchoolAdmin && (
        <ModuleModal
          open={quickBcOpen}
          onClose={() => setQuickBcOpen(false)}
          title="Публикуване на съобщение / известие"
          subtitle="Известието ще се появи в банер най-отгоре над графика за всички учители"
          maxWidthClass="max-w-lg"
        >
          <form onSubmit={handlePostQuickBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ниво на спешност
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'info', label: '📢 Информация', cls: 'border-blue-300 text-blue-700 bg-blue-50' },
                  { id: 'warning', label: '⚠️ Важно', cls: 'border-amber-300 text-amber-800 bg-amber-50' },
                  { id: 'urgent', label: '🚨 Спешно', cls: 'border-red-300 text-red-700 bg-red-50' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBcPriority(item.id as DutyBroadcast['priority'])}
                    className={cn(
                      'py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center',
                      bcPriority === item.id
                        ? `${item.cls} ring-2 ring-blue-500 font-bold shadow-2xs`
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Кратко заглавие (по избор)
              </label>
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                placeholder="напр. Промяна в графика за петък..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Текст на съобщението *
              </label>
              <textarea
                rows={3}
                value={bcMessage}
                onChange={(e) => setBcMessage(e.target.value)}
                placeholder="Въведете детайли за учителите..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setQuickBcOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Отказ
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
              >
                Публикувай веднага
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Shared Module Toasts */}
      <ModuleToastContainer toasts={store.toasts} onDismiss={store.dismissToast} />
    </div>
  );
}

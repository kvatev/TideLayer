import { useState, useRef, type ChangeEvent } from 'react';
import {
  AlertTriangle,
  Backpack,
  Download,
  GraduationCap,
  Image as ImageIcon,
  Megaphone,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  type DutyAppSettings,
  type DutyBroadcast,
  type FullDutyBackup,
} from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface DutySettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: DutyAppSettings;
  onSaveSettings: (updates: Partial<DutyAppSettings>) => Promise<boolean>;
  broadcasts: DutyBroadcast[];
  onAddBroadcast: (
    message: string,
    priority: DutyBroadcast['priority'],
    title?: string
  ) => Promise<boolean>;
  onDeleteBroadcast: (id: string) => Promise<void>;
  onExportBackup: () => FullDutyBackup;
  onImportBackup: (backup: FullDutyBackup) => Promise<boolean>;
  onLoadSampleTemplate: () => Promise<void>;
  onResetToEmpty: () => Promise<void>;
  onNotify?: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export function DutySettingsDialog({
  open,
  onClose,
  settings,
  onSaveSettings,
  broadcasts,
  onAddBroadcast,
  onDeleteBroadcast,
  onExportBackup,
  onImportBackup,
  onLoadSampleTemplate,
  onResetToEmpty,
  onNotify,
}: DutySettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    'general' | 'logo' | 'locations' | 'pdf' | 'contacts' | 'broadcasts' | 'backup'
  >('general');

  const [draft, setDraft] = useState<DutyAppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Broadcasts sub-state
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcPriority, setBcPriority] = useState<DutyBroadcast['priority']>('info');
  const [bcSubmitting, setBcSubmitting] = useState(false);

  // Reset confirmation
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraft(settings);
    }
  }

  const updateDraft = (key: keyof DutyAppSettings, val: string) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const ok = await onSaveSettings(draft);
    setIsSaving(false);
    if (ok) {
      onClose();
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify?.('error', 'Моля, изберете изображение.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onNotify?.('error', 'Размерът на файла трябва да е под 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (base64) {
        updateDraft('logo_url', base64);
        onNotify?.('success', 'Логото е заредено в настройките.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadBackup = () => {
    const backup = onExportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duty-schedule-backup-${backup.schoolSlug}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify?.('success', 'Резервното копие е свалено.');
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const raw = ev.target?.result as string;
        const parsed = JSON.parse(raw) as FullDutyBackup;
        const ok = await onImportBackup(parsed);
        if (ok) {
          onClose();
        }
      } catch {
        onNotify?.('error', 'Невалиден JSON файл.');
      }
    };
    reader.readAsText(file);
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcMessage.trim()) return;
    setBcSubmitting(true);
    const ok = await onAddBroadcast(bcMessage, bcPriority, bcTitle);
    setBcSubmitting(false);
    if (ok) {
      setBcTitle('');
      setBcMessage('');
      setBcPriority('info');
    }
  };

  return (
    <>
      <ModuleModal
        open={open}
        onClose={onClose}
        title="Настройки на графика за дежурства"
        subtitle="Персонализиране на изгледа, локациите, PDF бланките и архивите"
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Запазване...' : 'Запази настройките'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Tabs header */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
            {[
              { id: 'general', label: 'Общи' },
              { id: 'logo', label: 'Лого' },
              { id: 'locations', label: 'Локации' },
              { id: 'pdf', label: 'PDF' },
              { id: 'contacts', label: 'Контакти' },
              { id: 'broadcasts', label: 'Съобщения' },
              { id: 'backup', label: 'Архив и Шаблони' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Общи */}
          {activeTab === 'general' && (
            <div className="space-y-3.5 animate-fade-in text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Заглавие в хедъра
                </label>
                <input
                  type="text"
                  value={draft.header_title}
                  onChange={(e) => updateDraft('header_title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Подзаглавие в хедъра
                </label>
                <input
                  type="text"
                  value={draft.header_subtitle}
                  onChange={(e) => updateDraft('header_subtitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Бележка във футъра (инструкция за смени)
                </label>
                <textarea
                  rows={2}
                  value={draft.footer_note}
                  onChange={(e) => updateDraft('footer_note', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Заглавие на първата колона в таблицата
                </label>
                <input
                  type="text"
                  value={draft.day_column_header}
                  onChange={(e) => updateDraft('day_column_header', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Помощен съвет под графика
                </label>
                <textarea
                  rows={2}
                  value={draft.tip_text}
                  onChange={(e) => updateDraft('tip_text', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Етикет за I-ви срок
                  </label>
                  <input
                    type="text"
                    value={draft.term_1_label}
                    onChange={(e) => updateDraft('term_1_label', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Етикет за II-ри срок
                  </label>
                  <input
                    type="text"
                    value={draft.term_2_label}
                    onChange={(e) => updateDraft('term_2_label', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Лого */}
          {activeTab === 'logo' && (
            <div className="space-y-4 animate-fade-in text-xs sm:text-sm">
              <p className="text-slate-600 mb-0">
                Качете училищен герб или емблема. Изображението се показва в горния хедър на модула
                и върху отпечатаните графици (PDF).
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-slate-200 bg-slate-50">
                {draft.logo_url ? (
                  <div className="relative">
                    <img
                      src={draft.logo_url}
                      alt="Училищно лого"
                      className="w-24 h-24 object-contain bg-white rounded-xl border border-slate-200 p-2 shadow-xs shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => updateDraft('logo_url', '')}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs shadow-xs"
                      title="Премахни"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">Няма лого</span>
                  </div>
                )}

                <div className="space-y-2 text-center sm:text-left">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Качи файл (PNG, JPG, SVG)</span>
                  </button>
                  <p className="text-[11px] text-slate-500 mb-0">Максимален размер: до 2MB</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Локации */}
          {activeTab === 'locations' && (
            <div className="space-y-5 animate-fade-in text-xs sm:text-sm">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 font-heading font-bold text-navy-900">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Прогимназиален и гимназиален етап (V – XII клас) — 5 поста</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 1 (Партер / Етаж 0)
                    </label>
                    <input
                      type="text"
                      value={draft.location_5}
                      onChange={(e) => updateDraft('location_5', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 2 (III-ти етаж)
                    </label>
                    <input
                      type="text"
                      value={draft.location_1}
                      onChange={(e) => updateDraft('location_1', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 3 (IV-ти етаж)
                    </label>
                    <input
                      type="text"
                      value={draft.location_2}
                      onChange={(e) => updateDraft('location_2', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 4 (Стол и кабинет по музика)
                    </label>
                    <input
                      type="text"
                      value={draft.location_3}
                      onChange={(e) => updateDraft('location_3', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 5 (Главен дежурен – западен вход)
                    </label>
                    <input
                      type="text"
                      value={draft.location_4}
                      onChange={(e) => updateDraft('location_4', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 font-heading font-bold text-navy-900">
                  <Backpack className="w-4 h-4 text-amber-600" />
                  <span>Начален етап (I – IV клас) — 3 поста</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 1 (Параден вход)
                    </label>
                    <input
                      type="text"
                      value={draft.primary_location_1}
                      onChange={(e) => updateDraft('primary_location_1', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 2 (I етаж)
                    </label>
                    <input
                      type="text"
                      value={draft.primary_location_2}
                      onChange={(e) => updateDraft('primary_location_2', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Пост 3 (II етаж)
                    </label>
                    <input
                      type="text"
                      value={draft.primary_location_3}
                      onChange={(e) => updateDraft('primary_location_3', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-3.5 animate-fade-in text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Име на училището за официален печат (PDF)
                </label>
                <input
                  type="text"
                  value={draft.pdf_school_name}
                  onChange={(e) => updateDraft('pdf_school_name', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">Град / Адрес</label>
                  <input
                    type="text"
                    value={draft.pdf_school_info1}
                    onChange={(e) => updateDraft('pdf_school_info1', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Имейл / Телефон на училището
                  </label>
                  <input
                    type="text"
                    value={draft.pdf_school_info2}
                    onChange={(e) => updateDraft('pdf_school_info2', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Текст за утвърждаване
                  </label>
                  <input
                    type="text"
                    value={draft.approval_text}
                    onChange={(e) => updateDraft('approval_text', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">
                    Име на директора
                  </label>
                  <input
                    type="text"
                    value={draft.pdf_director_name}
                    onChange={(e) => updateDraft('pdf_director_name', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-900 mb-1">Длъжност</label>
                  <input
                    type="text"
                    value={draft.approval_role}
                    onChange={(e) => updateDraft('approval_role', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Описание на графика за V–XII клас
                </label>
                <textarea
                  rows={2}
                  value={draft.pdf_schedule_description}
                  onChange={(e) => updateDraft('pdf_schedule_description', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Описание на графика за I–IV клас
                </label>
                <textarea
                  rows={2}
                  value={draft.pdf_schedule_description_primary}
                  onChange={(e) => updateDraft('pdf_schedule_description_primary', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Контакти */}
          {activeTab === 'contacts' && (
            <div className="space-y-3.5 animate-fade-in text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Име на училищния администратор
                </label>
                <input
                  type="text"
                  value={draft.admin_name}
                  onChange={(e) => updateDraft('admin_name', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-navy-900 mb-1">
                  Имейл за контакт при въпроси
                </label>
                <input
                  type="email"
                  value={draft.admin_email}
                  onChange={(e) => updateDraft('admin_email', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 6: Съобщения */}
          {activeTab === 'broadcasts' && (
            <div className="space-y-4 animate-fade-in text-xs sm:text-sm">
              <form
                onSubmit={handleBroadcastSubmit}
                className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3"
              >
                <div className="font-heading font-bold text-navy-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <span>Публикувай съобщение към всички учители</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={bcTitle}
                      onChange={(e) => setBcTitle(e.target.value)}
                      placeholder="Кратко заглавие (по избор)..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <select
                      value={bcPriority}
                      onChange={(e) =>
                        setBcPriority(e.target.value as DutyBroadcast['priority'])
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="info">📢 Обикновено</option>
                      <option value="warning">⚠️ Важно</option>
                      <option value="urgent">🚨 Спешно</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={bcMessage}
                  onChange={(e) => setBcMessage(e.target.value)}
                  placeholder="Въведете съдържание на съобщението..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={bcSubmitting || !bcMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{bcSubmitting ? 'Публикуване...' : 'Публикувай съобщението'}</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <div className="font-semibold text-navy-900 text-xs">
                  Активни съобщения ({broadcasts.length})
                </div>
                {broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase',
                            b.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : b.priority === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-700'
                          )}
                        >
                          {b.priority}
                        </span>
                        {b.title && (
                          <strong className="text-xs text-navy-900">{b.title}</strong>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mb-0 whitespace-pre-wrap">{b.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void onDeleteBroadcast(b.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Изтрий"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {broadcasts.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Няма активни съобщения в момента.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: Архив и Шаблони */}
          {activeTab === 'backup' && (
            <div className="space-y-4 animate-fade-in text-xs sm:text-sm">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="font-heading font-bold text-navy-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Експорт на резервно копие</span>
                </div>
                <p className="text-slate-600 mb-0">
                  Свалете всички графици, периоди, учители, отсъствия и локации в един цялостен
                  JSON файл на вашия компютър.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Свали пълен архив (JSON)</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="font-heading font-bold text-navy-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Възстановяване от резервно копие</span>
                </div>
                <p className="text-slate-600 mb-0">
                  Изберете предварително свален JSON файл, за да възстановите структурата и
                  дежурствата.
                </p>
                <input
                  ref={backupInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => backupInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-navy-900 text-xs font-semibold shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Избери файл за възстановяване</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 space-y-3">
                <div className="font-heading font-bold text-blue-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Официален примерен шаблон</span>
                </div>
                <p className="text-blue-800 mb-0">
                  Зарежда предварително подготвен набор от реални дежурства и учители за двата
                  етапа като удобен начален шаблон за тестване или бърз старт.
                </p>
                <button
                  type="button"
                  onClick={() => setSampleModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Зареди примерен шаблон</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50 space-y-3">
                <div className="font-heading font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Нулиране на графика и учителите</span>
                </div>
                <p className="text-red-700 mb-0">
                  Изтрива всички текущи дежурства, учители и отсъствия за това училище и възстановява
                  чиста първоначална празна таблица.
                </p>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Нулирай графика</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </ModuleModal>

      {/* Confirmation Dialogs */}
      <ModuleConfirmDialog
        open={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        onConfirm={async () => {
          await onLoadSampleTemplate();
          onClose();
        }}
        title="Зареждане на примерен шаблон"
        confirmLabel="Зареди шаблон"
        tone="warning"
        description="Сигурни ли сте, че искате да заредите примерния шаблон? Текущите учители и дежурства за периода ще бъдат заменени с примерните данни."
      />

      <ModuleConfirmDialog
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={async () => {
          await onResetToEmpty();
          onClose();
        }}
        title="Нулиране на графика"
        confirmLabel="Да, нулирай всичко"
        tone="danger"
        description="Всички учители, отсъствия и дежурства за това училище ще бъдат изтрити. Препоръчваме предварително да свалите резервно копие (JSON)."
      />
    </>
  );
}

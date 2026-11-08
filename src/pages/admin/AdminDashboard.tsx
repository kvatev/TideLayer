import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { inquiryStore, INQUIRIES_EVENT, type Inquiry, type InquiryStatus } from '../../data/inquiries';
import {
  siteControlStore,
  useSiteControl,
  HOME_SECTION_LABELS,
  MANAGEABLE_NAV_ITEMS,
} from '../../data/siteControl';
import { adminAuth } from '../../data/adminAuth';
import { brandConfig } from '../../config/brand';

// ─── Constants & Helpers ─────────────────────────────────────────────────────

type AdminTab = 'inquiries' | 'menus' | 'portfolio' | 'settings';
type FilterStatus = 'all' | InquiryStatus;

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: 'Ново',
  read: 'Прочетено',
  replied: 'Отговорено',
  archived: 'Архивирано',
};

const STATUS_COLOR: Record<InquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  read: 'bg-amber-100 text-amber-800 border-amber-200',
  replied: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  'web-solutions': 'Уеб решения',
  'website-development': 'Уеб разработка',
  'web-applications': 'Уеб приложения',
  'website-maintenance': 'Поддръжка на уебсайт',
  'education-solutions': 'Училищни решения',
  'duty-scheduler': 'График на дежурства',
  'school-ticketing': 'Система за заявки',
  'school-inventory': 'Инвентарна система',
  'school-it-support': 'ИТ поддръжка за училища',
  'networks-it': 'Мрежи и ИТ инфраструктура',
  'network-installation': 'Изграждане на мрежи',
  'wifi-lan': 'Wi-Fi и LAN',
  'servers-nas': 'Сървъри и NAS',
  'monthly-support': 'Месечна ИТ поддръжка',
  'hardware-service': 'Хардуерен сервиз',
  other: 'Друго',
};

const PRODUCT_PRESELECT_LABELS: Record<string, string> = {
  'website-development': 'Уеб разработка',
  'website-maintenance': 'Поддръжка на уебсайтове',
  'school-it-support': 'ИТ поддръжка за училища',
  'network-installation': 'Изграждане на мрежи',
  'monthly-support': 'Месечна ИТ поддръжка',
  'duty-scheduler': 'График на дежурства',
  'school-ticketing': 'Училищна система за заявки',
  'school-inventory': 'Училищна инвентарна система',
};

const PROJECT_IMAGE_OPTIONS = [
  { label: 'Уеб разработка (web-dev)', value: '/images/sections/web-dev.webp' },
  { label: 'Училищни системи (education)', value: '/images/sections/education.webp' },
  { label: 'Мрежи и инфраструктура (network)', value: '/images/sections/network.webp' },
  { label: 'ИТ поддръжка (it-support)', value: '/images/sections/it-support.webp' },
  { label: 'Хардуер и сервиз (hardware)', value: '/images/sections/hardware.webp' },
  { label: 'Екип / Корпоративен (hero-team)', value: '/images/sections/hero-team.webp' },
];

const NAV_GROUPS = ['Основна навигация', 'Уеб решения', 'Училищни решения', 'Мрежи и ИТ'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPreselect(val?: string): string {
  if (!val) return '';
  const idx = val.indexOf(' (');
  if (idx === -1) return PRODUCT_PRESELECT_LABELS[val] ?? val;
  const base = val.slice(0, idx);
  const rest = val.slice(idx);
  return `${PRODUCT_PRESELECT_LABELS[base] ?? base}${rest}`;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3.5 sm:p-4 flex flex-col items-start gap-1 text-left transition-all ${color} ${
        active ? 'ring-2 ring-blue-500 ring-offset-1 shadow-sm' : 'hover:shadow-sm'
      }`}
    >
      <span className="text-xl sm:text-2xl font-bold font-heading leading-none">{value}</span>
      <span className="text-xs font-medium opacity-85">{label}</span>
    </button>
  );
}

// ─── Confirm Modal ───────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogState & { onCancel: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 animate-scale-in">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {variant === 'danger' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              )}
            </svg>
          </div>
          <div className="min-w-0">
            <h3 id="confirm-dialog-title" className="text-lg font-heading font-bold text-navy-900">
              {title}
            </h3>
            <p className="text-sm text-slate-600 mt-1 mb-0 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Отказ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inquiry Detail Modal ────────────────────────────────────────────────────

function InquiryModal({
  inquiry,
  onClose,
  onStatusChange,
  onRequestDelete,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusChange: (id: string, status: InquiryStatus) => void;
  onRequestDelete: (inq: Inquiry) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const preselectLabel = formatPreselect(inquiry.productPreselect);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-slate-100">
          <div className="min-w-0">
            <h2 id="inquiry-modal-title" className="text-lg sm:text-xl font-heading font-bold text-navy-900 break-words">
              {inquiry.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-0">{formatDate(inquiry.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Затвори"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status + Type + Preselect */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_COLOR[inquiry.status]}`}>
              {STATUS_LABEL[inquiry.status]}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700">
              {INQUIRY_TYPE_LABELS[inquiry.inquiryType] ?? inquiry.inquiryType}
            </span>
            {preselectLabel && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700">
                Продукт / план: {preselectLabel}
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Имейл</div>
              <a href={`mailto:${inquiry.email}`} className="text-sm text-blue-600 hover:underline font-medium break-all">
                {inquiry.email}
              </a>
            </div>
            {inquiry.phone && (
              <div className="min-w-0">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Телефон</div>
                <a href={`tel:${inquiry.phone}`} className="text-sm text-blue-600 hover:underline font-medium">
                  {inquiry.phone}
                </a>
              </div>
            )}
            {inquiry.company && (
              <div className="min-w-0 sm:col-span-2">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Компания / Организация</div>
                <div className="text-sm text-slate-700 font-medium break-words">{inquiry.company}</div>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Съобщение</div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 rounded-xl p-4 border border-slate-100 mb-0">
              {inquiry.message}
            </p>
          </div>

          {/* Change status */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Промени статус</div>
            <div className="flex flex-wrap gap-2">
              {(['new', 'read', 'replied', 'archived'] as InquiryStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(inquiry.id, s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    inquiry.status === s
                      ? STATUS_COLOR[s] + ' ring-2 ring-offset-1 ring-current'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 sm:p-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={() => onRequestDelete(inquiry)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            Изтрий запитването
          </button>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Запитване - ${INQUIRY_TYPE_LABELS[inquiry.inquiryType] ?? inquiry.inquiryType}`)}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Отговори по имейл
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Затвори
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const session = adminAuth.getSession();
  const siteControl = useSiteControl();

  const [activeTab, setActiveTab] = useState<AdminTab>('inquiries');
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => inquiryStore.getAll());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailInquiry, setDetailInquiry] = useState<Inquiry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Portfolio add form
  const [showAddProject, setShowAddProject] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Уеб решения');
  const [projDescription, setProjDescription] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projImage, setProjImage] = useState(PROJECT_IMAGE_OPTIONS[0].value);
  const [projError, setProjError] = useState('');

  // FAQ add form
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqError, setFaqError] = useState('');

  // Contact settings draft (derived from siteControl when null)
  const [contactDraft, setContactDraft] = useState<{
    email: string;
    phone: string;
    addressFull: string;
  } | null>(null);
  const contactEmail = contactDraft?.email ?? siteControl.contactInfo.email;
  const contactPhone = contactDraft?.phone ?? siteControl.contactInfo.phone;
  const contactAddress = contactDraft?.addressFull ?? siteControl.contactInfo.addressFull;

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const refreshInquiries = useCallback(() => {
    setInquiries(inquiryStore.getAll());
  }, []);

  useEffect(() => {
    const sync = () => refreshInquiries();
    window.addEventListener(INQUIRIES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(INQUIRIES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [refreshInquiries]);

  const stats = {
    total: inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    read: inquiries.filter((i) => i.status === 'read').length,
    replied: inquiries.filter((i) => i.status === 'replied').length,
    archived: inquiries.filter((i) => i.status === 'archived').length,
  };

  // Filtered inquiries
  const filtered = inquiries.filter((inq) => {
    if (filterStatus !== 'all' && inq.status !== filterStatus) return false;
    if (filterType !== 'all' && inq.inquiryType !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      const pre = formatPreselect(inq.productPreselect).toLowerCase();
      return (
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        (inq.company ?? '').toLowerCase().includes(q) ||
        (inq.phone ?? '').toLowerCase().includes(q) ||
        pre.includes(q) ||
        inq.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueTypes = Array.from(new Set(inquiries.map((i) => i.inquiryType)));
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((inq) => selectedIds.includes(inq.id));

  // Inquiry Handlers
  const handleStatusChange = (id: string, status: InquiryStatus) => {
    inquiryStore.updateStatus(id, status);
    setDetailInquiry((prev) => (prev?.id === id ? { ...prev, status } : prev));
    refreshInquiries();
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filtered.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...filtered.map((i) => i.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const requestDeleteSingle = (inq: Inquiry) => {
    setConfirmDialog({
      title: 'Изтриване на запитване',
      message: `Сигурни ли сте, че искате да изтриете запитването от ${inq.name}? Това действие не може да бъде отменено.`,
      confirmLabel: 'Изтрий',
      variant: 'danger',
      onConfirm: () => {
        inquiryStore.delete(inq.id);
        setSelectedIds((prev) => prev.filter((id) => id !== inq.id));
        if (detailInquiry?.id === inq.id) setDetailInquiry(null);
        refreshInquiries();
        setConfirmDialog(null);
        showToast('Запитването беше изтрито.');
      },
    });
  };

  const requestDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setConfirmDialog({
      title: 'Изтриване на избраните запитвания',
      message: `Сигурни ли сте, че искате да изтриете избраните ${count} запитвания?`,
      confirmLabel: `Изтрий (${count})`,
      variant: 'danger',
      onConfirm: () => {
        inquiryStore.deleteMany(selectedIds);
        setSelectedIds([]);
        refreshInquiries();
        setConfirmDialog(null);
        showToast(`Изтрити са ${count} запитвания.`);
      },
    });
  };

  const requestDeleteArchived = () => {
    if (stats.archived === 0) return;
    const count = stats.archived;
    setConfirmDialog({
      title: 'Изтриване на архивираните запитвания',
      message: `Ще бъдат изтрити всички ${count} архивирани запитвания. Продължавате ли?`,
      confirmLabel: `Изтрий (${count})`,
      variant: 'danger',
      onConfirm: () => {
        inquiryStore.deleteByStatus('archived');
        setSelectedIds([]);
        refreshInquiries();
        setConfirmDialog(null);
        showToast('Архивираните запитвания бяха изтрити.');
      },
    });
  };

  const requestDeleteAllInquiries = () => {
    if (inquiries.length === 0) return;
    setConfirmDialog({
      title: 'Изтриване на ВСИЧКИ запитвания',
      message: `Ще изтриете всички ${inquiries.length} запитвания в списъка. След това ще виждате само нови запитвания от клиентите или можете да заредите примерни.`,
      confirmLabel: 'Изтрий всички',
      variant: 'danger',
      onConfirm: () => {
        inquiryStore.deleteAll();
        setSelectedIds([]);
        setDetailInquiry(null);
        refreshInquiries();
        setConfirmDialog(null);
        showToast('Всички запитвания бяха изтрити.');
      },
    });
  };

  const handleBulkStatus = (status: InquiryStatus) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => inquiryStore.updateStatus(id, status));
    refreshInquiries();
    setSelectedIds([]);
    showToast(`Статусът на избраните е обновен на „${STATUS_LABEL[status]}“.`);
  };

  const handleRestoreDemoInquiries = () => {
    inquiryStore.restoreDemo();
    refreshInquiries();
    setSelectedIds([]);
    showToast('Примерните запитвания бяха заредени.');
  };

  // Portfolio Handlers
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDescription.trim()) {
      setProjError('Моля, попълнете заглавие и описание на проекта.');
      return;
    }
    const tagsList = projTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    siteControlStore.addProject({
      title: projTitle.trim(),
      category: projCategory.trim() || 'Уеб решения',
      description: projDescription.trim(),
      tags: tagsList.length > 0 ? tagsList : ['Уеб проект'],
      image: projImage.trim() || PROJECT_IMAGE_OPTIONS[0].value,
      url: projUrl.trim() || undefined,
      isDemo: false,
    });
    setProjTitle('');
    setProjDescription('');
    setProjTags('');
    setProjUrl('');
    setProjError('');
    setShowAddProject(false);
    showToast('Новият проект беше добавен към портфолиото.');
  };

  // FAQ Handlers
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      setFaqError('Моля, попълнете и въпрос, и отговор.');
      return;
    }
    siteControlStore.addFaq(faqQuestion.trim(), faqAnswer.trim());
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqError('');
    setShowAddFaq(false);
    showToast('Въпросът беше добавен към ЧЗВ.');
  };

  // Contact Info Save
  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    siteControlStore.updateContactInfo({
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      addressFull: contactAddress.trim(),
    });
    setContactDraft(null);
    showToast('Контактната информация на сайта беше обновена.');
  };

  const handleLogout = () => {
    adminAuth.logout();
    onLogout();
  };

  const hiddenMenusCount =
    siteControl.hiddenNavHrefs.length +
    siteControl.hiddenDivisionIds.length +
    siteControl.hiddenSections.length;

  const pageMeta: Record<AdminTab, { title: string; subtitle: string }> = {
    inquiries: {
      title: 'Запитвания от клиенти',
      subtitle: `${filtered.length} от ${inquiries.length} записа`,
    },
    menus: {
      title: 'Менюта, направления и раздели',
      subtitle:
        hiddenMenusCount > 0
          ? `Скрити елементи: ${hiddenMenusCount}`
          : 'Всички менюта и секции са видими',
    },
    portfolio: {
      title: 'Управление на портфолио',
      subtitle: `${siteControl.projects.length} проекта (${siteControl.hiddenProjectIds.length} скрити)`,
    },
    settings: {
      title: 'Настройки, ЧЗВ и Изчистване',
      subtitle: 'Контактни данни, въпроси и пълно изтриване на съдържание',
    },
  };

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-x-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[min(17rem,88vw)] bg-navy-900 text-white flex flex-col transition-transform duration-200
          lg:static lg:w-64 lg:translate-x-0 shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0">
          <img src="/images/logo/icon.webp" alt="Logo" className="h-8 w-auto object-contain shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white leading-tight truncate">{brandConfig.name}</div>
            <div className="text-xs text-slate-400 leading-tight">Админ панел</div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Затвори менюто"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {/* Group 1: Inquiries */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Запитвания
            </div>

            <SidebarItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              }
              label="Всички запитвания"
              count={stats.total}
              active={activeTab === 'inquiries' && filterStatus === 'all'}
              onClick={() => {
                setActiveTab('inquiries');
                setFilterStatus('all');
                setSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<span className="w-2 h-2 rounded-full bg-blue-400 mx-1" />}
              label="Нови"
              count={stats.new}
              active={activeTab === 'inquiries' && filterStatus === 'new'}
              onClick={() => {
                setActiveTab('inquiries');
                setFilterStatus('new');
                setSidebarOpen(false);
              }}
              highlight={stats.new > 0}
            />
            <SidebarItem
              icon={<span className="w-2 h-2 rounded-full bg-amber-400 mx-1" />}
              label="Прочетени"
              count={stats.read}
              active={activeTab === 'inquiries' && filterStatus === 'read'}
              onClick={() => {
                setActiveTab('inquiries');
                setFilterStatus('read');
                setSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<span className="w-2 h-2 rounded-full bg-green-400 mx-1" />}
              label="Отговорени"
              count={stats.replied}
              active={activeTab === 'inquiries' && filterStatus === 'replied'}
              onClick={() => {
                setActiveTab('inquiries');
                setFilterStatus('replied');
                setSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<span className="w-2 h-2 rounded-full bg-slate-400 mx-1" />}
              label="Архивирани"
              count={stats.archived}
              active={activeTab === 'inquiries' && filterStatus === 'archived'}
              onClick={() => {
                setActiveTab('inquiries');
                setFilterStatus('archived');
                setSidebarOpen(false);
              }}
            />
          </div>

          {/* Group 2: Site Management */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Управление на сайта
            </div>

            <SidebarItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                </svg>
              }
              label="Менюта и раздели"
              count={hiddenMenusCount > 0 ? hiddenMenusCount : undefined}
              active={activeTab === 'menus'}
              onClick={() => {
                setActiveTab('menus');
                setSidebarOpen(false);
              }}
            />

            <SidebarItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="Портфолио"
              count={siteControl.projects.length}
              active={activeTab === 'portfolio'}
              onClick={() => {
                setActiveTab('portfolio');
                setSidebarOpen(false);
              }}
            />

            <SidebarItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              }
              label="Настройки и данни"
              active={activeTab === 'settings'}
              onClick={() => {
                setActiveTab('settings');
                setSidebarOpen(false);
              }}
            />
          </div>
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/10 p-4 shrink-0 space-y-2">
          <div className="flex items-center gap-3 pb-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {(session?.username ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{session?.username ?? 'admin'}</div>
              <div className="text-xs text-slate-400">Администратор</div>
            </div>
          </div>
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Към сайта
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Изход
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (< lg) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-20">
          <button
            type="button"
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Отвори менюто"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-heading font-bold text-navy-900 truncate">
              {pageMeta[activeTab].title}
            </h1>
            <p className="text-xs text-slate-500 mb-0 truncate">
              {pageMeta[activeTab].subtitle}
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden min-[400px]:inline">Сайт</span>
          </a>
        </header>

        {/* Mobile Quick Tab Switcher (< lg) */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {(
            [
              { id: 'inquiries', label: `Запитвания (${stats.total})` },
              { id: 'menus', label: 'Менюта и раздели' },
              { id: 'portfolio', label: `Портфолио (${siteControl.projects.length})` },
              { id: 'settings', label: 'Настройки / Изтриване' },
            ] as { id: AdminTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeTab === t.id
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6 space-y-5 min-w-0">
          {/* Toast feedback */}
          {toast && (
            <div
              role="status"
              className="bg-navy-900 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between gap-3 text-sm animate-fade-in"
            >
              <span>{toast}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-slate-300 hover:text-white text-xs font-medium shrink-0"
              >
                Затвори
              </button>
            </div>
          )}

          {/* ══════════════════ TAB 1: INQUIRIES ══════════════════ */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Всички"
                  value={stats.total}
                  color="bg-white border-slate-200 text-navy-900"
                  active={filterStatus === 'all'}
                  onClick={() => setFilterStatus('all')}
                />
                <StatCard
                  label="Нови"
                  value={stats.new}
                  color="bg-blue-50 border-blue-200 text-blue-800"
                  active={filterStatus === 'new'}
                  onClick={() => setFilterStatus('new')}
                />
                <StatCard
                  label="Отговорени"
                  value={stats.replied}
                  color="bg-green-50 border-green-200 text-green-800"
                  active={filterStatus === 'replied'}
                  onClick={() => setFilterStatus('replied')}
                />
                <StatCard
                  label="Архивирани"
                  value={stats.archived}
                  color="bg-slate-50 border-slate-200 text-slate-700"
                  active={filterStatus === 'archived'}
                  onClick={() => setFilterStatus('archived')}
                />
              </div>

              {/* Filter & Search Toolbar */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 min-w-0">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Търси по име, имейл, фирма, съобщение…"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    aria-label="Филтър по направление"
                    className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                  >
                    <option value="all">Всички направления</option>
                    {uniqueTypes.map((t) => (
                      <option key={t} value={t}>
                        {INQUIRY_TYPE_LABELS[t] ?? t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status filter pills (mobile friendly) + Delete actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'new', 'read', 'replied', 'archived'] as FilterStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterStatus(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          filterStatus === st
                            ? 'bg-navy-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' ? 'Всички' : STATUS_LABEL[st]}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {stats.archived > 0 && (
                      <button
                        type="button"
                        onClick={requestDeleteArchived}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        Изтрий архивирани ({stats.archived})
                      </button>
                    )}
                    {inquiries.length > 0 && (
                      <button
                        type="button"
                        onClick={requestDeleteAllInquiries}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        Изтрий всички ({inquiries.length})
                      </button>
                    )}
                    {inquiries.length === 0 && (
                      <button
                        type="button"
                        onClick={handleRestoreDemoInquiries}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        Зареди примерни запитвания
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bulk Selection Bar */}
              {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-blue-900">
                    Избрани: {selectedIds.length}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkStatus('read')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Маркирай прочетени
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkStatus('archived')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Архивирай
                    </button>
                    <button
                      type="button"
                      onClick={requestDeleteSelected}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                    >
                      Изтрий избраните ({selectedIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Изчисти
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state / List */}
              {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-semibold text-navy-900 mb-1">Няма намерени запитвания</p>
                  <p className="text-sm text-slate-500 mb-4">
                    {inquiries.length === 0
                      ? 'Всички запитвания са изтрити. Новите заявки от формата за контакт ще се появят тук.'
                      : 'Опитайте с различен филтър или ключова дума.'}
                  </p>
                  {inquiries.length === 0 && (
                    <button
                      type="button"
                      onClick={handleRestoreDemoInquiries}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Зареди примерни запитвания
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table (>= lg) */}
                  <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="w-10 px-4 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={allFilteredSelected}
                                onChange={toggleSelectAllFiltered}
                                aria-label="Избери всички видими запитвания"
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                              Клиент
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                              Направление / Продукт
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                              Дата
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                              Статус
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filtered.map((inq) => {
                            const preLabel = formatPreselect(inq.productPreselect);
                            const isSelected = selectedIds.includes(inq.id);
                            return (
                              <tr
                                key={inq.id}
                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                                onClick={() => {
                                  if (inq.status === 'new') handleStatusChange(inq.id, 'read');
                                  setDetailInquiry(inq.status === 'new' ? { ...inq, status: 'read' } : inq);
                                }}
                              >
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectOne(inq.id)}
                                    aria-label={`Избери ${inq.name}`}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-3 min-w-0">
                                  <div className={`text-navy-900 ${inq.status === 'new' ? 'font-bold' : 'font-medium'}`}>
                                    {inq.name}
                                  </div>
                                  <div className="text-slate-500 text-xs">{inq.email}</div>
                                  {inq.company && <div className="text-slate-400 text-xs">{inq.company}</div>}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                  <div>{INQUIRY_TYPE_LABELS[inq.inquiryType] ?? inq.inquiryType}</div>
                                  {preLabel && (
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                                      {preLabel}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                                  {formatDate(inq.createdAt)}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${STATUS_COLOR[inq.status]}`}>
                                    {STATUS_LABEL[inq.status]}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    <a
                                      href={`mailto:${inq.email}`}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                      title="Отговори по имейл"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => requestDeleteSingle(inq)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                      title="Изтрий"
                                      aria-label={`Изтрий запитването от ${inq.name}`}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile & Tablet Cards (< lg) */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600"
                        />
                        <span>Избери всички ({filtered.length})</span>
                      </label>
                    </div>

                    {filtered.map((inq) => {
                      const preLabel = formatPreselect(inq.productPreselect);
                      const isSelected = selectedIds.includes(inq.id);
                      return (
                        <div
                          key={inq.id}
                          className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${
                            isSelected ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300'
                          }`}
                          onClick={() => {
                            if (inq.status === 'new') handleStatusChange(inq.id, 'read');
                            setDetailInquiry(inq.status === 'new' ? { ...inq, status: 'read' } : inq);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(inq.id)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Избери ${inq.name}`}
                                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className={`text-navy-900 break-words ${inq.status === 'new' ? 'font-bold' : 'font-semibold'}`}>
                                  {inq.name}
                                </div>
                                <div className="text-xs text-slate-500 break-all">{inq.email}</div>
                                {inq.company && <div className="text-xs text-slate-400 truncate">{inq.company}</div>}
                              </div>
                            </div>
                            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${STATUS_COLOR[inq.status]}`}>
                              {STATUS_LABEL[inq.status]}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                              {INQUIRY_TYPE_LABELS[inq.inquiryType] ?? inq.inquiryType}
                            </span>
                            {preLabel && (
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                                {preLabel}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-600 line-clamp-2 mb-3 break-words">{inq.message}</p>

                          <div
                            className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs text-slate-400">{formatDate(inq.createdAt)}</span>
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:${inq.email}`}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                Имейл
                              </a>
                              <button
                                type="button"
                                onClick={() => requestDeleteSingle(inq)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                Изтрий
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════ TAB 2: MENUS & SECTIONS ══════════════════ */}
          {activeTab === 'menus' && (
            <div className="space-y-5">
              {/* Top Bulk Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-heading font-bold text-navy-900">Видимост на менюта и секции</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-0">
                    Скривайте или показвайте линкове, направления и секции в реално време.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      siteControlStore.restoreAllNav();
                      siteControlStore.restoreAllDivisions();
                      siteControlStore.restoreAllSections();
                      showToast('Всички менюта и секции са видими.');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Покажи всички
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'Скриване на всички незадължителни менюта',
                        message:
                          'В навигацията ще остане единствено „Начало“. Можете да ги върнете по всяко време.',
                        confirmLabel: 'Скрий менютата',
                        variant: 'danger',
                        onConfirm: () => {
                          siteControlStore.hideAllOptionalNav();
                          setConfirmDialog(null);
                          showToast('Всички допълнителни менюта са скрити.');
                        },
                      })
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    Скрий всички менюта
                  </button>
                </div>
              </div>

              {/* Nav items by group */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-heading font-bold text-navy-900">
                    Навигационни менюта (Хедър и Футър)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Скрити: {siteControl.hiddenNavHrefs.length}
                  </span>
                </div>

                {NAV_GROUPS.map((group) => {
                  const items = MANAGEABLE_NAV_ITEMS.filter((i) => i.group === group);
                  return (
                    <div key={group} className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {group}
                      </div>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {items.map((item) => {
                          const isHidden = siteControl.hiddenNavHrefs.includes(item.href);
                          return (
                            <div
                              key={item.href}
                              className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 bg-white"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-navy-900">{item.label}</div>
                                <div className="text-xs text-slate-400 font-mono truncate">{item.href}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    item.locked
                                      ? 'bg-blue-50 text-blue-700'
                                      : isHidden
                                        ? 'bg-slate-100 text-slate-500'
                                        : 'bg-green-50 text-green-700'
                                  }`}
                                >
                                  {item.locked ? 'Основна' : isHidden ? 'Скрито' : 'Видимо'}
                                </span>
                                {!item.locked && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      siteControlStore.toggleNavHref(item.href);
                                      showToast(
                                        isHidden
                                          ? `„${item.label}“ вече е видимо в менюто.`
                                          : `„${item.label}“ беше скрито от менюто.`
                                      );
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                      isHidden
                                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                    }`}
                                  >
                                    {isHidden ? 'Покажи' : 'Скрий'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divisions visibility */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-heading font-bold text-navy-900">Направления на началната страница</h3>
                    <p className="text-xs text-slate-500 mt-0.5 mb-0">Контрол върху 4-те основни направления.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        siteControlStore.restoreAllDivisions();
                        showToast('Всички направления са видими.');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      Покажи всички
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        siteControlStore.hideAllDivisions();
                        showToast('Всички направления са скрити.');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100"
                    >
                      Скрий всички
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {brandConfig.divisions.map((div) => {
                    const isHidden = siteControl.hiddenDivisionIds.includes(div.id);
                    return (
                      <div key={div.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-navy-900">{div.label}</div>
                          <div className="text-xs text-slate-500 truncate">{div.description}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => siteControlStore.toggleDivision(div.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
                            isHidden
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          }`}
                        >
                          {isHidden ? 'Покажи' : 'Скрий'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Home Sections visibility */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-heading font-bold text-navy-900">Секции на началната страница</h3>
                    <p className="text-xs text-slate-500 mt-0.5 mb-0">Скривайте или включвайте цели секции от началната страница.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        siteControlStore.restoreAllSections();
                        showToast('Всички секции са показани.');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      Покажи всички
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        siteControlStore.hideAllSections();
                        showToast('Всички секции на началната са скрити.');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100"
                    >
                      Скрий всички
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {HOME_SECTION_LABELS.map((sec) => {
                    const isHidden = siteControl.hiddenSections.includes(sec.key);
                    return (
                      <div key={sec.key} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-navy-900">{sec.label}</div>
                          <div className="text-xs text-slate-500">{sec.description}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => siteControlStore.toggleSection(sec.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
                            isHidden
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          }`}
                        >
                          {isHidden ? 'Покажи' : 'Скрий'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 3: PORTFOLIO ══════════════════ */}
          {activeTab === 'portfolio' && (
            <div className="space-y-5">
              {/* Top actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-heading font-bold text-navy-900">Проекти в портфолиото</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-0">
                    Добавяйте нови проекти, скривайте временни или изтрийте всички.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddProject((prev) => !prev)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {showAddProject ? 'Откажи добавянето' : '+ Добави проект'}
                  </button>
                  {siteControl.projects.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDialog({
                          title: 'Изтриване на всички проекти',
                          message: `Сигурни ли сте, че искате да изтриете всички ${siteControl.projects.length} проекта от портфолиото?`,
                          confirmLabel: 'Изтрий всички',
                          variant: 'danger',
                          onConfirm: () => {
                            siteControlStore.deleteAllProjects();
                            setConfirmDialog(null);
                            showToast('Всички проекти бяха изтрити.');
                          },
                        })
                      }
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      Изтрий всички
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'Възстановяване на началните проекти',
                        message: 'Текущият списък ще бъде заменен със стандартните проекти на TideLayer.',
                        confirmLabel: 'Възстанови',
                        variant: 'primary',
                        onConfirm: () => {
                          siteControlStore.restoreDefaultProjects();
                          setConfirmDialog(null);
                          showToast('Началните проекти бяха възстановени.');
                        },
                      })
                    }
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Възстанови началните
                  </button>
                </div>
              </div>

              {/* Add Project Form */}
              {showAddProject && (
                <form
                  onSubmit={handleAddProject}
                  className="bg-white rounded-xl border border-blue-200 p-4 sm:p-5 space-y-4 shadow-xs"
                >
                  <h3 className="text-base font-heading font-bold text-navy-900">Нов проект</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Заглавие *</label>
                      <input
                        type="text"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="напр. Корпоративен сайт..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Категория</label>
                      <select
                        value={projCategory}
                        onChange={(e) => setProjCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      >
                        <option value="Уеб решения">Уеб решения</option>
                        <option value="Уеб приложения">Уеб приложения</option>
                        <option value="Училищен софтуер">Училищен софтуер</option>
                        <option value="Мрежи и ИТ">Мрежи и ИТ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Изображение</label>
                      <select
                        value={projImage}
                        onChange={(e) => setProjImage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      >
                        {PROJECT_IMAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">URL (по избор)</label>
                      <input
                        type="url"
                        value={projUrl}
                        onChange={(e) => setProjUrl(e.target.value)}
                        placeholder="https://example.bg"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Тагове (разделени със запетая)</label>
                    <input
                      type="text"
                      value={projTags}
                      onChange={(e) => setProjTags(e.target.value)}
                      placeholder="React, Дизайн, SEO"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Описание *</label>
                    <textarea
                      rows={3}
                      value={projDescription}
                      onChange={(e) => setProjDescription(e.target.value)}
                      placeholder="Кратко описание на проекта..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      required
                    />
                  </div>
                  {projError && <p className="text-xs text-red-600 mb-0">{projError}</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProject(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50"
                    >
                      Отказ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Запази проекта
                    </button>
                  </div>
                </form>
              )}

              {/* Projects List */}
              {siteControl.projects.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
                  <p className="font-semibold text-navy-900 mb-1">Няма проекти в портфолиото</p>
                  <p className="text-sm text-slate-500 mb-4">Можете да добавите нов проект или да възстановите началните.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProject(true)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                    >
                      + Добави проект
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        siteControlStore.restoreDefaultProjects();
                        showToast('Началните проекти са възстановени.');
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
                    >
                      Възстанови началните
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteControl.projects.map((proj) => {
                    const isHidden = siteControl.hiddenProjectIds.includes(proj.id);
                    return (
                      <div
                        key={proj.id}
                        className={`bg-white rounded-xl border p-4 flex flex-col gap-3 ${
                          isHidden ? 'border-slate-200 opacity-75' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {proj.image && (
                            <img
                              src={proj.image}
                              alt={proj.title}
                              className="w-16 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold">
                                {proj.category}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  isHidden ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-700'
                                }`}
                              >
                                {isHidden ? 'Скрит' : 'Видим'}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-navy-900 break-words">{proj.title}</h4>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-0">{proj.description}</p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-auto">
                          <div className="flex flex-wrap gap-1">
                            {proj.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                siteControlStore.toggleProjectVisibility(proj.id);
                                showToast(
                                  isHidden ? `„${proj.title}“ вече е видим.` : `„${proj.title}“ е скрит.`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
                            >
                              {isHidden ? 'Покажи' : 'Скрий'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDialog({
                                  title: 'Изтриване на проект',
                                  message: `Сигурни ли сте, че искате да изтриете проекта „${proj.title}“?`,
                                  confirmLabel: 'Изтрий',
                                  variant: 'danger',
                                  onConfirm: () => {
                                    siteControlStore.deleteProject(proj.id);
                                    setConfirmDialog(null);
                                    showToast('Проектът беше изтрит.');
                                  },
                                })
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100"
                            >
                              Изтрий
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ TAB 4: SETTINGS, FAQ & DANGER ZONE ══════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Contact Information */}
              <form onSubmit={handleSaveContactInfo} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
                <div>
                  <h2 className="text-base font-heading font-bold text-navy-900">Контактна информация на сайта</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-0">
                    Промените се отразяват в Контакти, Футъра, Мобилното меню и правните страници.
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Имейл адрес</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) =>
                        setContactDraft({
                          email: e.target.value,
                          phone: contactPhone,
                          addressFull: contactAddress,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Телефон</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) =>
                        setContactDraft({
                          email: contactEmail,
                          phone: e.target.value,
                          addressFull: contactAddress,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Град / Адрес</label>
                    <input
                      type="text"
                      value={contactAddress}
                      onChange={(e) =>
                        setContactDraft({
                          email: contactEmail,
                          phone: contactPhone,
                          addressFull: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Запази промените
                  </button>
                </div>
              </form>

              {/* FAQ Manager */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-heading font-bold text-navy-900">
                      Често задавани въпроси ({siteControl.faqs.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 mb-0">
                      Добавяйте нови или изтривайте ненужните въпроси.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFaq((prev) => !prev)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {showAddFaq ? 'Затвори' : '+ Добави ЧЗВ'}
                    </button>
                    {siteControl.faqs.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDialog({
                            title: 'Изтриване на всички ЧЗВ',
                            message: `Сигурни ли сте, че искате да изтриете всички ${siteControl.faqs.length} често задавани въпроса?`,
                            confirmLabel: 'Изтрий всички',
                            variant: 'danger',
                            onConfirm: () => {
                              siteControlStore.deleteAllFaqs();
                              setConfirmDialog(null);
                              showToast('Всички ЧЗВ бяха изтрити.');
                            },
                          })
                        }
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
                      >
                        Изтрий всички ЧЗВ
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        siteControlStore.restoreDefaultFaqs();
                        showToast('Началните ЧЗВ бяха възстановени.');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
                    >
                      Възстанови ЧЗВ
                    </button>
                  </div>
                </div>

                {showAddFaq && (
                  <form onSubmit={handleAddFaq} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Въпрос *</label>
                      <input
                        type="text"
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        placeholder="напр. Какви са сроковете за поддръжка?"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Отговор *</label>
                      <textarea
                        rows={3}
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        placeholder="Отговор..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                        required
                      />
                    </div>
                    {faqError && <p className="text-xs text-red-600 mb-0">{faqError}</p>}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddFaq(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 bg-white"
                      >
                        Отказ
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Добави
                      </button>
                    </div>
                  </form>
                )}

                {siteControl.faqs.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                    Няма активни често задавани въпроси.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {siteControl.faqs.map((faq) => (
                      <div key={faq.id} className="p-3.5 sm:px-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-navy-900">{faq.question}</div>
                          <div className="text-xs text-slate-600 mt-1 line-clamp-2">{faq.answer}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDialog({
                              title: 'Изтриване на въпрос',
                              message: `Сигурни ли сте, че искате да изтриете „${faq.question}“?`,
                              confirmLabel: 'Изтрий',
                              variant: 'danger',
                              onConfirm: () => {
                                siteControlStore.deleteFaq(faq.id);
                                setConfirmDialog(null);
                                showToast('Въпросът беше изтрит.');
                              },
                            })
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 shrink-0"
                        >
                          Изтрий
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger Zone: Delete Everything */}
              <div className="bg-red-50/70 rounded-xl border border-red-200 p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="text-base font-heading font-bold text-red-800">
                    Зона за пълно изчистване на сайта
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700/90 mt-0.5 mb-0">
                    Бързи действия за изтриване на всички елементи или връщане на началния вид.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={requestDeleteAllInquiries}
                    disabled={inquiries.length === 0}
                    className="p-3 rounded-xl bg-white border border-red-200 text-left hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <div className="text-sm font-semibold text-red-700">Изтрий всички запитвания</div>
                    <div className="text-xs text-slate-500 mt-0.5">Текущо: {inquiries.length} записа</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'Изтриване на всички проекти',
                        message: 'Портфолиото ще стане празно, докато не добавите или възстановите проекти.',
                        confirmLabel: 'Изтрий проектите',
                        variant: 'danger',
                        onConfirm: () => {
                          siteControlStore.deleteAllProjects();
                          setConfirmDialog(null);
                          showToast('Всички проекти бяха изтрити.');
                        },
                      })
                    }
                    className="p-3 rounded-xl bg-white border border-red-200 text-left hover:bg-red-50 transition-colors"
                  >
                    <div className="text-sm font-semibold text-red-700">Изтрий всички проекти</div>
                    <div className="text-xs text-slate-500 mt-0.5">Текущо: {siteControl.projects.length} проекта</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'Изтриване на всички ЧЗВ',
                        message: 'Всички въпроси ще бъдат изтрити от страниците.',
                        confirmLabel: 'Изтрий ЧЗВ',
                        variant: 'danger',
                        onConfirm: () => {
                          siteControlStore.deleteAllFaqs();
                          setConfirmDialog(null);
                          showToast('Всички ЧЗВ бяха изтрити.');
                        },
                      })
                    }
                    className="p-3 rounded-xl bg-white border border-red-200 text-left hover:bg-red-50 transition-colors"
                  >
                    <div className="text-sm font-semibold text-red-700">Изтрий всички ЧЗВ</div>
                    <div className="text-xs text-slate-500 mt-0.5">Текущо: {siteControl.faqs.length} въпроса</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'Скриване на менюта и секции',
                        message: 'Ще скрие всички допълнителни менюта, направления и секции на началната страница.',
                        confirmLabel: 'Скрий всичко',
                        variant: 'danger',
                        onConfirm: () => {
                          siteControlStore.hideAllOptionalNav();
                          siteControlStore.hideAllDivisions();
                          siteControlStore.hideAllSections();
                          setConfirmDialog(null);
                          showToast('Всички менюта и секции бяха скрити.');
                        },
                      })
                    }
                    className="p-3 rounded-xl bg-white border border-red-200 text-left hover:bg-red-50 transition-colors"
                  >
                    <div className="text-sm font-semibold text-red-700">Скрий всички менюта и секции</div>
                    <div className="text-xs text-slate-500 mt-0.5">Оставя само Начало</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'Изчистване на ЦЯЛОТО съдържание',
                        message:
                          'Това ще изтрие всички запитвания, проекти и ЧЗВ и ще скрие всички незадължителни менюта и секции, за да започнете на чисто.',
                        confirmLabel: 'Изчисти всичко',
                        variant: 'danger',
                        onConfirm: () => {
                          siteControlStore.clearAllSiteContent();
                          inquiryStore.deleteAll();
                          setSelectedIds([]);
                          setDetailInquiry(null);
                          refreshInquiries();
                          setConfirmDialog(null);
                          showToast('Цялото съдържание на сайта беше изчистено.');
                        },
                      })
                    }
                    className="p-3 rounded-xl bg-red-600 text-white text-left hover:bg-red-700 transition-colors"
                  >
                    <div className="text-sm font-bold">Изчисти всичко от сайта</div>
                    <div className="text-xs text-red-100 mt-0.5">Запитвания + Проекти + ЧЗВ + Менюта</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'Възстановяване на фабричните настройки',
                        message:
                          'Ще възстанови всички менюта, секции, проекти, ЧЗВ, контакти и примерните запитвания в началния им вид.',
                        confirmLabel: 'Възстанови всичко',
                        variant: 'primary',
                        onConfirm: () => {
                          siteControlStore.resetAllToDefaults();
                          inquiryStore.restoreDemo();
                          setContactDraft(null);
                          setSelectedIds([]);
                          setDetailInquiry(null);
                          refreshInquiries();
                          setConfirmDialog(null);
                          showToast('Всички настройки и съдържание са възстановени.');
                        },
                      })
                    }
                    className="p-3 rounded-xl bg-blue-600 text-white text-left hover:bg-blue-700 transition-colors"
                  >
                    <div className="text-sm font-bold">Възстанови началния вид</div>
                    <div className="text-xs text-blue-100 mt-0.5">Връща всички менюта, секции и демо данни</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Inquiry Detail Modal */}
      {detailInquiry && (
        <InquiryModal
          inquiry={detailInquiry}
          onClose={() => setDetailInquiry(null)}
          onStatusChange={handleStatusChange}
          onRequestDelete={requestDeleteSingle}
        />
      )}

      {/* Confirmation Modal */}
      {confirmDialog && (
        <ConfirmModal
          {...confirmDialog}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

// ─── Sidebar item helper ─────────────────────────────────────────────────────

function SidebarItem({
  icon,
  label,
  count,
  active,
  onClick,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-white/15 text-white'
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <span className="flex items-center justify-center w-5 shrink-0">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
            highlight ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-200'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

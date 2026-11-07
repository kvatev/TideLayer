import { useState, useCallback } from 'react';
import { inquiryStore, type Inquiry, type InquiryStatus } from '../../data/inquiries';
import { adminAuth } from '../../data/adminAuth';
import { brandConfig } from '../../config/brand';

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: 'Ново',
  read: 'Прочетено',
  replied: 'Отговорено',
  archived: 'Архивирано',
};

const STATUS_COLOR: Record<InquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  read: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  replied: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  'website-development': 'Уеб разработка',
  'web-applications': 'Уеб приложения',
  'website-maintenance': 'Поддръжка на уебсайт',
  'network-installation': 'Изграждане на мрежи',
  'wifi-lan': 'Wi-Fi и LAN',
  'servers-nas': 'Сървъри и NAS',
  'monthly-support': 'Месечна ИТ поддръжка',
  'hardware-service': 'Хардуерен сервиз',
  'duty-scheduler': 'График на дежурства',
  'school-ticketing': 'Система за заявки',
  'school-inventory': 'Инвентарна система',
  'school-it-support': 'ИТ поддръжка за училища',
  other: 'Друго',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
      <span className="text-2xl font-bold font-heading">{value}</span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </div>
  );
}

// ─── Inquiry Detail Modal ────────────────────────────────────────────────────

function InquiryModal({
  inquiry,
  onClose,
  onStatusChange,
  onDelete,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusChange: (id: string, status: InquiryStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-heading font-bold text-navy-900">{inquiry.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{formatDate(inquiry.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Затвори"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status + Type */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_COLOR[inquiry.status]}`}>
              {STATUS_LABEL[inquiry.status]}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-600">
              {INQUIRY_TYPE_LABELS[inquiry.inquiryType] ?? inquiry.inquiryType}
            </span>
          </div>

          {/* Contact info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Имейл</p>
              <a href={`mailto:${inquiry.email}`} className="text-sm text-blue-600 hover:underline font-medium">
                {inquiry.email}
              </a>
            </div>
            {inquiry.phone && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Телефон</p>
                <a href={`tel:${inquiry.phone}`} className="text-sm text-blue-600 hover:underline font-medium">
                  {inquiry.phone}
                </a>
              </div>
            )}
            {inquiry.company && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Компания / Организация</p>
                <p className="text-sm text-slate-700 font-medium">{inquiry.company}</p>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Съобщение</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100">
              {inquiry.message}
            </p>
          </div>

          {/* Change status */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Промени статус</p>
            <div className="flex flex-wrap gap-2">
              {(['new', 'read', 'replied', 'archived'] as InquiryStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(inquiry.id, s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    inquiry.status === s
                      ? STATUS_COLOR[s] + ' ring-2 ring-offset-1 ring-current'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={() => { onDelete(inquiry.id); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            Изтрий запитването
          </button>
          <div className="flex gap-3">
            <a
              href={`mailto:${inquiry.email}?subject=Запитване - ${INQUIRY_TYPE_LABELS[inquiry.inquiryType] ?? inquiry.inquiryType}`}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Отговори по имейл
            </a>
            <button
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

type FilterStatus = 'all' | InquiryStatus;

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const session = adminAuth.getSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => inquiryStore.getAll());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refresh = useCallback(() => setInquiries(inquiryStore.getAll()), []);
  const stats = inquiryStore.getStats();

  const handleStatusChange = (id: string, status: InquiryStatus) => {
    inquiryStore.updateStatus(id, status);
    // Also update selected if it's the same
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Изтриване на запитването?')) return;
    inquiryStore.delete(id);
    refresh();
  };

  const handleLogout = () => {
    adminAuth.logout();
    onLogout();
  };

  // Filter logic
  const filtered = inquiries.filter((inq) => {
    if (filterStatus !== 'all' && inq.status !== filterStatus) return false;
    if (filterType !== 'all' && inq.inquiryType !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        (inq.company ?? '').toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Unique inquiry types in current data for the filter dropdown
  const uniqueTypes = Array.from(new Set(inquiries.map((i) => i.inquiryType)));

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 text-white flex flex-col transition-transform duration-200
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img src="/images/logo/icon.webp" alt="Logo" className="h-8 w-auto object-contain" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight truncate">{brandConfig.name}</p>
            <p className="text-xs text-slate-400 leading-tight">Администрация</p>
          </div>
          {/* Close on mobile */}
          <button
            className="md:hidden p-1 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Затвори менюто"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          <div className="px-2 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Навигация</div>

          <SidebarItem
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            }
            label="Всички запитвания"
            count={stats.total}
            active={filterStatus === 'all'}
            onClick={() => { setFilterStatus('all'); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<span className="w-2 h-2 rounded-full bg-blue-400 mx-1" />}
            label="Нови"
            count={stats.new}
            active={filterStatus === 'new'}
            onClick={() => { setFilterStatus('new'); setSidebarOpen(false); }}
            highlight={stats.new > 0}
          />
          <SidebarItem
            icon={<span className="w-2 h-2 rounded-full bg-yellow-400 mx-1" />}
            label="Прочетени"
            count={stats.read}
            active={filterStatus === 'read'}
            onClick={() => { setFilterStatus('read'); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<span className="w-2 h-2 rounded-full bg-green-400 mx-1" />}
            label="Отговорени"
            count={stats.replied}
            active={filterStatus === 'replied'}
            onClick={() => { setFilterStatus('replied'); setSidebarOpen(false); }}
          />
          <SidebarItem
            icon={<span className="w-2 h-2 rounded-full bg-slate-400 mx-1" />}
            label="Архивирани"
            count={stats.archived}
            active={filterStatus === 'archived'}
            onClick={() => { setFilterStatus('archived'); setSidebarOpen(false); }}
          />
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {(session?.username ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{session?.username ?? 'admin'}</p>
              <p className="text-xs text-slate-400">Администратор</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Изход
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Отвори менюто"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-heading font-bold text-navy-900">Запитвания от клиенти</h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {filtered.length} записа {filterStatus !== 'all' ? `· филтър: ${STATUS_LABEL[filterStatus as InquiryStatus]}` : ''}
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Сайт
          </a>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Всички" value={stats.total} color="bg-white border-slate-200 text-navy-900" />
            <StatCard label="Нови" value={stats.new} color="bg-blue-50 border-blue-200 text-blue-800" />
            <StatCard label="Отговорени" value={stats.replied} color="bg-green-50 border-green-200 text-green-800" />
            <StatCard label="Архивирани" value={stats.archived} color="bg-slate-50 border-slate-200 text-slate-700" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Търси по име, имейл, съобщение…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            >
              <option value="all">Всички типове</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>{INQUIRY_TYPE_LABELS[t] ?? t}</option>
              ))}
            </select>
          </div>

          {/* Table / Cards */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="font-medium">Няма намерени запитвания</p>
              <p className="text-sm mt-1">Опитайте с различен филтър или търсене</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Клиент</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Тип запитване</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Дата</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Статус</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((inq) => (
                      <tr
                        key={inq.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => { handleStatusChange(inq.id, inq.status === 'new' ? 'read' : inq.status); setSelected(inq); }}
                      >
                        <td className="px-4 py-3">
                          <p className={`font-medium text-navy-900 ${inq.status === 'new' ? 'font-bold' : ''}`}>{inq.name}</p>
                          <p className="text-slate-500 text-xs">{inq.email}</p>
                          {inq.company && <p className="text-slate-400 text-xs">{inq.company}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {INQUIRY_TYPE_LABELS[inq.inquiryType] ?? inq.inquiryType}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {formatDate(inq.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${STATUS_COLOR[inq.status]}`}>
                            {STATUS_LABEL[inq.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`mailto:${inq.email}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Отговори"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </a>
                            <button
                              onClick={() => handleDelete(inq.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Изтрий"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filtered.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => { handleStatusChange(inq.id, inq.status === 'new' ? 'read' : inq.status); setSelected(inq); }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className={`font-semibold text-navy-900 ${inq.status === 'new' ? 'font-bold' : ''}`}>{inq.name}</p>
                        <p className="text-xs text-slate-500">{inq.email}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${STATUS_COLOR[inq.status]}`}>
                        {STATUS_LABEL[inq.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{INQUIRY_TYPE_LABELS[inq.inquiryType] ?? inq.inquiryType}</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{inq.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDate(inq.createdAt)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Detail modal */}
      {selected && (
        <InquiryModal
          inquiry={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
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
  count: number;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-white/15 text-white'
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <span className="flex items-center justify-center w-5">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${highlight ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300'}`}>
        {count}
      </span>
    </button>
  );
}

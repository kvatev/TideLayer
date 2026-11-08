import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ALL_MODULE_KEYS,
  MODULE_META,
  ROLE_LABELS,
  computeAllLicenseAlerts,
  computeLicenseInfo,
  createSchoolInstance,
  createSchoolUser,
  deleteSchoolInstance,
  deleteSchoolUser,
  slugifySchoolName,
  updateSchoolInstance,
  updateSchoolLicensePeriod,
  updateSchoolUser,
  type LicenseAlert,
  type SchoolBundle,
  type SchoolModuleKey,
  type SchoolUserRole,
} from '../../lib/supabase';

interface SchoolSaasBannerProps {
  bundles: SchoolBundle[];
  onQuickRenew: (schoolId: string, moduleKey: SchoolModuleKey) => Promise<void>;
  onOpenAlertsTab: () => void;
}

export function LicenseAlertTopBanner({
  bundles,
  onQuickRenew,
  onOpenAlertsTab,
}: SchoolSaasBannerProps) {
  const alerts = computeAllLicenseAlerts(bundles);
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert) => {
        const formattedDate = new Date(alert.expiresAt).toLocaleDateString('bg-BG');
        if (alert.type === 'expired') {
          return (
            <div
              key={alert.id}
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-red-900 shadow-2xs"
            >
              <div className="font-medium leading-snug">
                ⚠️ Изтекъл лиценз: <strong>{alert.schoolName}</strong> - Модул{' '}
                <strong>{alert.moduleName}</strong> е изтекъл на{' '}
                <strong>{formattedDate}</strong>!
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void onQuickRenew(alert.schoolId, alert.moduleKey)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Поднови (+1 г.)
                </button>
                <button
                  type="button"
                  onClick={onOpenAlertsTab}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Детайли
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={alert.id}
            className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-2xs"
          >
            <div className="font-medium leading-snug">
              ⏳ Предстоящо изтичане: На <strong>{alert.schoolName}</strong> му остават{' '}
              <strong>{alert.daysRemaining}</strong> дни за модул{' '}
              <strong>{alert.moduleName}</strong> (до {formattedDate})
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void onQuickRenew(alert.schoolId, alert.moduleKey)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-navy-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                Поднови (+1 г.)
              </button>
              <button
                type="button"
                onClick={onOpenAlertsTab}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Всички известия
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SchoolsAndLicensesTabProps {
  bundles: SchoolBundle[];
  usingFallback: boolean;
  fallbackMessage: string | null;
  onRefresh: () => Promise<void>;
  showToast: (msg: string) => void;
}

export function SchoolsAndLicensesTab({
  bundles,
  usingFallback,
  fallbackMessage,
  onRefresh,
  showToast,
}: SchoolsAndLicensesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);

  // Create / Edit School Form State
  const [schoolName, setSchoolName] = useState('');
  const [schoolSlug, setSchoolSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [city, setCity] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [savingSchool, setSavingSchool] = useState(false);

  // Custom date picker state per (schoolId + moduleKey)
  const [openDatePickerKey, setOpenDatePickerKey] = useState<string | null>(null);
  const [customDateValue, setCustomDateValue] = useState('');

  // Expanded User Management per schoolId
  const [expandedUsersSchoolId, setExpandedUsersSchoolId] = useState<string | null>(
    bundles[0]?.school.id || null
  );

  // Add User Form State
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPin, setUserPin] = useState('');
  const [userRole, setUserRole] = useState<SchoolUserRole>('school_admin');
  const [userModules, setUserModules] = useState<SchoolModuleKey[]>([
    'duty',
    'tickets',
    'inventory',
  ]);

  // Edit User State & Form
  const [editingUser, setEditingUser] = useState<SchoolBundle['users'][0] | null>(null);
  const [editUserFullName, setEditUserFullName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserPin, setEditUserPin] = useState('');
  const [editUserRole, setEditUserRole] = useState<SchoolUserRole>('staff');
  const [editUserModules, setEditUserModules] = useState<SchoolModuleKey[]>([
    'duty',
    'tickets',
    'inventory',
  ]);
  const [savingUser, setSavingUser] = useState(false);

  // Change password inline state
  const [changingPassUserId, setChangingPassUserId] = useState<string | null>(null);
  const [newPassValue, setNewPassValue] = useState('');

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://tide-layer.vercel.app';

  const openEditUser = (u: SchoolBundle['users'][0]) => {
    setEditingUser(u);
    setEditUserFullName(u.full_name);
    setEditUserEmail(u.email);
    setEditUserPassword(u.password_hash);
    setEditUserPin(u.pin_code || '');
    setEditUserRole(u.role);
    setEditUserModules(u.allowed_modules && u.allowed_modules.length > 0 ? u.allowed_modules : ALL_MODULE_KEYS);
  };

  const handleToggleEditUserModule = (modKey: SchoolModuleKey) => {
    setEditUserModules((prev) =>
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    );
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editUserFullName.trim() || !editUserEmail.trim() || !editUserPassword.trim()) return;
    setSavingUser(true);
    try {
      await updateSchoolUser(editingUser.id, {
        full_name: editUserFullName.trim(),
        email: editUserEmail.trim(),
        password_hash: editUserPassword.trim(),
        pin_code: editUserPin.trim() || null,
        role: editUserRole,
        allowed_modules: editUserModules.length > 0 ? editUserModules : ALL_MODULE_KEYS,
      });
      setEditingUser(null);
      await onRefresh();
      showToast('Данните за потребителя бяха обновени.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Грешка при обновяване на потребител.');
    } finally {
      setSavingUser(false);
    }
  };

  const resetSchoolForm = () => {
    setSchoolName('');
    setSchoolSlug('');
    setSlugManuallyEdited(false);
    setCity('');
    setLogoUrl('');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setNotes('');
    setEditingSchoolId(null);
  };

  const openCreateSchool = () => {
    resetSchoolForm();
    setShowCreateModal(true);
  };

  const openEditSchool = (b: SchoolBundle) => {
    setEditingSchoolId(b.school.id);
    setSchoolName(b.school.name);
    setSchoolSlug(b.school.slug);
    setSlugManuallyEdited(true);
    setCity(b.school.city || '');
    setLogoUrl(b.school.logo_url || '');
    setContactPerson(b.school.contact_person || '');
    setContactPhone(b.school.contact_phone || '');
    setContactEmail(b.school.contact_email || '');
    setNotes(b.school.notes || '');
    setShowCreateModal(true);
  };

  const handleSchoolNameChange = (val: string) => {
    setSchoolName(val);
    if (!slugManuallyEdited) {
      setSchoolSlug(slugifySchoolName(val));
    }
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;
    setSavingSchool(true);

    try {
      const finalSlug = (schoolSlug.trim() || slugifySchoolName(schoolName)).toLowerCase();
      if (editingSchoolId) {
        await updateSchoolInstance(editingSchoolId, {
          name: schoolName.trim(),
          slug: finalSlug,
          city: city.trim() || null,
          logo_url: logoUrl.trim() || null,
          contact_person: contactPerson.trim() || null,
          contact_phone: contactPhone.trim() || null,
          contact_email: contactEmail.trim() || null,
          notes: notes.trim() || null,
        });
        showToast('Профилът на училището беше обновен.');
      } else {
        const { school } = await createSchoolInstance({
          name: schoolName,
          slug: finalSlug,
          city,
          logo_url: logoUrl,
          contact_person: contactPerson,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          notes,
        });
        setExpandedUsersSchoolId(school.id);
        showToast(`Училище „${school.name}“ беше създадено с 3 лицензионни слота.`);
      }
      setShowCreateModal(false);
      resetSchoolForm();
      await onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Грешка при запис на училище.');
    } finally {
      setSavingSchool(false);
    }
  };

  const handleCopyPortalLink = async (slug: string) => {
    const url = `${origin}/school/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(`Копиран линк: ${url}`);
    } catch {
      showToast(url);
    }
  };

  const handleSetLicensePeriod = async (
    schoolId: string,
    moduleKey: SchoolModuleKey,
    period: '6_months' | '1_year' | '2_years' | 'stop'
  ) => {
    await updateSchoolLicensePeriod(schoolId, moduleKey, { type: period });
    await onRefresh();
    const modName = MODULE_META[moduleKey].name;
    if (period === 'stop') {
      showToast(`Достъпът до „${modName}“ беше спрян.`);
    } else {
      const label =
        period === '6_months' ? '+6 месеца' : period === '1_year' ? '+1 година' : '+2 години';
      showToast(`Лицензът за „${modName}“ е активиран (${label}).`);
    }
  };

  const handleApplyCustomDate = async (schoolId: string, moduleKey: SchoolModuleKey) => {
    if (!customDateValue) return;
    await updateSchoolLicensePeriod(schoolId, moduleKey, {
      type: 'custom',
      expiresAtIso: customDateValue,
    });
    setOpenDatePickerKey(null);
    setCustomDateValue('');
    await onRefresh();
    showToast(`Зададена е крайна дата за „${MODULE_META[moduleKey].name}“.`);
  };

  const handleToggleUserModule = (modKey: SchoolModuleKey) => {
    setUserModules((prev) =>
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    );
  };

  const handleCreateUser = async (e: React.FormEvent, schoolId: string) => {
    e.preventDefault();
    if (!userFullName.trim() || !userEmail.trim() || !userPassword.trim()) return;
    try {
      await createSchoolUser({
        school_id: schoolId,
        full_name: userFullName,
        email: userEmail,
        password_hash: userPassword,
        pin_code: userPin,
        role: userRole,
        allowed_modules: userModules.length > 0 ? userModules : ALL_MODULE_KEYS,
      });
      setUserFullName('');
      setUserEmail('');
      setUserPassword('');
      setUserPin('');
      await onRefresh();
      showToast('Потребителят беше добавен към училището.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Грешка при създаване на потребител.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Supabase Connection Status Info */}
      {usingFallback && fallbackMessage && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs sm:text-sm text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong className="block mb-0.5">ℹ️ Информация за базата данни (Supabase):</strong>
            <span>{fallbackMessage}</span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-mono text-xs shrink-0">
            supabase/schema_multi_tenant.sql
          </span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-heading font-bold text-navy-900">
            Училищни Инстанции и Лицензи ({bundles.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-0">
            Управлявайте училищните портали (`/school/:slug`), платените периоди за 3-те системи и потребителските профили.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateSchool}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer"
        >
          + Създай Училище
        </button>
      </div>

      {/* Create / Edit School Modal / Form */}
      {showCreateModal && (
        <form
          onSubmit={handleSaveSchool}
          className="bg-white rounded-2xl border-2 border-blue-200 p-5 sm:p-6 space-y-4 shadow-md"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900">
              {editingSchoolId ? 'Редакция на училищна инстанция' : 'Нова училищна инстанция'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetSchoolForm();
              }}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Име на училището *
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => handleSchoolNameChange(e.target.value)}
                placeholder="напр. СУ Константин Петканов"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug (`/school/:slug`) *
              </label>
              <input
                type="text"
                value={schoolSlug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSchoolSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }}
                placeholder="su-konstantin-petkanov"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Град / Населено място
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="гр. Бургас"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Лого URL (по желание)
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Лице за контакт (Директор / Админ)
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Телефон за връзка
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+359 88..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Служебен имейл
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@school.bg"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Бележки към инстанцията
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Допълнителна информация за договора..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Директен адрес:{' '}
              <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-navy-900">
                {origin}/school/{schoolSlug || 'slug'}
              </code>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetSchoolForm();
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={savingSchool}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {savingSchool
                  ? 'Записване...'
                  : editingSchoolId
                    ? 'Запази промените'
                    : 'Създай училището'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List of Schools */}
      {bundles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-600 mb-4">
            Все още няма регистрирани училищни инстанции.
          </p>
          <button
            type="button"
            onClick={openCreateSchool}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold"
          >
            + Създай първото училище
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bundles.map((bundle) => {
            const { school, licenses, users } = bundle;
            const portalUrl = `${origin}/school/${school.slug}`;
            const isUsersExpanded = expandedUsersSchoolId === school.id;

            return (
              <div
                key={school.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* School Card Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {school.logo_url ? (
                      <img
                        src={school.logo_url}
                        alt={school.name}
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center font-heading font-bold text-base shrink-0">
                        УЧ
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 truncate">
                          {school.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            school.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {school.is_active ? 'Активна инстанция' : 'Спряна инстанция'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {school.city && <span>📍 гр. {school.city}</span>}
                        {school.contact_person && <span>👤 {school.contact_person}</span>}
                        {school.contact_phone && <span>📞 {school.contact_phone}</span>}
                        {school.contact_email && <span>✉️ {school.contact_email}</span>}
                      </div>

                      {/* Direct Portal Link */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-navy-900 break-all">
                          {portalUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleCopyPortalLink(school.slug)}
                          className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Копирай линк
                        </button>
                        <Link
                          to={`/school/${school.slug}`}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                        >
                          Отвори портала →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* School Instance Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditSchool(bundle)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                    >
                      Редактирай профил
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await updateSchoolInstance(school.id, {
                          is_active: !school.is_active,
                        });
                        await onRefresh();
                        showToast(
                          school.is_active
                            ? 'Инстанцията на училището беше временно спряна.'
                            : 'Инстанцията на училището беше активирана.'
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        school.is_active
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {school.is_active ? 'Спри инстанцията' : 'Активирай инстанцията'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteSchoolInstance(school.id);
                        await onRefresh();
                        showToast(`Училище „${school.name}“ беше изтрито.`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold cursor-pointer"
                    >
                      Изтрий
                    </button>
                  </div>
                </div>

                {/* 3 Systems License Management Grid */}
                <div className="p-4 sm:p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Управление на услугите и периодите на плащане
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {ALL_MODULE_KEYS.map((modKey) => {
                      const meta = MODULE_META[modKey];
                      const lic = licenses[modKey];
                      const info = computeLicenseInfo(lic);
                      const pickerId = `${school.id}-${modKey}`;

                      return (
                        <div
                          key={modKey}
                          className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                            info.state === 'active'
                              ? 'bg-emerald-50/30 border-emerald-200'
                              : info.state === 'expired'
                                ? 'bg-red-50/40 border-red-200'
                                : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="font-heading font-bold text-sm sm:text-base text-navy-900">
                                {meta.name}
                              </div>
                              {info.state === 'active' ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                                  Активен (Платен)
                                </span>
                              ) : info.state === 'expired' ? (
                                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[11px] font-bold shrink-0">
                                  Изтекъл
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-bold shrink-0">
                                  Неактивен (Неплатен)
                                </span>
                              )}
                            </div>

                            {/* Expiration Date Details */}
                            <div className="text-xs text-slate-600 mb-3">
                              {info.state === 'active' && info.formattedExpiresAt ? (
                                <span>
                                  Крайна дата: <strong>{info.formattedExpiresAt}</strong> (остават{' '}
                                  <strong
                                    className={
                                      info.isExpiringSoon ? 'text-amber-700' : 'text-emerald-700'
                                    }
                                  >
                                    {info.daysRemaining} дни
                                  </strong>
                                  )
                                </span>
                              ) : info.state === 'expired' && info.formattedExpiresAt ? (
                                <span className="text-red-700 font-medium">
                                  Изтекъл на: <strong>{info.formattedExpiresAt}</strong>
                                </span>
                              ) : (
                                <span>Модулът не е активиран за това училище.</span>
                              )}
                            </div>
                          </div>

                          {/* Quick Period Action Buttons */}
                          <div className="space-y-2 pt-2 border-t border-slate-200/70">
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleSetLicensePeriod(school.id, modKey, '6_months')
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-navy-900 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                + 6 Месеца
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleSetLicensePeriod(school.id, modKey, '1_year')
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-navy-900 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                + 1 Година
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleSetLicensePeriod(school.id, modKey, '2_years')
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-navy-900 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                + 2 Години
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDatePickerKey(
                                    openDatePickerKey === pickerId ? null : pickerId
                                  );
                                  setCustomDateValue(
                                    lic?.expires_at ? lic.expires_at.slice(0, 10) : ''
                                  );
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Избери точна дата
                              </button>
                              {lic?.is_enabled && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleSetLicensePeriod(school.id, modKey, 'stop')
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Спри достъпа
                                </button>
                              )}
                            </div>

                            {openDatePickerKey === pickerId && (
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="date"
                                  value={customDateValue}
                                  onChange={(e) => setCustomDateValue(e.target.value)}
                                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => void handleApplyCustomDate(school.id, modKey)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shrink-0"
                                >
                                  Задай
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Users & Access Section for this School */}
                <div className="border-t border-slate-200 bg-slate-50/60 px-4 sm:px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedUsersSchoolId(isUsersExpanded ? null : school.id)
                      }
                      className="text-xs sm:text-sm font-heading font-bold text-navy-900 flex items-center gap-2 hover:text-blue-600 cursor-pointer"
                    >
                      <span>👥 Потребители и Достъп ({users.length})</span>
                      <span className="text-xs font-normal text-blue-600">
                        {isUsersExpanded ? '▲ Скрий' : '▼ Управлявай потребителите'}
                      </span>
                    </button>
                  </div>

                  {isUsersExpanded && (
                    <div className="mt-4 space-y-4">
                      {/* Add New School User Form */}
                      <form
                        onSubmit={(e) => void handleCreateUser(e, school.id)}
                        className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
                      >
                        <div className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                          + Добави потребител към {school.name}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Име и фамилия *
                            </label>
                            <input
                              type="text"
                              value={userFullName}
                              onChange={(e) => setUserFullName(e.target.value)}
                              placeholder="Мария Иванова"
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Имейл / Потребител *
                            </label>
                            <input
                              type="text"
                              value={userEmail}
                              onChange={(e) => setUserEmail(e.target.value)}
                              placeholder="m.ivanova@school.bg"
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Парола за вход *
                            </label>
                            <input
                              type="text"
                              value={userPassword}
                              onChange={(e) => setUserPassword(e.target.value)}
                              placeholder="Парола..."
                              required
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              ПИН код (по желание)
                            </label>
                            <input
                              type="text"
                              maxLength={8}
                              value={userPin}
                              onChange={(e) => setUserPin(e.target.value)}
                              placeholder="напр. 1234"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Роля
                            </label>
                            <select
                              value={userRole}
                              onChange={(e) => setUserRole(e.target.value as SchoolUserRole)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white"
                            >
                              <option value="school_admin">Училищен Админ / Директор</option>
                              <option value="teacher">Учител</option>
                              <option value="technician">Технически персонал</option>
                              <option value="staff">Служител</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="font-semibold text-slate-700">
                              Достъп до модули:
                            </span>
                            {ALL_MODULE_KEYS.map((modKey) => (
                              <label
                                key={modKey}
                                className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={userModules.includes(modKey)}
                                  onChange={() => handleToggleUserModule(modKey)}
                                  className="rounded border-slate-300 text-blue-600"
                                />
                                <span>{MODULE_META[modKey].shortName}</span>
                              </label>
                            ))}
                          </div>

                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                          >
                            + Добави потребител
                          </button>
                        </div>
                      </form>

                      {/* Users List */}
                      {users.length === 0 ? (
                        <div className="text-xs text-slate-500 py-2">
                          Няма създадени потребители за това училище.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {users.map((u) => (
                            <div
                              key={u.id}
                              className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-navy-900">{u.full_name}</span>
                                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold">
                                    {ROLE_LABELS[u.role] || u.role}
                                  </span>
                                  {!u.is_active && (
                                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px] font-semibold">
                                      Спрян достъп
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                                  <span>Имейл: <strong>{u.email}</strong></span>
                                  <span>Парола: <code className="bg-slate-100 px-1 rounded">{u.password_hash}</code></span>
                                  {u.pin_code && (
                                    <span>ПИН: <code className="bg-slate-100 px-1 rounded">{u.pin_code}</code></span>
                                  )}
                                  <span>
                                    Модули:{' '}
                                    {(u.allowed_modules || ALL_MODULE_KEYS)
                                      .map((m) => MODULE_META[m]?.shortName || m)
                                      .join(', ')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {changingPassUserId === u.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={newPassValue}
                                      onChange={(e) => setNewPassValue(e.target.value)}
                                      placeholder="Нова парола..."
                                      className="px-2.5 py-1 rounded border border-slate-300 text-xs w-28"
                                    />
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!newPassValue.trim()) return;
                                        await updateSchoolUser(u.id, {
                                          password_hash: newPassValue.trim(),
                                        });
                                        setChangingPassUserId(null);
                                        setNewPassValue('');
                                        await onRefresh();
                                        showToast('Паролата на потребителя е обновена.');
                                      }}
                                      className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-semibold"
                                    >
                                      Запази
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setChangingPassUserId(null);
                                        setNewPassValue('');
                                      }}
                                      className="px-2 py-1 text-xs text-slate-500"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEditUser(u)}
                                      className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer"
                                    >
                                      Редактирай
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setChangingPassUserId(u.id);
                                        setNewPassValue(u.password_hash);
                                      }}
                                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                                    >
                                      Смени парола
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={async () => {
                                    await updateSchoolUser(u.id, { is_active: !u.is_active });
                                    await onRefresh();
                                    showToast(
                                      u.is_active
                                        ? 'Правата на потребителя са временно спрени.'
                                        : 'Правата на потребителя са активирани.'
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium cursor-pointer"
                                >
                                  {u.is_active ? 'Спри правата' : 'Възстанови права'}
                                </button>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deleteSchoolUser(u.id);
                                    await onRefresh();
                                    showToast('Потребителят беше изтрит.');
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium cursor-pointer"
                                >
                                  Изтрий
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit School User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 animate-scale-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-heading font-bold text-navy-900">Редактиране на Потребител</h3>
                <p className="text-xs text-slate-500 mb-0">Актуализирайте данни, права и роли</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Име и фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUserFullName}
                  onChange={(e) => setEditUserFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Имейл <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Парола <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN код (4-6 цифри, опция)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editUserPin}
                    onChange={(e) => setEditUserPin(e.target.value)}
                    placeholder="Напр. 1234"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Роля
                  </label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as SchoolUserRole)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="staff">Персонал / Учител (staff)</option>
                    <option value="tech_support">ИТ специалист / Поддръжка (tech_support)</option>
                    <option value="school_admin">Училищен администратор (school_admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Разрешени модули за този потребител
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_MODULE_KEYS.map((k) => {
                    const isChecked = editUserModules.includes(k);
                    return (
                      <label
                        key={k}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEditUserModule(k)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{MODULE_META[k].name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {savingUser ? 'Запазване...' : 'Запази промените'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface LicenseAlertsTabProps {
  bundles: SchoolBundle[];
  onRefresh: () => Promise<void>;
  showToast: (msg: string) => void;
}

export function LicenseAlertsTab({
  bundles,
  onRefresh,
  showToast,
}: LicenseAlertsTabProps) {
  const alerts: LicenseAlert[] = computeAllLicenseAlerts(bundles);

  const handleRenew = async (
    schoolId: string,
    moduleKey: SchoolModuleKey,
    period: '6_months' | '1_year' | '2_years'
  ) => {
    await updateSchoolLicensePeriod(schoolId, moduleKey, { type: period });
    await onRefresh();
    showToast(`Лицензът за „${MODULE_META[moduleKey].name}“ беше подновен успешно.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-heading font-bold text-navy-900">
          Известия за Лицензи и Срокове на Валидност
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-0">
          Автоматично следене на всички изтекли лицензи и абонаменти, изтичащи в следващите 14 дни.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-8 text-center">
          <div className="text-base font-heading font-bold text-emerald-900 mb-1">
            ✅ Всички активни училищни лицензи са в редовен срок
          </div>
          <p className="text-xs sm:text-sm text-emerald-700 mb-0">
            Няма изтекли модули или лицензи с оставащи по-малко от 14 дни.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const formattedDate = new Date(alert.expiresAt).toLocaleDateString('bg-BG');
            const isExpired = alert.type === 'expired';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isExpired
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-sm sm:text-base font-heading font-bold">
                    {isExpired
                      ? `⚠️ Изтекъл лиценз: ${alert.schoolName} - Модул ${alert.moduleName} е изтекъл на ${formattedDate}!`
                      : `⏳ Предстоящо изтичане: На ${alert.schoolName} му остават ${alert.daysRemaining} дни за модул ${alert.moduleName}`}
                  </div>
                  <div className="text-xs opacity-80">
                    Портал: <code className="font-mono">/school/{alert.schoolSlug}</code> • Крайна дата:{' '}
                    <strong>{formattedDate}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleRenew(alert.schoolId, alert.moduleKey, '6_months')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-navy-900 text-xs font-semibold cursor-pointer"
                  >
                    + 6 Месеца
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRenew(alert.schoolId, alert.moduleKey, '1_year')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Поднови (+ 1 Година)
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRenew(alert.schoolId, alert.moduleKey, '2_years')}
                    className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    + 2 Години
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full License Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 font-heading font-bold text-sm sm:text-base text-navy-900">
          Общ преглед на всички училища и модули
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold">Училище</th>
                <th className="py-3 px-4 font-semibold">График за дежурства</th>
                <th className="py-3 px-4 font-semibold">Система за заявки</th>
                <th className="py-3 px-4 font-semibold">Инвентарна система</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bundles.map((b) => (
                <tr key={b.school.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-semibold text-navy-900">
                    <div>{b.school.name}</div>
                    <div className="text-xs font-mono text-slate-400">/school/{b.school.slug}</div>
                  </td>
                  {ALL_MODULE_KEYS.map((modKey) => {
                    const info = computeLicenseInfo(b.licenses[modKey]);
                    return (
                      <td key={modKey} className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            info.state === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : info.state === 'expired'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {info.label}
                        </span>
                        {info.formattedExpiresAt && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            до {info.formattedExpiresAt}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


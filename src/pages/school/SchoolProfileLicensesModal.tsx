import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ALL_MODULE_KEYS,
  MODULE_META,
  ROLE_LABELS,
  computeLicenseInfo,
  createSchoolUser,
  updateSchoolUser,
  type SchoolBundle,
  type SchoolModuleKey,
  type SchoolUserRecord,
  type SchoolUserRole,
} from '../../lib/supabase';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';

interface SchoolProfileLicensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: SchoolBundle;
  refreshBundle: () => Promise<void>;
}

export function SchoolProfileLicensesModal({
  isOpen,
  onClose,
  bundle,
  refreshBundle,
}: SchoolProfileLicensesModalProps) {
  const { school, licenses, users } = bundle;
  const [activeTab, setActiveTab] = useState<'licenses' | 'users'>('licenses');

  // Add User State
  const [showAddUser, setShowAddUser] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [role, setRole] = useState<SchoolUserRole>('staff');
  const [allowedModules, setAllowedModules] = useState<SchoolModuleKey[]>(['duty', 'tickets']);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleToggleModule = (modKey: SchoolModuleKey) => {
    setAllowedModules((prev) =>
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setMsg({ type: 'error', text: 'Моля, попълнете всички задължителни полета.' });
      return;
    }

    setSaving(true);
    try {
      await createSchoolUser({
        school_id: school.id,
        full_name: fullName.trim(),
        email: email.trim(),
        password_hash: password,
        pin_code: pinCode.trim() || undefined,
        role,
        allowed_modules: allowedModules,
      });

      await refreshBundle();
      setFullName('');
      setEmail('');
      setPassword('');
      setPinCode('');
      setAllowedModules(['duty', 'tickets']);
      setShowAddUser(false);
      setMsg({ type: 'success', text: 'Потребителят е добавен успешно.' });
    } catch {
      setMsg({ type: 'error', text: 'Възникна грешка при създаване на потребителя.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: SchoolUserRecord) => {
    try {
      await updateSchoolUser(user.id, { is_active: !user.is_active });
      await refreshBundle();
    } catch {
      setMsg({ type: 'error', text: 'Грешка при промяна на статуса.' });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Icon name="School" size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-navy-900 truncate mb-0.5">
                {school.name}
              </h2>
              <p className="text-xs text-slate-500 mb-0">
                Управление на лицензи, абонаментни срокове и достъп на персонала
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-navy-900 flex items-center justify-center transition-colors shrink-0"
            title="Затвори"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-4 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('licenses')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'licenses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            <Icon name="ShieldCheck" size={16} />
            <span>Лицензи и Абонаменти</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            <Icon name="Users" size={16} />
            <span>Екип и Потребители ({users.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>{msg.text}</span>
              <button
                type="button"
                onClick={() => setMsg(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          )}

          {/* TAB 1: LICENSES */}
          {activeTab === 'licenses' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ALL_MODULE_KEYS.map((modKey) => {
                  const meta = MODULE_META[modKey];
                  const lic = licenses[modKey];
                  const info = computeLicenseInfo(lic);

                  const isExpired = info.state === 'expired';
                  const isActive = info.state === 'active' && !isExpired;

                  return (
                    <div
                      key={modKey}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                        isActive
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isExpired
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-navy-900">
                            {meta.name}
                          </span>
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              Активен
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold">
                              Изтекъл
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-bold">
                              Неактивен
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-slate-600">
                          <div>
                            Срок на валидност:{' '}
                            <strong>
                              {info.formattedExpiresAt ? info.formattedExpiresAt : 'Не е зададен'}
                            </strong>
                          </div>
                          {info.daysRemaining !== null && (
                            <div
                              className={`font-semibold ${
                                info.daysRemaining > 30
                                  ? 'text-emerald-700'
                                  : info.daysRemaining > 0
                                    ? 'text-amber-700'
                                    : 'text-red-700'
                              }`}
                            >
                              Оставащи дни:{' '}
                              <span>
                                {info.daysRemaining > 0
                                  ? `${info.daysRemaining} дни`
                                  : 'Абонаментът е изтекъл'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                        Лицензен индентификатор:{' '}
                        <code className="font-mono text-slate-700">
                          {lic?.id ? lic.id.slice(0, 14) + '...' : 'Няма'}
                        </code>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contact for Extension */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-navy-900">
                    Нужда от подновяване или добавяне на нов модул?
                  </div>
                  <p className="text-slate-600 mb-0">
                    Свържете се с екипа на TideLayer за удължаване на валидността или активиране на инвентарната система.
                  </p>
                </div>
                <Button size="sm" asChild className="shrink-0">
                  <Link to="/contact?service=education-solutions">
                    Заявете подновяване
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  Служители с достъп до системата ({users.length})
                </span>
                {!showAddUser && (
                  <button
                    type="button"
                    onClick={() => setShowAddUser(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Icon name="Plus" size={14} />
                    <span>Добави служител</span>
                  </button>
                )}
              </div>

              {/* Add User Inline Form */}
              {showAddUser && (
                <form
                  onSubmit={handleCreateUser}
                  className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3 animate-fade-in"
                >
                  <div className="font-bold text-navy-900 text-xs sm:text-sm flex items-center justify-between">
                    <span>Регистрация на нов потребител / учител</span>
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Име и фамилия *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="напр. Мария Иванова"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Служебен имейл *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="m.ivanova@school.bg"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Парола *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Бърз ПИН код (4-цифрен)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="напр. 5678"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Роля в системата
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as SchoolUserRole)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="staff">Учител / Персонал</option>
                        <option value="school_admin">Администратор / Директор</option>
                        <option value="viewer">Само за преглед</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Разрешени модули за този потребител:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_MODULE_KEYS.map((m) => (
                        <label
                          key={m}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={allowedModules.includes(m)}
                            onChange={() => handleToggleModule(m)}
                            className="rounded text-blue-600"
                          />
                          <span>{MODULE_META[m].name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white"
                    >
                      Отказ
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs"
                    >
                      {saving ? 'Запазване...' : 'Добави потребител'}
                    </button>
                  </div>
                </form>
              )}

              {/* Users List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900 text-xs sm:text-sm">
                          {u.full_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                        {!u.is_active && (
                          <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold">
                            Деактивиран
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>📧 {u.email}</span>
                        {u.pin_code && (
                          <span>
                            🔑 ПИН: <code className="font-mono bg-slate-100 px-1 rounded">{u.pin_code}</code>
                          </span>
                        )}
                        <span>
                          Модули: {u.allowed_modules?.length ? u.allowed_modules.join(', ') : 'Всички'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors shrink-0 ${
                        u.is_active
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.is_active ? 'Деактивирай' : 'Активирай'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Служебен панел на {school.name}</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Затвори
          </Button>
        </div>
      </div>
    </div>
  );
}

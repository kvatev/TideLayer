import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ALL_MODULE_KEYS,
  MODULE_META,
  ROLE_LABELS,
  clearSchoolPortalSession,
  computeLicenseInfo,
  fetchSchoolBundleBySlug,
  getSchoolPortalSession,
  isMainAdminLoggedIn,
  type SchoolBundle,
  type SchoolPortalSession,
} from '../../lib/supabase';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { SchoolPortalContext } from './schoolPortalContext';

export function SchoolPortalLayout() {
  const { schoolSlug = '' } = useParams<{ schoolSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState<SchoolBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SchoolPortalSession | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { bundle: fetched } = await fetchSchoolBundleBySlug(schoolSlug);
    setBundle(fetched);

    if (fetched) {
      const existingSession = getSchoolPortalSession(fetched.school.slug);
      if (existingSession) {
        setSession(existingSession);
      } else if (isMainAdminLoggedIn()) {
        // Super Admin Preview mode when logged into /admin
        setSession({
          schoolId: fetched.school.id,
          schoolSlug: fetched.school.slug,
          userId: 'super-admin-preview',
          fullName: 'Главен Администратор (Преглед)',
          email: 'admin@tidelayer.bg',
          role: 'school_admin',
          allowedModules: ALL_MODULE_KEYS,
          isSuperAdminPreview: true,
          loggedInAt: new Date().toISOString(),
        });
      } else {
        setSession(null);
      }
    }
    setLoading(false);
  }, [schoolSlug]);

  useEffect(() => {
    let active = true;
    fetchSchoolBundleBySlug(schoolSlug).then(({ bundle: fetched }) => {
      if (!active) return;
      setBundle(fetched);
      if (fetched) {
        const existingSession = getSchoolPortalSession(fetched.school.slug);
        if (existingSession) {
          setSession(existingSession);
        } else if (isMainAdminLoggedIn()) {
          setSession({
            schoolId: fetched.school.id,
            schoolSlug: fetched.school.slug,
            userId: 'super-admin-preview',
            fullName: 'Главен Администратор (Преглед)',
            email: 'admin@tidelayer.bg',
            role: 'school_admin',
            allowedModules: ALL_MODULE_KEYS,
            isSuperAdminPreview: true,
            loggedInAt: new Date().toISOString(),
          });
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [schoolSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-600 mb-0">
            Зареждане на училищната работна среда...
          </p>
        </div>
      </div>
    );
  }

  // 1. Not found school
  if (!bundle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="School" size={28} />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-2">
            Училищната инстанция не е намерена
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Няма регистрирано училище с идентификатор <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{schoolSlug}</code>.
          </p>
          <Button asChild>
            <Link to="/">Към началната страница на TideLayer</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Deactivated school instance (unless Super Admin decides to inspect or see warning)
  if (!bundle.school.is_active) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-navy-800 rounded-2xl border border-red-500/30 shadow-2xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-5">
            <Icon name="ShieldAlert" size={32} />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white mb-3">
            Инстанцията на това училище е временно спряна от администратора.
          </h1>
          <p className="text-sm text-slate-300 mb-6">
            Достъпът до работния портал на <strong>{bundle.school.name}</strong> е временно преустановен. За повече информация се свържете с екипа на TideLayer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/contact">Свържете се с TideLayer</Link>
            </Button>
            {isMainAdminLoggedIn() && (
              <Button variant="secondary" asChild>
                <Link to="/admin">Назад към Админ Панела</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Require login if neither school user nor Super Admin Preview
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={26} />
          </div>
          <h1 className="text-xl font-heading font-bold text-navy-900 mb-2">
            Изисква се вход в системата
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            За да достъпите работния портал на <strong>{bundle.school.name}</strong>, влезте със своя служебен профил.
          </p>
          <Button
            onClick={() => navigate(`/school/${bundle.school.slug}/login`)}
            className="w-full"
          >
            Към страницата за вход
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearSchoolPortalSession(bundle.school.slug);
    if (session.isSuperAdminPreview) {
      navigate('/admin');
    } else {
      navigate(`/school/${bundle.school.slug}/login`);
    }
  };

  // Detect if user is inside a specific module route: /school/:slug/duty, /tickets, /inventory
  const pathAfterSlug = location.pathname.replace(
    new RegExp(`^/school/${bundle.school.slug}/?`, 'i'),
    ''
  );
  const currentModuleKey = ALL_MODULE_KEYS.find(
    (k) => pathAfterSlug === k || pathAfterSlug.startsWith(`${k}/`)
  );

  // Module-level license guard
  const renderModuleGuardOrOutlet = () => {
    if (!currentModuleKey) {
      return <Outlet />;
    }

    const lic = bundle.licenses[currentModuleKey];
    const info = computeLicenseInfo(lic);
    const modMeta = MODULE_META[currentModuleKey];

    // Check if user has permission for this module
    if (
      !session.isSuperAdminPreview &&
      session.role !== 'school_admin' &&
      !session.allowedModules.includes(currentModuleKey)
    ) {
      return (
        <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-amber-200 shadow-sm p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={28} />
          </div>
          <h2 className="text-xl font-heading font-bold text-navy-900 mb-2">
            Нямате права за достъп до този модул
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Вашият потребителски профил няма активиран достъп до модул <strong>{modMeta.name}</strong>. Обърнете се към директора или администратора на училището.
          </p>
          <Button asChild>
            <Link to={`/school/${bundle.school.slug}`}>Назад към главното табло</Link>
          </Button>
        </div>
      );
    }

    // Expired license check (expires_at < now())
    if (info.state === 'expired') {
      const formattedDate = info.formattedExpiresAt || '';
      return (
        <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border-2 border-red-200 shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertTriangle" size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-3">
            ⚠️ Лицензът за използване на тази система е изтекъл на {formattedDate}. Моля, свържете се с TideLayer за подновяване на абонамента.
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Модул: <strong>{modMeta.name}</strong> • Училище: <strong>{bundle.school.name}</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to={`/contact?service=education-solutions&plan=${encodeURIComponent(modMeta.name)}`}>
                Заявете подновяване
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/school/${bundle.school.slug}`}>Към таблото на училището</Link>
            </Button>
          </div>
        </div>
      );
    }

    // Inactive module check (is_enabled = false)
    if (info.state === 'inactive') {
      return (
        <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={28} />
          </div>
          <h2 className="text-xl font-heading font-bold text-navy-900 mb-2">
            Неактивен модул (Не е включен във вашия план)
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Системата <strong>{modMeta.name}</strong> не е активирана за <strong>{bundle.school.name}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to={`/contact?service=education-solutions&plan=${encodeURIComponent(modMeta.name)}`}>
                Свържете се с TideLayer
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/school/${bundle.school.slug}`}>Към таблото на училището</Link>
            </Button>
          </div>
        </div>
      );
    }

    return <Outlet />;
  };

  return (
    <SchoolPortalContext.Provider
      value={{
        bundle,
        session,
        refreshBundle: loadData,
      }}
    >
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Super Admin Preview Banner */}
        {session.isSuperAdminPreview && (
          <div className="bg-amber-500 text-navy-950 px-4 py-2 text-xs sm:text-sm font-semibold">
            <div className="container flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="Eye" size={16} />
                <span>
                  Режим на преглед (Super Admin Preview) — разглеждате портала на{' '}
                  <strong>{bundle.school.name}</strong> без парола на училището.
                </span>
              </div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-900 text-white text-xs font-medium hover:bg-navy-800 transition-colors"
              >
                <Icon name="ArrowLeft" size={13} />
                Към Главния Админ Панел
              </Link>
            </div>
          </div>
        )}

        {/* Top School Portal Navigation Bar */}
        <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-30 shadow-sm">
          <div className="container py-3 flex flex-wrap items-center justify-between gap-3">
            {/* School Logo & Name */}
            <Link
              to={`/school/${bundle.school.slug}`}
              className="flex items-center gap-3 min-w-0 group"
            >
              {bundle.school.logo_url ? (
                <img
                  src={bundle.school.logo_url}
                  alt={bundle.school.name}
                  className="w-10 h-10 rounded-xl object-contain bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-heading font-bold text-base shrink-0 shadow-xs">
                  <Icon name="GraduationCap" size={22} />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-heading font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                  {bundle.school.name}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {bundle.school.city ? `гр. ${bundle.school.city} • ` : ''}Училищен портал
                </div>
              </div>
            </Link>

            {/* Quick Switcher Between Systems */}
            <nav
              aria-label="Училищни системи"
              className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full py-1"
            >
              <Link
                to={`/school/${bundle.school.slug}`}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  !currentModuleKey
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon name="LayoutDashboard" size={15} />
                <span>Табло</span>
              </Link>

              {ALL_MODULE_KEYS.map((modKey) => {
                const lic = bundle.licenses[modKey];
                const info = computeLicenseInfo(lic);
                const meta = MODULE_META[modKey];
                const isCurrent = currentModuleKey === modKey;
                const isActive = info.state === 'active';

                return (
                  <Link
                    key={modKey}
                    to={`/school/${bundle.school.slug}/${modKey}`}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isActive
                          ? 'text-slate-200 hover:bg-navy-800 hover:text-white'
                          : 'text-slate-500 hover:bg-navy-800/60'
                    }`}
                    title={`${meta.name} — ${info.label}`}
                  >
                    <Icon name={meta.icon} size={15} />
                    <span>{meta.shortName}</span>
                    {!isActive && <Icon name="Lock" size={12} className="opacity-75" />}
                  </Link>
                );
              })}
            </nav>

            {/* Logged in User & Logout */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden md:block text-right">
                <div className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  {session.fullName}
                </div>
                <div className="text-[11px] text-slate-400">
                  {ROLE_LABELS[session.role] || session.role}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-red-600/90 text-slate-200 hover:text-white border border-slate-700 hover:border-red-500 text-xs sm:text-sm font-medium transition-colors"
              >
                <Icon name="LogOut" size={15} />
                <span>Изход</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="flex-1 container py-6 sm:py-8">
          {renderModuleGuardOrOutlet()}
        </main>

        {/* Minimal School Portal Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              Работна среда за <strong>{bundle.school.name}</strong> • Задвижвано от{' '}
              <Link to="/" className="text-blue-600 hover:underline font-medium">
                TideLayer School SaaS
              </Link>
            </div>
            <div>При технически въпроси: info@tidelayer.com</div>
          </div>
        </footer>
      </div>
    </SchoolPortalContext.Provider>
  );
}

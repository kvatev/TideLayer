import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  authenticateSchoolPortalUser,
  fetchSchoolBundleBySlug,
  isMainAdminLoggedIn,
  type SchoolBundle,
} from '../../lib/supabase';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';

export function SchoolLogin() {
  const { schoolSlug = '' } = useParams<{ schoolSlug: string }>();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState<SchoolBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMode, setLoginMode] = useState<'credentials' | 'pin'>('credentials');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSchoolBundleBySlug(schoolSlug).then(({ bundle: b }) => {
      if (!active) return;
      setBundle(b);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [schoolSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res =
      loginMode === 'pin'
        ? await authenticateSchoolPortalUser(schoolSlug, '', pinCode, 'pin')
        : await authenticateSchoolPortalUser(schoolSlug, identifier, password, 'credentials');

    setSubmitting(false);

    if (res.error || !res.session) {
      setError(res.error || 'Грешка при вход.');
      return;
    }

    navigate(`/school/${res.session.schoolSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-300 mb-0">Зареждане на училищния портал...</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="School" size={28} />
          </div>
          <h1 className="text-xl font-heading font-bold text-navy-900 mb-2">
            Училището не е намерено
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Не съществува активен портал на адрес <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">/school/{schoolSlug}</code>.
          </p>
          <Button asChild className="w-full">
            <Link to="/">Към началната страница</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!bundle.school.is_active) {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-navy-800 border border-red-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Icon name="ShieldAlert" size={32} />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white mb-3">
            Инстанцията на това училище е временно спряна от администратора.
          </h1>
          <p className="text-sm text-slate-300 mb-6">
            Порталът на <strong>{bundle.school.name}</strong> не е активен в момента.
          </p>
          <Button asChild>
            <Link to="/contact">Свържете се с TideLayer</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* School Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-6 text-center">
          {bundle.school.logo_url ? (
            <img
              src={bundle.school.logo_url}
              alt={bundle.school.name}
              className="w-16 h-16 rounded-2xl object-contain bg-white border border-slate-200 p-1.5 mx-auto mb-3 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Icon name="GraduationCap" size={32} />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            {bundle.school.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {bundle.school.city ? `гр. ${bundle.school.city} • ` : ''}Вход в училищната система
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {isMainAdminLoggedIn() && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col gap-2">
              <div className="font-semibold flex items-center gap-1.5">
                <Icon name="Eye" size={16} className="text-amber-600" />
                Вие сте логнат като Главен Администратор
              </div>
              <button
                type="button"
                onClick={() => navigate(`/school/${bundle.school.slug}`)}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-navy-950 font-semibold text-xs transition-colors"
              >
                Влез директно в режим Super Admin Preview →
              </button>
            </div>
          )}

          {/* Switch between Credentials and PIN */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginMode('credentials');
                setError('');
              }}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                loginMode === 'credentials'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Имейл и парола
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('pin');
                setError('');
              }}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                loginMode === 'pin'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Бърз ПИН код
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2"
            >
              <Icon name="AlertCircle" size={16} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMode === 'credentials' ? (
              <>
                <div>
                  <label
                    htmlFor="school-login-email"
                    className="block text-xs sm:text-sm font-semibold text-navy-900 mb-1.5"
                  >
                    Служебен имейл или потребителско име
                  </label>
                  <input
                    id="school-login-email"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="director@school.bg"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="school-login-password"
                    className="block text-xs sm:text-sm font-semibold text-navy-900 mb-1.5"
                  >
                    Парола
                  </label>
                  <input
                    id="school-login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </>
            ) : (
              <div>
                <label
                  htmlFor="school-login-pin"
                  className="block text-xs sm:text-sm font-semibold text-navy-900 mb-1.5"
                >
                  Персонален ПИН код
                </label>
                <input
                  id="school-login-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Въведете ПИН (напр. 1234)"
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Проверка...' : 'Вход в портала'}
            </Button>
          </form>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span>Защитена училищна среда</span>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            TideLayer SaaS
          </Link>
        </div>
      </div>
    </div>
  );
}

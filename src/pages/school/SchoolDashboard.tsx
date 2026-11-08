import { Link } from 'react-router-dom';
import {
  ALL_MODULE_KEYS,
  MODULE_META,
  ROLE_LABELS,
  computeLicenseInfo,
} from '../../lib/supabase';
import { useSchoolPortal } from '../../components/layout/schoolPortalContext';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';

export function SchoolDashboard() {
  const { bundle, session } = useSchoolPortal();
  const { school, licenses } = bundle;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          {school.logo_url ? (
            <img
              src={school.logo_url}
              alt={school.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-slate-50 border border-slate-200 p-1.5 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="GraduationCap" size={30} />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-navy-900 mb-1">
              {school.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mb-0">
              Добре дошли, <strong>{session.fullName}</strong> ({ROLE_LABELS[session.role] || session.role})
              {school.city ? ` • гр. ${school.city}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl">
          <Icon name="ShieldCheck" size={16} className="text-emerald-600 shrink-0" />
          <span>Инстанция: <strong className="text-navy-900">Активна</strong></span>
        </div>
      </div>

      {/* Systems Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-1">
            Училищни софтуерни системи
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-0">
            Изберете активна система за работа или проверете статуса на вашите лицензи.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ALL_MODULE_KEYS.map((modKey) => {
            const meta = MODULE_META[modKey];
            const lic = licenses[modKey];
            const info = computeLicenseInfo(lic);

            const hasRoleAccess =
              session.isSuperAdminPreview ||
              session.role === 'school_admin' ||
              session.allowedModules.includes(modKey);

            const isExpired = info.state === 'expired';

            const isActiveAndValid = info.state === 'active' && !isExpired;

            return (
              <div
                key={modKey}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  isActiveAndValid && hasRoleAccess
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300'
                    : isExpired
                      ? 'bg-red-50/40 border-red-200'
                      : 'bg-slate-100/80 border-slate-200 opacity-90'
                }`}
              >
                <div>
                  {/* Top Icon + Status Indicator */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isActiveAndValid
                          ? 'bg-blue-50 text-blue-600'
                          : isExpired
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon name={meta.icon} size={24} />
                    </div>

                    {isActiveAndValid ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Активен лиценз
                        </span>
                        {info.formattedExpiresAt && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            Валиден до: <strong>{info.formattedExpiresAt}</strong>
                            {info.daysRemaining !== null && (
                              <span> ({info.daysRemaining} дни)</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 border border-red-200 text-red-700 text-xs font-semibold">
                        <Icon name="AlertTriangle" size={13} />
                        Изтекъл лиценз
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-600 text-xs font-semibold">
                        <Icon name="Lock" size={13} />
                        Заключен модул
                      </span>
                    )}
                  </div>

                  {/* Module Title & Description */}
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-2">
                    {meta.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {meta.description}
                  </p>
                </div>

                {/* Action / Status Footer */}
                <div className="pt-4 border-t border-slate-200/80">
                  {isExpired ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed font-medium">
                        ⚠️ Лицензът за използване на тази система е изтекъл на{' '}
                        <strong>
                          {lic?.expires_at
                            ? new Date(lic.expires_at).toLocaleDateString('bg-BG')
                            : ''}
                        </strong>
                        . Моля, свържете се с TideLayer за подновяване на абонамента.
                      </div>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link
                          to={`/contact?service=education-solutions&plan=${encodeURIComponent(
                            meta.name
                          )}`}
                        >
                          Свържете се с TideLayer
                        </Link>
                      </Button>
                    </div>
                  ) : !isActiveAndValid ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-200/70 text-xs text-slate-700 font-medium flex items-center gap-2">
                        <Icon name="Lock" size={15} className="text-slate-500 shrink-0" />
                        <span>Неактивен модул (Не е включен във вашия план)</span>
                      </div>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link
                          to={`/contact?service=education-solutions&plan=${encodeURIComponent(
                            meta.name
                          )}`}
                        >
                          Заявете активиране
                        </Link>
                      </Button>
                    </div>
                  ) : !hasRoleAccess ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                      Вашият потребителски профил няма зададен достъп до този модул.
                    </div>
                  ) : (
                    <Button asChild className="w-full flex items-center justify-center gap-2">
                      <Link to={`/school/${school.slug}/${modKey}`}>
                        <span>Отвори системата</span>
                        <Icon name="ArrowRight" size={16} />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* School Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
        <div className="space-y-1">
          <div className="font-semibold text-navy-900">
            Данни за училищната инстанция
          </div>
          <div>
            Лице за контакт: <strong>{school.contact_person || 'Не е посочено'}</strong>
            {school.contact_phone ? ` • Тел.: ${school.contact_phone}` : ''}
            {school.contact_email ? ` • Имейл: ${school.contact_email}` : ''}
          </div>
        </div>
        <Link
          to="/contact?type=education-solutions"
          className="text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap inline-flex items-center gap-1"
        >
          <span>Техническа поддръжка</span>
          <Icon name="ExternalLink" size={14} />
        </Link>
      </div>
    </div>
  );
}

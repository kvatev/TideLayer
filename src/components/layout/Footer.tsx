import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { brandConfig } from '../../config/brand';
import { useSiteControl } from '../../data/siteControl';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const siteControl = useSiteControl();
  const hiddenSet = new Set(siteControl.hiddenNavHrefs);

  const rawFooterNav: Record<string, { label: string; href: string }[]> = {
    'Уеб решения': hiddenSet.has('/web-solutions')
      ? []
      : [
          { label: 'Уеб разработка', href: '/web-solutions/website-development' },
          { label: 'Поддръжка на уебсайтове', href: '/web-solutions/website-maintenance' }
        ].filter((l) => !hiddenSet.has(l.href)),
    'Училищни решения': hiddenSet.has('/education-solutions')
      ? []
      : [
          { label: 'График на дежурства', href: '/education-solutions/duty-scheduler' },
          { label: 'Задачи и Документи', href: '/education-solutions/school-ticketing' },
          { label: 'Инвентарна система', href: '/education-solutions/school-inventory' },
          { label: 'ИТ поддръжка за училища', href: '/education-solutions/school-it-support' },
          { label: 'Обучения за учители', href: '/education-solutions/teacher-training' }
        ].filter((l) => !hiddenSet.has(l.href)),
    'Мрежи и ИТ': hiddenSet.has('/networks-it')
      ? []
      : [
          { label: 'Изграждане на мрежи', href: '/networks-it/network-installation' },
          { label: 'Месечна ИТ поддръжка', href: '/networks-it/monthly-support' }
        ].filter((l) => !hiddenSet.has(l.href)),
    Компания: [
      { label: 'Хардуерен сервиз', href: '/hardware-service' },
      { label: 'Портфолио', href: '/portfolio' },
      { label: 'Контакти', href: '/contact' }
    ].filter((l) => !hiddenSet.has(l.href))
  };

  const footerEntries = Object.entries(rawFooterNav).filter(([, links]) => links.length > 0);

  const socialIcons = {
    linkedin: 'Linkedin',
    github: 'Github',
    facebook: 'Facebook',
    twitter: 'Twitter'
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200" role="contentinfo">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + Contact column */}
          <div className="lg:col-span-4 min-w-0">
            <Link
              to="/"
              className="inline-block mb-4 focus-visible:outline-none"
              aria-label={`${brandConfig.name} - Начало`}
            >
              <img
                src="/images/logo/logo.webp"
                alt={brandConfig.name}
                className="h-10 md:h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm mb-6">
              Технологични решения за бизнес и образование. Уеб разработка, специализиран софтуер за училища, ИТ инфраструктура и хардуерен сервиз.
            </p>

            <h3 className="font-semibold text-navy-900 mb-3 text-sm">Контакти</h3>
            <address className="not-italic text-sm text-slate-600 space-y-2 break-words">
              {siteControl.contactInfo.addressFull && <p className="mb-1">{siteControl.contactInfo.addressFull}</p>}
              {siteControl.contactInfo.email && (
                <p className="mb-1">
                  <a href={`mailto:${siteControl.contactInfo.email}`} className="hover:text-navy-900 transition-colors break-all">
                    {siteControl.contactInfo.email}
                  </a>
                </p>
              )}
              {siteControl.contactInfo.phone && (
                <p className="mb-0">
                  <a href={`tel:${siteControl.contactInfo.phone}`} className="hover:text-navy-900 transition-colors">
                    {siteControl.contactInfo.phone}
                  </a>
                </p>
              )}
            </address>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(brandConfig.social).map(([key, url]) => {
                const iconName = socialIcons[key as keyof typeof socialIcons] as keyof typeof import('lucide-react');
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-200 transition-colors"
                    aria-label={key}
                  >
                    <Icon name={iconName} size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation columns */}
          {footerEntries.length > 0 && (
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 min-w-0">
              {footerEntries.map(([title, links]) => (
                <nav key={title} aria-label={title} className="min-w-0">
                  <h3 className="font-semibold text-navy-900 mb-4 text-sm">{title}</h3>
                  <ul className="space-y-2.5 text-sm">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-slate-600 hover:text-navy-900 transition-colors break-words"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center md:text-left mb-0">
            © {CURRENT_YEAR} {brandConfig.name}. Всички права запазени.
          </p>
          <nav className="flex flex-wrap justify-center gap-6 text-xs" aria-label="Правни">
            <Link to="/privacy-policy" className="text-slate-400 hover:text-navy-900 transition-colors">
              Политика за поверителност
            </Link>
            <Link to="/terms" className="text-slate-400 hover:text-navy-900 transition-colors">
              Условия за ползване
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

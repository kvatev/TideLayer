import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { brandConfig } from '../../config/brand';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerNav = {
    'Уеб решения': [
      { label: 'Уеб разработка', href: '/web-solutions/website-development' },
      { label: 'Уеб приложения', href: '/web-solutions/web-applications' },
      { label: 'Поддръжка на уебсайтове', href: '/web-solutions/website-maintenance' }
    ],
    'Училищни решения': [
      { label: 'График на дежурства', href: '/education-solutions/duty-scheduler' },
      { label: 'Система за заявки', href: '/education-solutions/school-ticketing' },
      { label: 'Инвентарна система', href: '/education-solutions/school-inventory' },
      { label: 'ИТ поддръжка за училища', href: '/education-solutions/school-it-support' }
    ],
    'Мрежи и ИТ': [
      { label: 'Изграждане на мрежи', href: '/networks-it/network-installation' },
      { label: 'Wi-Fi и LAN', href: '/networks-it/wifi-lan' },
      { label: 'Сървъри и NAS', href: '/networks-it/servers-nas' },
      { label: 'Месечна ИТ поддръжка', href: '/networks-it/monthly-support' }
    ],
    Компания: [
      { label: 'За нас', href: '/about' },
      { label: 'Портфолио', href: '/portfolio' },
      { label: 'Контакти', href: '/contact' }
    ],
    Правни: [
      { label: 'Политика за поверителност', href: '/privacy-policy' },
      { label: 'Общи условия', href: '/terms' }
    ]
  };

  const socialIcons = {
    linkedin: 'Linkedin',
    github: 'Github',
    facebook: 'Facebook',
    twitter: 'Twitter'
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200" role="contentinfo">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-navy-900 font-heading font-bold text-xl md:text-2xl mb-4"
              aria-label={`${brandConfig.name} - Начало`}
            >
              <span className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-navy-900 shrink-0">
                <Icon name="Layers" size={22} className="text-white" />
              </span>
              <span>{brandConfig.name}</span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs mb-6">
              Технологични решения за бизнес и образование. Уеб разработка, специализиран софтуер за училища, ИТ инфраструктура и хардуерен сервиз.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              © {currentYear} {brandConfig.name}. Всички права запазени.
            </p>
          </div>

          {/* Navigation columns */}
          {Object.entries(footerNav).map(([title, links]) => (
            <nav key={title} aria-label={title} className="lg:col-span-1">
              <h3 className="font-semibold text-navy-900 mb-4">{title}</h3>
              <ul className="space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-slate-600 hover:text-navy-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact column */}
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 md:row-start-1">
            <h3 className="font-semibold text-navy-900 mb-4">Контакти</h3>
            <address className="not-italic text-sm text-slate-600 space-y-3">
              <p>{brandConfig.contact.address.full}</p>
              <p>
                <a href={`mailto:${brandConfig.contact.email}`} className="hover:text-navy-900 transition-colors">
                  {brandConfig.contact.email}
                </a>
              </p>
              <p>
                <a href={`tel:${brandConfig.contact.phone}`} className="hover:text-navy-900 transition-colors">
                  {brandConfig.contact.phone}
                </a>
              </p>
            </address>
            <div className="mt-6 flex gap-4">
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
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center md:text-left">
            Всички права запазени.
          </p>
          <nav className="flex gap-6 text-xs" aria-label="Правни">
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
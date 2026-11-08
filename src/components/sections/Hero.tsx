import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

const heroCards = [
  {
    icon: 'Globe',
    href: '/web-solutions',
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Уеб решения',
    subtitle: 'Уебсайтове & Поддръжка',
    items: ['Бизнес уебсайтове', 'Мобилен дизайн и SEO', 'Текуща поддръжка'],
  },
  {
    icon: 'GraduationCap',
    href: '/education-solutions',
    iconBg: 'bg-cyan-100 text-cyan-600',
    title: 'Училищни решения',
    subtitle: 'Софтуер & ИТ поддръжка',
    items: ['График на дежурства', 'Задачи и Документи', 'Инвентарна система'],
  },
  {
    icon: 'Server',
    href: '/networks-it',
    iconBg: 'bg-navy-100 text-navy-600',
    title: 'Мрежи и ИТ',
    subtitle: 'Инфраструктура & Поддръжка',
    items: ['Изграждане на мрежи', 'LAN / Wi-Fi & VLAN', 'Месечна ИТ поддръжка'],
  },
  {
    icon: 'Cpu',
    href: '/hardware-service',
    iconBg: 'bg-slate-100 text-slate-600',
    title: 'Хардуерен сервиз',
    subtitle: 'Диагностика & Ремонт',
    items: ['PC диагностика', 'Ъпгрейд & ремонт', 'Сглобяване на ПК'],
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 md:pt-24 md:pb-24" aria-labelledby="hero-title">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <div className="max-w-2xl min-w-0 animate-fade-in">
            <h1
              id="hero-title"
              className="text-[1.75rem] min-[375px]:text-[2.125rem] sm:text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.25rem] font-heading font-bold text-navy-900 leading-[1.12] tracking-tight mb-5 sm:mb-6 animate-slide-up"
            >
              Технологиите зад{' '}
              <span className="text-gradient">успешния бизнес</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-7 sm:mb-8 max-w-xl animate-slide-up delay-200 leading-relaxed">
              Изграждаме професионални уеб решения, специализиран софтуер за образованието и надеждна ИТ инфраструктура за бизнеса.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-slide-up delay-300">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact">Обсъди своя проект</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/web-solutions" className="inline-flex items-center justify-center gap-2">
                  Разгледай услугите
                  <Icon name="ArrowRight" size={18} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column — image + cards (desktop & tablet) */}
          <div className="hidden md:flex flex-col gap-4 min-w-0 animate-fade-in delay-200">
            <div className="relative overflow-hidden rounded-2xl aspect-[16/7] shadow-xl">
              <img
                src="/images/sections/hero-team.webp"
                alt="Екипът на TideLayer при работа в офиса"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="sync"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {heroCards.map((card, i) => (
                <Link
                  key={card.title}
                  to={card.href}
                  className="card-elevated p-5 animate-slide-up hover:border-blue-300 transition-colors block"
                  style={{ animationDelay: `${300 + i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                      <Icon name={card.icon} size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900 text-sm mb-0 truncate">{card.title}</p>
                      <p className="text-xs text-slate-500 mb-0 truncate">{card.subtitle}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {card.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={13} className="text-green-500 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile: hero image + compact service cards */}
          <div className="md:hidden flex flex-col gap-3.5 min-w-0 animate-fade-in delay-300">
            <div className="relative overflow-hidden rounded-2xl aspect-video shadow-lg">
              <img
                src="/images/sections/hero-team.webp"
                alt="Екипът на TideLayer при работа"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="sync"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-2.5">
              {heroCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.href}
                  className="card p-3 sm:p-4 flex items-center gap-2.5 min-w-0 hover:border-blue-300"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <Icon name={card.icon} size={18} />
                  </div>
                  <span className="font-semibold text-navy-900 text-xs sm:text-sm leading-tight min-w-0 break-words">
                    {card.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hidden lg:block absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <Icon name="MousePointer2" size={24} className="text-slate-400" />
      </div>
    </section>
  );
}

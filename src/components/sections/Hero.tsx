import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { brandConfig } from '../../config/brand';

const heroCards = [
  {
    icon: 'Globe',
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Уеб решения',
    subtitle: 'Уебсайтове & Приложения',
    items: ['Корпоративен портал', 'E-commerce платформа', 'API интеграции'],
  },
  {
    icon: 'GraduationCap',
    iconBg: 'bg-cyan-100 text-cyan-600',
    title: 'Училищни решения',
    subtitle: 'Софтуер & ИТ поддръжка',
    items: ['График на дежурства', 'Система за заявки', 'Инвентарна система'],
  },
  {
    icon: 'Server',
    iconBg: 'bg-navy-100 text-navy-600',
    title: 'Мрежи и ИТ',
    subtitle: 'Инфраструктура & Поддръжка',
    items: ['Wi-Fi 6/7 инсталация', 'Сървъри & NAS', 'Месечна ИТ поддръжка'],
  },
  {
    icon: 'Cpu',
    iconBg: 'bg-slate-100 text-slate-600',
    title: 'Хардуерен сервиз',
    subtitle: 'Диагностика & Ремонт',
    items: ['PC диагностика', 'Ъпгрейд & ремонт', 'Сглобяване на ПК'],
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24" aria-labelledby="hero-title">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="max-w-2xl animate-fade-in">
            <Badge variant="accent" size="md" className="mb-6 animate-slide-up">
              {brandConfig.tagline}
            </Badge>
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-navy-900 leading-[1.1] tracking-tight mb-6 animate-slide-up delay-100"
            >
              Технологиите зад{' '}
              <span className="text-gradient">успешния бизнес</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl animate-slide-up delay-200 leading-relaxed">
              Изграждаме професионални уеб решения, специализиран софтуер за образованието и надеждна ИТ инфраструктура за бизнеса.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-slide-up delay-300">
              <Button size="lg" asChild>
                <Link to="/contact">Обсъди своя проект</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/web-solutions" className="inline-flex items-center gap-2">
                  Разгледай услугите
                  <Icon name="ArrowRight" size={18} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column — image + cards (desktop) */}
          <div className="hidden md:flex flex-col gap-4 animate-fade-in delay-200">
            {/* Hero photo */}
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
            {/* Service cards */}
            <div className="grid grid-cols-2 gap-4">
              {heroCards.map((card, i) => (
                <div
                  key={card.title}
                  className="card-elevated p-5 animate-slide-up"
                  style={{ animationDelay: `${300 + i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                      <Icon name={card.icon} size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">{card.title}</p>
                      <p className="text-xs text-slate-500">{card.subtitle}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {card.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={13} className="text-green-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: hero image + compact service cards */}
          <div className="md:hidden flex flex-col gap-4 animate-fade-in delay-300">
            {/* Photo on mobile */}
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
            {/* Service cards compact grid */}
            <div className="grid grid-cols-2 gap-3">
              {heroCards.map((card) => (
                <div key={card.title} className="card p-4 flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                    <Icon name={card.icon} size={18} />
                  </div>
                  <p className="font-semibold text-navy-900 text-sm leading-tight">{card.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <Icon name="MousePointer2" size={24} className="text-slate-400" />
      </div>
    </section>
  );
}

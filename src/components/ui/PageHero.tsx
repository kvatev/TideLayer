import type { ReactNode } from 'react';
import { Icon } from './Icon';

export type HeroTheme =
  | 'web'
  | 'education'
  | 'networks'
  | 'servers'
  | 'support'
  | 'hardware'
  | 'portfolio'
  | 'contact'
  | 'legal';

interface PageHeroProps {
  children: ReactNode;
  className?: string;
  accent?: 'blue' | 'cyan' | 'slate';
  theme?: HeroTheme;
  ariaLabelledby?: string;
}

const themeConfig: Record<
  HeroTheme,
  {
    image: string;
    icon: string;
    badge: string;
    stats: { label: string; value: string }[];
    glow1: string;
    glow2: string;
    accentBorder: string;
  }
> = {
  web: {
    image: '/images/sections/web-dev.webp',
    icon: 'Globe',
    badge: 'Съвременни уеб технологии',
    stats: [
      { label: 'Скорост & SEO', value: '99+ Core Vitals' },
      { label: 'Дизайн', value: 'Mobile-First UI' },
    ],
    glow1: 'bg-blue-600/25',
    glow2: 'bg-cyan-500/15',
    accentBorder: 'border-blue-500/30',
  },
  education: {
    image: '/images/sections/education.webp',
    icon: 'GraduationCap',
    badge: 'Дигитално образование',
    stats: [
      { label: 'Внедряване', value: 'Български училища' },
      { label: 'Достъпност', value: 'Облачна система' },
    ],
    glow1: 'bg-cyan-500/25',
    glow2: 'bg-blue-500/15',
    accentBorder: 'border-cyan-400/30',
  },
  networks: {
    image: '/images/sections/network.webp',
    icon: 'Network',
    badge: 'Мрежова архитектура',
    stats: [
      { label: 'Стабилност', value: '99.9% Uptime' },
      { label: 'Сигурност', value: 'VLAN & Firewall' },
    ],
    glow1: 'bg-blue-600/25',
    glow2: 'bg-indigo-500/15',
    accentBorder: 'border-blue-400/30',
  },
  servers: {
    image: '/images/sections/network.webp',
    icon: 'Server',
    badge: 'Сървъри & Критични данни',
    stats: [
      { label: 'Защита', value: 'Автоматичен Backup' },
      { label: 'Мониторинг', value: '24/7 Наблюдение' },
    ],
    glow1: 'bg-blue-600/25',
    glow2: 'bg-cyan-500/15',
    accentBorder: 'border-blue-400/30',
  },
  support: {
    image: '/images/sections/it-support.webp',
    icon: 'Shield',
    badge: 'Корпоративна ИТ поддръжка',
    stats: [
      { label: 'Реакция', value: 'Приоритетен SLA' },
      { label: 'Превенция', value: '24/7 Мониторинг' },
    ],
    glow1: 'bg-blue-600/25',
    glow2: 'bg-cyan-500/15',
    accentBorder: 'border-blue-400/30',
  },
  hardware: {
    image: '/images/sections/hardware.webp',
    icon: 'Cpu',
    badge: 'Хардуерна диагностика & Сервиз',
    stats: [
      { label: 'Диагностика', value: 'Прецизни тестове' },
      { label: 'Компоненти', value: 'Професионален клас' },
    ],
    glow1: 'bg-blue-500/20',
    glow2: 'bg-slate-400/15',
    accentBorder: 'border-slate-400/30',
  },
  portfolio: {
    image: '/images/sections/office.webp',
    icon: 'Layout',
    badge: 'Реални внедрени проекти',
    stats: [
      { label: 'Уеб & Системи', value: 'Работещи решения' },
      { label: 'Подход', value: 'Чист код & UX' },
    ],
    glow1: 'bg-blue-600/25',
    glow2: 'bg-cyan-500/15',
    accentBorder: 'border-blue-400/30',
  },
  contact: {
    image: '/images/sections/hero-team.webp',
    icon: 'MessageSquare',
    badge: 'Директна връзка с екипа',
    stats: [
      { label: 'Отговор', value: 'До 1 работен ден' },
      { label: 'Консултация', value: 'Безплатен анализ' },
    ],
    glow1: 'bg-blue-600/25',
    glow2: 'bg-cyan-500/15',
    accentBorder: 'border-blue-400/30',
  },
  legal: {
    image: '/images/sections/office.webp',
    icon: 'FileText',
    badge: 'Правна информация',
    stats: [
      { label: 'Прозрачност', value: 'GDPR Съответствие' },
      { label: 'Сигурност', value: 'Защита на данните' },
    ],
    glow1: 'bg-blue-700/15',
    glow2: 'bg-slate-500/10',
    accentBorder: 'border-slate-500/30',
  },
};

export function PageHero({
  children,
  className = '',
  accent = 'blue',
  theme,
  ariaLabelledby,
}: PageHeroProps) {
  const resolvedTheme: HeroTheme =
    theme ?? (accent === 'cyan' ? 'education' : accent === 'slate' ? 'hardware' : 'web');
  const cfg = themeConfig[resolvedTheme];

  return (
    <section
      className={`section-xl relative overflow-hidden bg-navy-900 text-white ${className}`}
      aria-labelledby={ariaLabelledby}
    >
      {/* 1. Thematic background photo with multi-layer gradient mask */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <img
          src={cfg.image}
          alt=""
          className="w-full h-full object-cover object-center opacity-25 md:opacity-35"
          loading="eager"
          decoding="async"
        />
        {/* Left-to-right dark gradient so text is 100% readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,18,32,0.97) 0%, rgba(11,18,32,0.90) 48%, rgba(15,25,45,0.68) 100%)',
          }}
        />
        {/* Top & bottom vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,18,32,0.85) 0%, transparent 35%, transparent 70%, rgba(11,18,32,0.92) 100%)',
          }}
        />
      </div>

      {/* 2. Radial glow orbs */}
      <div
        className={`absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full blur-3xl ${cfg.glow1} pointer-events-none`}
        aria-hidden="true"
      />
      <div
        className={`absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full blur-3xl ${cfg.glow2} pointer-events-none`}
        aria-hidden="true"
      />

      {/* 3. Subtle architectural grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(to right, #93C5FD 1px, transparent 1px), linear-gradient(to bottom, #93C5FD 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 4. Top & bottom glowing border lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.45) 35%, rgba(34,211,238,0.45) 65%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.35) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* 5. Content + Thematic floating visual card on large screens */}
      <div className="relative z-10 container">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="min-w-0 lg:col-span-8 [&_.container]:px-0 [&_.container]:max-w-none">
            {children}
          </div>

          {/* Right side thematic glass card (desktop) */}
          {resolvedTheme !== 'legal' && (
            <div className="hidden lg:block lg:col-span-4 min-w-0 animate-fade-in">
              <div
                className={`relative rounded-2xl border ${cfg.accentBorder} bg-navy-800/65 backdrop-blur-md p-6 shadow-2xl overflow-hidden`}
              >
                {/* Preview image inside card */}
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-5 border border-white/10">
                  <img
                    src={cfg.image}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-900/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/90 text-white shadow-md">
                      <Icon name={cfg.icon} size={18} />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-white/95">
                      {cfg.badge}
                    </span>
                  </div>
                </div>

                {/* Thematic key metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {cfg.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5"
                    >
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                        {stat.label}
                      </p>
                      <p className="text-sm font-bold text-white mb-0">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

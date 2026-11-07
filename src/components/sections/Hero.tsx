import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { Button, LinkButton } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { brandConfig } from '../../config/brand';

export function Hero() {
  return (
    <section className="relative section-xl md:section-xxl overflow-hidden" aria-labelledby="hero-title">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="max-w-2xl animate-fade-in">
            <Badge variant="accent" size="md" className="mb-6 animate-slide-up">
              {brandConfig.tagline}
            </Badge>
            <h1
              id="hero-title"
              className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-navy-900 leading-[1.1] tracking-tight mb-6 animate-slide-up delay-100"
            >
              Технологиите зад{' '}
              <span className="text-gradient">успешния бизнес</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl animate-slide-up delay-200">
              Изграждаме професионални уеб решения, специализиран софтуер за образованието и надеждна ИТ инфраструктура за бизнеса.
            </p>
            <div className="flex flex-wrap items-center gap-4 animate-slide-up delay-300">
              <Button size="lg" asChild>
                <Link to="/contact">Обсъди своя проект</Link>
              </Button>
              <LinkButton to="/web-solutions" variant="secondary" size="lg">
                Разгледай услугите
                <Icon name="ArrowRight" size={18} />
              </LinkButton>
            </div>
          </div>

          {/* Visual Composition */}
          <div className="relative animate-fade-in delay-200">
            <div className="relative aspect-square md:aspect-[4/3] max-w-full">
              {/* Background grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-slate-200)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-slate-200)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 rounded-3xl" />

              {/* Floating cards */}
              <div className="relative h-full">
                {/* Card 1 - Website */}
                <div className="absolute top-8 left-8 md:top-12 md:left-12 w-64 md:w-72 animate-slide-up delay-300">
                  <div className="card-elevated p-5 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Icon name="Globe" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">Уеб решения</p>
                        <p className="text-xs text-slate-500">Уебсайтове & Приложения</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        Корпоративен портал
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        E-commerce платформа
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        API интеграции
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Education */}
                <div className="absolute top-8 right-8 md:top-12 md:right-12 w-64 md:w-72 animate-slide-up delay-400">
                  <div className="card-elevated p-5 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                        <Icon name="GraduationCap" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">Училищни решения</p>
                        <p className="text-xs text-slate-500">Софтуер & ИТ поддръжка</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        График на дежурства
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        Система за заявки
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        Инвентарна система
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Infrastructure */}
                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 w-64 md:w-72 animate-slide-up delay-500">
                  <div className="card-elevated p-5 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
                        <Icon name="Server" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">Мрежи и ИТ</p>
                        <p className="text-xs text-slate-500">Инфраструктура & Поддръжка</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        Wi-Fi 6/7 инсталация
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        Сървъри & NAS
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        Месечна ИТ поддръжка
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4 - Hardware */}
                <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 w-64 md:w-72 animate-slide-up delay-600">
                  <div className="card p-5 h-full border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Icon name="Cpu" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">Хардуерен сервиз</p>
                        <p className="text-xs text-slate-500">Диагностика & Ремонт</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        PC диагностика
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        ъпгрейд & ремонт
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Icon name="Check" size={14} className="text-green-500" />
                        Сглобяване на ПК
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center connecting element */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative flex h-24 w-24 md:h-32 md:w-32 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
                    <div className="absolute inset-4 rounded-full border-2 border-cyan-200 animate-pulse" style={{ animationDelay: '500ms' }} />
                    <div className="relative flex h-16 w-16 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
                      <Icon name="Layers" size={28} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <Icon name="MousePointer2" size={24} className="text-slate-400" />
      </div>
    </section>
  );
}
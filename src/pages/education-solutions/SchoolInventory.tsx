import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { educationProducts } from '../../data';
import { PageHero } from '../../components/ui/PageHero';

const product = educationProducts.find(p => p.id === 'school-inventory');

export function SchoolInventory() {
  if (!product) return null;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="education" ariaLabelledby="si-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="si-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-4 max-w-2xl leading-relaxed font-medium">
              {product.tagline}
            </p>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {product.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?product=school-inventory">Заяви демонстрация</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Link to="/education-solutions">Назад към продуктите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Problem & Solution */}
      <section className="section bg-white" aria-labelledby="si-problem">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-fade-in min-w-0">
              <h2 id="si-problem" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Проблемът, който решаваме
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-base sm:text-lg">
                {product.problem}
              </p>
              <ul className="space-y-4">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-0">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/hardware.webp"
                alt="Училищна инвентарна система и оборудване"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-slate-50" aria-labelledby="si-how">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="si-how" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Как работи системата
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              От етикетиране до автоматични отчети — пълният цикъл на управление на активи.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
            {product.howItWorks.map((step, index) => (
              <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg font-heading">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-2">
                  {step}
                </h3>
                <p className="text-slate-600 text-sm mb-0">
                  Бързо сканиране през телефон или таблет с незабавна синхронизация.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="si-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="si-features" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Ключови функционалности
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Комплексен набор от инструменти за пълно управление на имоти и инвентар.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {product.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
                  Поддържа история на движение, отговорници и документи по счетоводни изисквания.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* UI Preview */}
      <section className="section bg-slate-50" aria-labelledby="si-ui">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="si-ui" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Преглед на интерфейса
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              {product.mockupDescription}
            </p>
          </div>

          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-5 items-stretch">
              <div className="min-w-0 md:col-span-3 relative min-h-[200px] sm:min-h-[260px]">
                <img
                  src="/images/sections/hardware.webp"
                  alt="Училищен инвентар и QR проследяване"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />
              </div>
              <div className="min-w-0 md:col-span-2 p-4 sm:p-6 flex flex-col justify-center gap-3 bg-slate-50/70">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Примерни записи на инвентар</p>
                {[
                  { item: 'ПК Кабинет 1 · 18 компютъра', code: 'QR #2041' },
                  { item: 'Интерактивна дъска · Стая 305', code: 'В гаранция' },
                  { item: 'Учителски лаптопи · Етаж 2', code: 'Наличен' },
                ].map((entry) => (
                  <div key={entry.item} className="min-w-0 rounded-xl bg-white border border-slate-200 p-2.5 sm:p-3 flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 text-xs sm:text-sm font-medium text-navy-900 truncate">{entry.item}</span>
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-cyan-100 text-cyan-800">{entry.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="section bg-white" aria-labelledby="si-users">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="si-users" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              За кого е предназначена
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {product.targetUsers.map((user, index) => (
              <Card key={user} variant="outlined" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Icon name="Users" size={32} className="text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-0">
                  {user}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="si-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="si-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Желаете да видите системата в действие?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Запишете се за персонализирана демонстрация и ще ви покажем как системата може да подобри управлението на инвентара във вашето училище.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?product=school-inventory">Заяви демонстрация</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
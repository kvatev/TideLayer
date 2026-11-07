import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { educationProducts } from '../../data';

const product = educationProducts.find(p => p.id === 'duty-scheduler');

export function DutyScheduler() {
  if (!product) return null;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="ds-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="accent" size="md" className="mb-4">
              02. Училищни решения / График на дежурства
            </Badge>
            <h1 id="ds-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {product.tagline}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to={product.cta.href}>{product.cta.label}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/education-solutions">Назад към продуктите</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="section bg-white" aria-labelledby="ds-problem">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 id="ds-problem" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Проблемът, който решаваме
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                {product.problem}
              </p>
              <ul className="space-y-4">
                {[
                  'Ръчно създаване отнема часове от работно време на администрацията',
                  'Чести грешки при ръчно разпределение — дублирани дежурства или празни слотове',
                  'Трудни корекции при промени в часовото разписание или липса на учители',
                  'Липса на прозрачност — учителите не виждат графика до последния момент',
                  'Невъзможност за бърз експорт и печат за разпределение по стаи'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Icon name="X" size={16} className="text-red-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="CalendarClock" size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="section bg-slate-50" aria-labelledby="ds-solution">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ds-solution" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Как {product.name} помага
            </h2>
            <p className="text-lg text-slate-600">
              Автоматизиран, гъвкав и прозрачен процес за управление на дежурствата.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {product.benefits.map((benefit, index) => (
              <Card key={benefit} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 mb-4">
                  <Icon name="CheckCircle2" size={20} />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">
                  {benefit}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Детайли за тази полза ще бъдат добавени при финализиране на продукта.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="ds-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ds-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Основни функционалности
            </h2>
            <p className="text-lg text-slate-600">
              Планираме за пускане следната функционалност. Списъкът е предварителен и се уточнява.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Описание на {feature.toLowerCase()} ще бъде добавенo при финализиране.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-slate-50" aria-labelledby="ds-how">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ds-how" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Как работи
            </h2>
            <p className="text-lg text-slate-600">
              Прост 5-стъпен процес от настройка до публикуване.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {product.howItWorks.map((step, index) => (
              <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-lg font-heading">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">
                  {step}
                </h3>
                <p className="text-slate-600 text-sm">
                  Описание на стъпка {index + 1} ще бъде добавенo при финализиране.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* UI Preview */}
      <section className="section bg-white" aria-labelledby="ds-ui">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 id="ds-ui" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Интерфейс на продукта
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {product.mockupDescription}
              </p>
              <p className="text-sm text-slate-500 italic">
                * Визуализацията е UI концепция, не скрийншот на работна версия.
              </p>
              <div className="mt-8 flex gap-4">
                <Button size="lg" asChild variant="primary">
                  <Link to={product.cta.href}>{product.cta.label}</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Monitor" size={64} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-center text-sm text-slate-600">
                UI концепция — не е работащ софтуер
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="ds-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="ds-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Искате ли да видите продукта в действие?
            </h2>
            <p className="text-slate-300 mb-8">
              Заявете безангажиована демонстрация и ще ви покажем как {product.name.toLowerCase()} може да помогне на вашето училище.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to={product.cta.href}>{product.cta.label}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
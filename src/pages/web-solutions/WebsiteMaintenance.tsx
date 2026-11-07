import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { webSolutionsServices } from '../../data';

const service = webSolutionsServices.find(s => s.id === 'website-maintenance');

export function WebsiteMaintenance() {
  if (!service) return null;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="wm-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              01. Уеб решения / Поддръжка
            </Badge>
            <h1 id="wm-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=website-maintenance">Получете оферта</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/web-solutions">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="section bg-white" aria-labelledby="wm-included">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 id="wm-included" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Какво включва поддръжката
              </h2>
              <ul className="space-y-4">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-blue-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Shield" size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans hint */}
      <section className="section bg-slate-50" aria-labelledby="wm-plans">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wm-plans" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Гъвкави планове за поддръжка
            </h2>
            <p className="text-lg text-slate-600">
              Изберете нивото на поддръжка, което най-добре отговаря на нуждите на вашия бизнес.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Базов',
                price: 'от 150 лв/мес',
                features: ['Мониторинг uptime', 'Сигурностни актуализации', 'Месечен отчет', 'Имейл поддръжка'],
                cta: 'Изберете базов'
              },
              {
                name: 'Стандартен',
                price: 'от 350 лв/мес',
                features: ['Всичко в Базов', 'Performance оптимизация', 'Контент актуализации', 'Приоритетна поддръжка', 'Backup проверки'],
                cta: 'Изберете стандарт',
                popular: true
              },
              {
                name: 'Премиум',
                price: 'от 600 лв/мес',
                features: ['Всичко в Стандартен', 'Развитие на функционалност', 'Настанови посещения', '24/7 аварийна линия', 'Стратегически консултации'],
                cta: 'Изберете премиум'
              }
            ].map((plan) => (
              <Card key={plan.name} variant={plan.popular ? 'elevated' : 'outlined'} padding="lg" hover className={cn('relative flex flex-col', plan.popular && 'border-blue-500 shadow-lg')}>
                {plan.popular && (
                  <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Най-популярен
                  </Badge>
                )}
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold font-heading text-blue-600 mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Icon name="Check" size={14} className="text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full" asChild>
                  <Link to={`/contact?service=website-maintenance&plan=${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white" aria-labelledby="wm-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Users" size={64} />
              </div>
            </div>
            <div className="animate-fade-in">
              <h2 id="wm-benefits" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Защо да ни възложите поддръжката
              </h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="wm-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="wm-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Имате ли нужда от надежна поддръжка?
            </h2>
            <p className="text-slate-300 mb-8">
              Предлагаме гъвкави планове според нуждите на вашия бизнес. Няма дългосрочни договори — само резултати.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=website-maintenance">Получете оферта</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { webSolutionsServices } from '../../data';
import { faqs } from '../../data';

const service = webSolutionsServices.find(s => s.id === 'website-development');

export function WebsiteDevelopment() {
  if (!service) return null;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="wd-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              01. Уеб решения / Уеб разработка
            </Badge>
            <h1 id="wd-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=website-development">Започнете проект</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/web-solutions">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="section bg-white" aria-labelledby="wd-problem">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 id="wd-problem" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Проблеми, които решаваме
              </h2>
              <ul className="space-y-4">
                {[
                  'Липса на професионален онлайн образ, който да вдига اعتمادението на клиентите',
                  'Уебсайт, който не генерира запитвания и продажби',
                  'Лошо мобилно изживяване и бавно зареждане',
                  'Трудно управление на съдържание без технически знания',
                  'Липса на SEO оптимизация и видимост в Google',
                  'Несигурна и zastрела технологична платформа'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Monitor" size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-slate-50" aria-labelledby="wd-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wd-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва уеб разработката
            </h2>
            <p className="text-lg text-slate-600">
              Пълен цикъл от идея до пускане и поддръжка.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Детайли за {feature.toLowerCase()} ще бъдат добавен aqui при финализиране на офертата.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white" aria-labelledby="wd-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="TrendingUp" size={64} />
              </div>
            </div>
            <div className="animate-fade-in">
              <h2 id="wd-benefits" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Бизнес ползи за вас
              </h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon name="ArrowRight" size={16} className="text-blue-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-slate-50" aria-labelledby="wd-process">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wd-process" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашият процес на работа
            </h2>
            <p className="text-lg text-slate-600">
              Структуриран подход, гарантиращ качество и спазване на сроковете.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {service.process?.map((step, index) => (
              <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg font-heading">
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

      {/* FAQ */}
      <section className="section bg-white" aria-labelledby="wd-faq">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wd-faq" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Често задавани въпроси
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.filter(f => ['web-timeline', 'web-cost'].includes(f.id)).map((faq, index) => (
              <details key={faq.id} className="group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <summary className="flex items-center justify-between p-5 bg-slate-50 rounded-xl cursor-pointer list-none transition-colors">
                  <h3 className="text-lg font-semibold text-navy-900 pr-8">{faq.question}</h3>
                  <Icon name="ChevronDown" size={20} className="text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="p-5 pt-0 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="wd-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="wd-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Готови ли сте за вашия нов уебсайт?
            </h2>
            <p className="text-slate-300 mb-8">
              Обсудете ни идеята си и ще ви предложим най-подходящото решение с ясна цена и срокове.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=website-development">Започнете проект</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
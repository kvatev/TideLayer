import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { webSolutionsServices } from '../../data';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

const service = webSolutionsServices.find(s => s.id === 'website-development');

export function WebsiteDevelopment() {
  const { faqs } = useSiteControl();
  if (!service) return null;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="web" ariaLabelledby="wd-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              01. Уеб решения / Уеб разработка
            </Badge>
            <h1 id="wd-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?service=website-development">Започнете проект</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Link to="/web-solutions">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Problem & Solution */}
      <section className="section bg-white" aria-labelledby="wd-problem">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-fade-in min-w-0">
              <h2 id="wd-problem" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Проблеми, които решаваме
              </h2>
              <ul className="space-y-4">
                {[
                  'Липса на професионален онлайн образ, който да изгражда доверие у клиентите',
                  'Уебсайт, който не генерира запитвания и продажби',
                  'Лошо мобилно изживяване и бавно зареждане',
                  'Трудно управление на съдържание без технически знания',
                  'Липса на SEO оптимизация и видимост в Google',
                  'Несигурна и остаряла технологична платформа'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-0">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/web-dev.webp"
                alt="Уеб разработка — програмист при работа"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-slate-50" aria-labelledby="wd-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="wd-features" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва уеб разработката
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Пълен цикъл от идея до пускане и поддръжка.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
                  Индивидуален подход и съвременна архитектура, съобразени с нуждите на вашия проект и бизнес цели.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white" aria-labelledby="wd-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/office.webp"
                alt="Модерен офис — работна среда"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in min-w-0">
              <h2 id="wd-benefits" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Бизнес ползи за вас
              </h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon name="ArrowRight" size={16} className="text-blue-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-0">{benefit}</p>
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
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="wd-process" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашият процес на работа
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Структуриран подход, гарантиращ качество и спазване на сроковете.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
            {service.process?.map((step, index) => (
              <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg font-heading">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-2">
                  {step}
                </h3>
                <p className="text-slate-600 text-sm mb-0">
                  Ясна комуникация и редовна обратна връзка на всеки етап.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.some((f) => ['web-timeline', 'web-cost'].includes(f.id)) && (
        <section className="section bg-white" aria-labelledby="wd-faq">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
              <h2 id="wd-faq" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
                Често задавани въпроси
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.filter(f => ['web-timeline', 'web-cost'].includes(f.id)).map((faq, index) => (
                <details key={faq.id} className="group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <summary className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-slate-50 rounded-xl cursor-pointer list-none transition-colors">
                    <h3 className="text-base sm:text-lg font-semibold text-navy-900">{faq.question}</h3>
                    <Icon name="ChevronDown" size={20} className="text-slate-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="p-4 sm:p-5 pt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="wd-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="wd-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Готови ли сте за вашия нов уебсайт?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Споделете ни идеята си и ще ви предложим най-подходящото решение с ясна цена и срокове.
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
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { educationItSupportService } from '../../data';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

export function SchoolItSupport() {
  const service = educationItSupportService;
  const { faqs } = useSiteControl();
  const visibleFaqs = faqs.filter((f) => ['education-support-scope', 'networks-emergency'].includes(f.id));

  return (
    <div>
      {/* Hero */}
      <PageHero theme="education" ariaLabelledby="sis-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              02. Училищни решения / ИТ поддръжка за училища
            </Badge>
            <h1 id="sis-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?service=school-it-support">Поискайте оферта</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Link to="/education-solutions">Назад към продуктите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="sis-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="sis-features" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва поддръжката
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Пълна грижа за цялата ИТ инфраструктура на училището.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name="LifeBuoy" size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
                  Регулярна профилактика, дистанционна реакция и техническа помощ на място.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-slate-50" aria-labelledby="sis-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/it-support.webp"
                alt="ИТ поддръжка за образователни институции"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in min-w-0">
              <h2 id="sis-benefits" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Защо да изберете нашата ИТ поддръжка
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
      <section className="section bg-white" aria-labelledby="sis-process">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="sis-process" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашият процес на въвеждане
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Структуриран подход за безпроблемно стартиране на партньорството.
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
                  Пълна документация и съгласуване с училищното ръководство.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {visibleFaqs.length > 0 && (
        <section className="section bg-slate-50" aria-labelledby="sis-faq">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
              <h2 id="sis-faq" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
                Често задавани въпроси
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {visibleFaqs.map((faq, index) => (
                <details key={faq.id} className="group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <summary className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-xl cursor-pointer list-none transition-colors border border-slate-200">
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
      <section className="section bg-navy-900 text-white" aria-labelledby="sis-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="sis-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Искате ли да разговаряте за ИТ поддръжката на училището си?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Изпратете ни запитване и ще ви подготвим персонализирана оферта според нуждите на вашето учебно заведение.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=school-it-support">Поискайте оферта</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
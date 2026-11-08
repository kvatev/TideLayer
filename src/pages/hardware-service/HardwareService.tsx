import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { hardwareServices, faqs } from '../../data';
import { PageHero } from '../../components/ui/PageHero';

export function HardwareService() {
  const service = hardwareServices;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="hardware" ariaLabelledby="hs-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              04. Хардуерен сервиз
            </Badge>
            <h1 id="hs-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=hardware-service">Заявете сервиз</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/">Начало</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Note about supplementary service */}
      <section className="section bg-slate-50" aria-labelledby="hs-note">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Icon name="Info" size={16} />
              <span>Допълнителна услуга — не е основен фокус на компанията</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Хардуерният сервиз е допълнителна услуга, която предлагаме предимно на съществуващи клиенти и партньори. 
              Не ние не сме специализиран ремонтен сервиз, а технологична компания, която разбира хардуера като част от цялостното ИТ решение.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="hs-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="hs-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Услуги, които предлагаме
            </h2>
            <p className="text-lg text-slate-600">
              Професионална диагностика и честен подход към всеки случай.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name="Cpu" size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Детайли за {feature.toLowerCase()} ще бъдат добавени при финализиране на офертата.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-slate-50" aria-labelledby="hs-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden animate-scale-in shadow-lg">
              <img
                src="/images/sections/hardware.webp"
                alt="Хардуерен сервиз — компютърни компоненти"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in">
              <h2 id="hs-benefits" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Защо да изберете нашия хардуерен сервиз
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
      <section className="section bg-white" aria-labelledby="hs-process">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="hs-process" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашият процес на работа
            </h2>
            <p className="text-lg text-slate-600">
              Прозрачен и предвидим процес от прием до връщане.
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

      {/* Service Details */}
      <section className="section bg-slate-50" aria-labelledby="hs-details">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="hs-details" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Важно да знаете
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: 'SearchCheck', title: 'Диагностика първо', desc: 'Никога не започваме ремонт без пълна диагностика и съгласие за цена.' },
              { icon: 'Shield', title: 'Гарантия на работата', desc: '3-6 месеца гаранция на труд, плюс производителска гаранция на части.' },
              { icon: 'Package', title: 'Качествени компоненти', desc: 'Използваме проверени доставчици и оригинални/качествени замени.' },
              { icon: 'Truck', title: 'Настанова помощ', desc: 'За бизнеси в Бургас и околията — идваме при вас за диагностика.' },
            ].map((item, index) => (
              <Card key={item.title} variant="outlined" padding="lg" className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name={item.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white" aria-labelledby="hs-faq">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="hs-faq" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Често задавани въпроси
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.filter(f => ['hardware-warranty', 'hardware-onsite'].includes(f.id)).map((faq, index) => (
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
      <section className="section bg-navy-900 text-white" aria-labelledby="hs-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="hs-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Имате нужда от хардуерна диагностика или ремонт?
            </h2>
            <p className="text-slate-300 mb-8">
              Опишете ни проблема и ще се свържем за да преценим какво е необходимо. Честни цени, експертна диагностика, гарантия на резултата.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=hardware-service">Заявете сервиз</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
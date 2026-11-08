import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { networksItServices } from '../../data';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

const service = networksItServices.find(s => s.id === 'network-installation');

export function NetworkInstallation() {
  const { faqs } = useSiteControl();
  if (!service) return null;

  const visibleFaqs = faqs.filter((f) => ['networks-emergency'].includes(f.id));

  return (
    <div>
      {/* Hero */}
      <PageHero theme="networks" ariaLabelledby="ni-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              03. Мрежи и ИТ инфраструктура / Изграждане на мрежи
            </Badge>
            <h1 id="ni-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?service=network-installation">Заявете оферта</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Link to="/networks-it">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="ni-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="ni-features" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва услугата
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Пълен цикъл от проектиране до документация и предаване.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
                  Изпълнява се по стандарти за структурирано окабеляване и корпоративна мрежова сигурност.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-slate-50" aria-labelledby="ni-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/network.webp"
                alt="Мрежова инфраструктура — структуриран кабелинг"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in min-w-0">
              <h2 id="ni-benefits" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Бизнес ползи
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

      {/* Equipment Partners */}
      <section className="section bg-white" aria-labelledby="ni-equipment">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="ni-equipment" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Работим с водещи технологии
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Подбираме най-подходящото оборудване според нуждите и бюджета на проекта.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {['Cisco', 'MikroTik', 'Ubiquiti', 'HP/Aruba'].map((vendor, index) => (
              <Card key={vendor} variant="outlined" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-xl sm:text-2xl font-bold text-navy-900 font-heading">{vendor}</div>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 mb-0">Доказан опит и надеждност</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="section bg-slate-50" aria-labelledby="ni-docs">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="ni-docs" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Пълна проектна документация
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Всеки проект се предава с изчерпателна документация за лесна експлоатация и бъдещо разширение.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
            {[
              'L1/L2/L3 мрежови диаграми',
              'IP адресен план и VLAN схема',
              'Портова карта и схема на окабеляването',
              'Конфигурационни файлове',
              'Runbook за експлоатация',
              'Тестови протоколи и измервания'
            ].map((doc, index) => (
              <Card key={doc} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon name="FileText" size={24} className="text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-0">{doc}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {visibleFaqs.length > 0 && (
        <section className="section bg-white" aria-labelledby="ni-faq">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
              <h2 id="ni-faq" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
                Често задавани въпроси
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {visibleFaqs.map((faq, index) => (
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
      <section className="section bg-navy-900 text-white" aria-labelledby="ni-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="ni-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Планирате ли нова мрежова инфраструктура?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Ще проведем оглед на текущата среда, ще проектираме оптималното решение и ще ви представим ясна оферта с етапи и срокове.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=network-installation">Заявете оферта</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
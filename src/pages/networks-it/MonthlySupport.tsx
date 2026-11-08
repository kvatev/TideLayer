import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { networksItServices } from '../../data';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

const service = networksItServices.find(s => s.id === 'monthly-support');

export function MonthlySupport() {
  const { faqs } = useSiteControl();
  if (!service) return null;

  const visibleFaqs = faqs.filter((f) => ['networks-emergency'].includes(f.id));

  // Pricing tiers for monthly support
  const pricingTiers = [
    {
      name: 'Essential',
      description: 'За малки екипи с базови нужди',
      price: 'от 299 лв/мес',
      features: [
        'Мониторинг на инфраструктура 24/7',
        'Patch management (OS и софтуер)',
        'Backup проверки седмично',
        'Имейл/тикет поддръжка (в работно време)',
        'Квартални превантивни посещения',
        'Базова ИТ документация',
      ],
      cta: 'Изберете Essential',
      popular: false,
    },
    {
      name: 'Professional',
      description: 'За растящи бизнеси с по-високи изисквания',
      price: 'от 599 лв/мес',
      features: [
        'Всичко в Essential',
        'Управление на антивирус и сигурност',
        'Backup тестове за възстановяване (месечно)',
        'Приоритетна поддръжка (телефон + имейл)',
        'Месечни превантивни посещения',
        'Разширена ИТ документация и runbook-и',
        'Стратегическо ИТ планиране (полугодишно)',
        'Управление на доставчици и гаранции',
      ],
      cta: 'Изберете Professional',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'За организации с критични ИТ системи',
      price: 'по споразумение',
      features: [
        'Всичко в Professional',
        '24/7 телефонна поддръжка за критични инциденти',
        'Дедикиран акаунт мениджър',
        'Седмични превантивни посещения',
        'Пълно ИТ стратегическо планиране (квартално)',
        'Обучение на служители за сигурност (квартално)',
        'SLA с гарантирани времена за реакция',
        'Compliance и аудит поддръжка',
        'Disaster recovery тестове (квартално)',
      ],
      cta: 'Свържете се за оферта',
      popular: false,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <PageHero theme="support" ariaLabelledby="ms-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              03. Мрежи и ИТ инфраструктура / Месечна ИТ поддръжка
            </Badge>
            <h1 id="ms-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?service=monthly-support">Изберете план</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Link to="/networks-it">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Intro */}
      <section className="section bg-white" aria-labelledby="ms-intro">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 id="ms-intro" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
              Един партньор за цялата ИТ среда
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              Премахнете несигурността и непредвидимите разходи. Нашата месечна ИТ поддръжка ви дава стабилна,
              сигурна и добре управлявана технологична основа — така че да можете да се фокусирате върху бизнеса.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
              Проактивен мониторинг 24/7, редовни посещения, стратегическо планиране и единствен контакт за всички ИТ въпроси.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="section bg-slate-50" aria-labelledby="ms-pricing">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="ms-pricing" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Три нива на поддръжка
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Изберете плана, който най-добре отговаря на размера и нуждите на вашата организация.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-xl lg:max-w-6xl mx-auto items-stretch">
            {pricingTiers.map((tier, index) => (
              <Card
                key={tier.name}
                variant="elevated"
                padding="xl"
                style={{ animationDelay: `${index * 100}ms` }}
                className={cn(
                  'relative animate-slide-up flex flex-col mt-3 lg:mt-0',
                  tier.popular && 'ring-2 ring-blue-500 shadow-lg'
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="primary" size="sm" className="whitespace-nowrap">Най-популярен</Badge>
                  </div>
                )}
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-2">{tier.name}</h3>
                <p className="text-slate-600 text-sm sm:text-base mb-4">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-2xl sm:text-3xl xl:text-4xl font-bold text-navy-900 font-heading break-words">{tier.price}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm sm:text-base">
                      <Icon name="Check" size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.popular ? 'primary' : 'outline'}
                  asChild
                  className="w-full mt-auto"
                >
                  <Link to={`/contact?service=monthly-support&tier=${tier.name.toLowerCase()}`}>
                    {tier.cta}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included - Detailed */}
      <section className="section bg-white" aria-labelledby="ms-included">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="ms-included" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва всеки план
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name="Shield" size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
                  Включено според избраното ниво на SLA и инфраструктурата на вашата компания.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-slate-50" aria-labelledby="ms-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/it-support.webp"
                alt="ИТ поддръжка — специалист при работа с клиент"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in min-w-0">
              <h2 id="ms-benefits" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Бизнес ползи от месечната поддръжка
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
      {service.process && (
        <section className="section bg-white" aria-labelledby="ms-process">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
              <h2 id="ms-process" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
                Как стартираме партньорството
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Структуриран процес за безпроблемно въвеждане и бързи резултати.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
              {service.process.map((step, index) => (
                <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg font-heading">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-2">
                    {step}
                  </h3>
                  <p className="text-slate-600 text-sm mb-0">
                    Ясно планиран етап без прекъсване на работата на екипа ви.
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {visibleFaqs.length > 0 && (
        <section className="section bg-slate-50" aria-labelledby="ms-faq">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
              <h2 id="ms-faq" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
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
      <section className="section bg-navy-900 text-white" aria-labelledby="ms-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="ms-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Готови ли сте за професионална ИТ поддръжка?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Изберете плана, който ви пасва, или се обърнете към нас за персонализирана оферта. Ще отговорим на всички ваши въпроси.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=monthly-support">Изберете план</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
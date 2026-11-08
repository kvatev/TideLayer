import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { networksItServices, faqs } from '../../data';
import { PageHero } from '../../components/ui/PageHero';

const service = networksItServices.find(s => s.id === 'wifi-lan');

export function WifiLan() {
  if (!service) return null;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="networks" ariaLabelledby="wl-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              03. Мрежи и ИТ инфраструктура / Wi-Fi и LAN
            </Badge>
            <h1 id="wl-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=wifi-lan">Заявете site survey</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/networks-it">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="wl-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wl-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва услугата
            </h2>
            <p className="text-lg text-slate-600">
              От site survey до потребителски опит — всичко за безупречен безжичен достъп.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
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
      <section className="section bg-slate-50" aria-labelledby="wl-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in shadow-lg">
              <img
                src="/images/sections/wifi-lan.webp"
                alt="Корпоративна Wi-Fi и LAN мрежа"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in">
              <h2 id="wl-benefits" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Защо да изберете нашето Wi-Fi решение
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

      {/* Standards & Technologies */}
      <section className="section bg-white" aria-labelledby="wl-standards">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wl-standards" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Стандарти и технологии
            </h2>
            <p className="text-lg text-slate-600">
              Внедряваме най-सъвременните безжични стандарти за максимална производителност и сигурност.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: 'Wifi', title: 'Wi-Fi 6/6E/7', desc: '802.11ax/be — по-високи скорости, по-ниска латентност, по-голяма капацитет' },
              { icon: 'Shield', title: 'WPA3-Enterprise', desc: 'SAE, 802.1X, RADIUS — корпоративно ниво сигурност' },
              { icon: 'RotateCcw', title: 'Безпречен роуминг', desc: '802.11k/v/r, FT — мобилност без прекъсване на връзката' },
              { icon: 'Network', title: 'IoT изолация', desc: 'Отделни VLAN за IoT устройства с микро-сегментация' },
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

      {/* Management Platforms */}
      <section className="section bg-slate-50" aria-labelledby="wl-management">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wl-management" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Централизирано управление
            </h2>
            <p className="text-lg text-slate-600">
              Един панел за цялата безжична инфраструктура — конфигурация, мониторинг, фърмуер, гост-достъп.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['UniFi', 'Meraki', 'Aruba Central'].map((platform, index) => (
              <Card key={platform} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-2xl font-bold text-navy-900 font-heading mb-2">{platform}</div>
                <p className="text-slate-600">Пълна поддръжка и експертиза</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white" aria-labelledby="wl-faq">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wl-faq" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Често задавани въпроси
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.filter(f => ['networks-emergency'].includes(f.id)).map((faq, index) => (
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
      <section className="section bg-navy-900 text-white" aria-labelledby="wl-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="wl-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Искате ли стабилен и бърз Wi-Fi навсякъде?
            </h2>
            <p className="text-slate-300 mb-8">
              Започнете с професионален site survey. Ще анализираме обстановката, ще проектираме покритието и ще внедрим решението.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=wifi-lan">Заявете site survey</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
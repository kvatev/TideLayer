import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { networksItServices } from '../../data';

export function NetworksIt() {
  const services = networksItServices;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="ni-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              03. Мрежи и ИТ инфраструктура
            </Badge>
            <h1 id="ni-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Мрежи и ИТ инфраструктура
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Професионално проектиране, изграждане и поддръжка на мрежова и сървърна инфраструктура за бизнеси и образователни институции.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=network-installation">Заявете оферта</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/">Начало</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section bg-white" aria-labelledby="ni-intro">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 id="ni-intro" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
              Надежна технологична основа за вашия бизнес
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Съвременните организации изискват стабилна, сигурна и мащабируема ИТ инфраструктура. Ние проектираме и внедряваме решения, 
              които поддържат ежедневната работа, растеж на бизнеса и съответствие с регулаторни изисквания.
            </p>
            <p className="text-slate-600 leading-relaxed">
              От структуриран кабелинг и Wi-Fi 6/7 мрежи, през виртуализация и backup, до 24/7 мониторинг и месечна поддръжка — 
              предлагаме пълния цикъл от проектиране до експлоатация.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section bg-slate-50" aria-labelledby="ni-services">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ni-services" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашите услуги
            </h2>
            <p className="text-lg text-slate-600">
              Четири основни направления, покриващи цялото спектър от ИТ инфраструктурни нужди.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={service.id} variant="elevated" padding="xl" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-14 h-14 mb-5 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Icon name={service.icon} size={28} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/networks-it/${service.id}`}>Разгледайте подробно</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight: Monthly Support */}
      <section className="section bg-white" aria-labelledby="ni-highlight">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="primary" size="sm" className="mb-4">Избелена услуга</Badge>
              <h2 id="ni-highlight" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Месечна ИТ поддръжка — спокойствие за вашия бизнес
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Най-пълният начин да гарантирате стабилност на ИТ средата си. Проактивен мониторинг 24/7, 
                редовни превентивни посещения, patch management, стратегическо планиране и единствен контакт за всички ИТ въпроси.
              </p>
              <ul className="space-y-3 mb-8">
                {networksItServices.find(s => s.id === 'monthly-support')?.features.slice(0, 6).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <Icon name="Check" size={18} className="text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" asChild>
                <Link to="/networks-it/monthly-support">Вижте плановете за поддръжка</Link>
              </Button>
            </div>
            <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Monitor" size={80} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us for Networks */}
      <section className="section bg-slate-50" aria-labelledby="ni-why">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ni-why" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Защо да ни изберете за ИТ инфраструктура
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'Shield', title: 'Сигурност на първи план', desc: 'VLAN сегментация, WPA3-Enterprise, RADIUS, VPN, firewall правила и редовни сигурностни аудити.' },
              { icon: 'Network', title: 'Цялостен подход', desc: 'От кабела до облака — проектираме цялата верига: LAN, Wi-Fi, сървъри, backup, мониторинг.' },
              { icon: 'Users', title: 'Експертна екип', desc: 'Сертифицирани мрежови инженери с опит в корпоративни, гостински и образователни среди.' },
              { icon: 'FileText', title: 'Пълна документация', desc: 'L1/L2/L3 диаграми, IP план, портова карта, runbook-и — всичко за лесна поддръжка.' },
              { icon: 'RotateCcw', title: 'Проактивност', desc: 'Мониторинг 24/7 с аларми, редовни проверки, предизвикване на проблеми преди да възникнат.' },
              { icon: 'TrendingUp', title: 'Мащабируемост', desc: 'Архитектура, която расте заедно с вашия бизнес — модулни решения и гъвкави планове.' },
            ].map((item, index) => (
              <Card key={item.title} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name={item.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="ni-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="ni-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Имате нужда от експертна оценка на ИТ инфраструктурата?
            </h2>
            <p className="text-slate-300 mb-8">
              Започнете с аудит на текущата среда или ни запитайте за конкретен проект. Ще ви предложим практично решение с ясни срокове и бюджет.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=network-installation">Заявете консултация</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
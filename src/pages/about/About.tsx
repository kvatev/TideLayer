import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { brandConfig } from '../../config/brand';

export function About() {
  const { name, tagline, contact } = brandConfig;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="about-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              За нас
            </Badge>
            <h1 id="about-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {name}
            </h1>
            <p className="text-xl text-slate-300 mb-6 max-w-2xl leading-relaxed font-medium">
              {tagline}
            </p>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Технологични решения за бизнеси и образование. Базирани в {contact.address.full}, обслужваме клиенти в цяла България.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section bg-white" aria-labelledby="about-mission">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 id="about-mission" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Нашата мисия
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                Да предоставяме практични технологични решения, които помагат на бизнесите и учебните заведения да работят по-ефективно, 
                сигурно и съвременно.
              </p>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Не продаваме "уебсайтове" или "ремонти". Строим дългосрочни партньорства, като разбираме бизнес нуждите на клиентите си 
                и прилагаме технологията там, където създава реална стойност.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Нашият подход комбинира техническа експертиза с бизнес мислене — защото технологията е средство, целта е резултатът.
              </p>
            </div>
            <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Target" size={80} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-slate-50" aria-labelledby="about-values">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="about-values" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашите ценности
            </h2>
            <p className="text-lg text-slate-600">
              Принципите, които водят всяко наше решение и взаимодействие с клиенти.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'Shield', title: 'Надеждност', desc: 'Доставяме каквото обещаваме, в срок и с качество. Клиентите ни знаят, че могат да се базират на нас.' },
              { icon: 'Code', title: 'Техническа отличност', desc: 'Използваме съвременни технологии, чист код, best practices и следваме стандартите на индустрията.' },
              { icon: 'Users', title: 'Партньорски подход', desc: 'Работим за дългосрочен успех, а не за бърза сделка. Вашият успех е нашият успех.' },
              { icon: 'Lightbulb', title: 'Практичност', desc: 'Препоръчваме решения, които решават реални проблеми, а не такива, които звучат ефективно в маркетинг.' },
              { icon: 'Eye', title: 'Прозрачност', desc: 'Ясни цени, честни срокове, отворена комуникация. Без скрити такси и неочаквани изненади.' },
              { icon: 'BookOpen', title: 'Непречно учене', desc: 'Технологията се развива бързо. Ние също — константно усъвършенстваме знанията и уменията си.' },
            ].map((value, index) => (
              <Card key={value.title} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name={value.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="section bg-white" aria-labelledby="about-expertise">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="about-expertise" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Области на експертиза
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: 'Globe', title: 'Уеб технологии', desc: 'React, Next.js, TypeScript, Node.js, PostgreSQL, CMS, API интеграции' },
              { icon: 'Network', title: 'Мрежова инфраструктура', desc: 'LAN/WAN, VLAN, Wi-Fi 6/7, VPN, рутери/суитчове, структуриран кабелинг' },
              { icon: 'Server', title: 'Сървъри и виртуализация', desc: 'Proxmox, VMware, Hyper-V, TrueNAS, backup, DR, мониторинг 24/7' },
              { icon: 'GraduationCap', title: 'Училищни софтуерни продукти', desc: 'Собствени продукти за дежурства, заявки, инвентар — знание на реалните учебни процеси' },
            ].map((area, index) => (
              <Card key={area.title} variant="outlined" padding="lg" className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name={area.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">{area.title}</h3>
                <p className="text-slate-600 text-sm">{area.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Note */}
      <section className="section bg-slate-50" aria-labelledby="about-founder">
        <div className="container">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <Card variant="elevated" padding="xl" className="bg-navy-900 text-white">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Icon name="User" size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-3">Основател и главен консултант</h3>
                  <p className="text-slate-200 mb-4 leading-relaxed">
                    Основателят на TideLayer има опит в образователната система и разбира реалните предизвикателни пред училищата. 
                    Това знание е основата за създаването на нашите специализирани софтуерни продукти за образование.
                  </p>
                  <p className="text-slate-200 leading-relaxed">
                    Комбинацията от техническа експертиза в уеб разработка, мрежова инфраструктура и опит в образователния сектор 
                    ни позволява да предлагаме уникални, практични решения, адресиращи конкретни бизнес и институционални нужди.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="section bg-white" aria-labelledby="about-location">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card variant="elevated" padding="xl" className="text-center animate-fade-in">
              <div className="flex-shrink-0 w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Icon name="MapPin" size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">Местоположение</h3>
              <p className="text-slate-600 leading-relaxed">{contact.address.full}</p>
              <p className="text-slate-500 text-sm mt-2">Обслужваме клиенти в цяла България</p>
            </Card>

            <Card variant="elevated" padding="xl" className="text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex-shrink-0 w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Icon name="Mail" size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">Имейл</h3>
              <a href={`mailto:${contact.email}`} className="text-slate-600 leading-relaxed hover:text-blue-600 transition-colors">
                {contact.email}
              </a>
            </Card>

            <Card variant="elevated" padding="xl" className="text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex-shrink-0 w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Icon name="Phone" size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">Телефон</h3>
              <a href={`tel:${contact.phone}`} className="text-slate-600 leading-relaxed hover:text-blue-600 transition-colors">
                {contact.phone}
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="about-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="about-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Искате ли да работим заедно?
            </h2>
            <p className="text-slate-300 mb-8">
              Ще се радваме да научим повече за вашия проект или предизвикателство. Няма ангажименти за първия разговор.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact">Свържете се с нас</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
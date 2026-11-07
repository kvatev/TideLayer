import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { networksItServices, faqs } from '../../data';

const service = networksItServices.find(s => s.id === 'network-installation');

export function NetworkInstallation() {
  if (!service) return null;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="ni-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              03. Мрежи и ИТ инфраструктура / Изграждане на мрежи
            </Badge>
            <h1 id="ni-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=network-installation">Заявете оферта</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/networks-it">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="ni-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ni-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва услугата
            </h2>
            <p className="text-lg text-slate-600">
              Пълен цикъл от проектиране до документация и прехвърляне.
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
      <section className="section bg-slate-50" aria-labelledby="ni-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Network" size={64} />
              </div>
            </div>
            <div className="animate-fade-in">
              <h2 id="ni-benefits" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Бизнес ползи
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

      {/* Equipment Partners */}
      <section className="section bg-white" aria-labelledby="ni-equipment">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ni-equipment" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Работим с водещи технологии
            </h2>
            <p className="text-lg text-slate-600">
              Подбираме най-подходящото оборудване според нуждите и бюджета на проекта.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {['Cisco', 'MikroTik', 'Ubiquiti', 'HP/Aruba'].map((vendor, index) => (
              <Card key={vendor} variant="outlined" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-2xl font-bold text-navy-900 font-heading">{vendor}</div>
                <p className="text-slate-600 text-sm mt-2">Сертифицирани партньори и опит</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="section bg-slate-50" aria-labelledby="ni-docs">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ni-docs" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Пълна проектна документация
            </h2>
            <p className="text-lg text-slate-600">
              Всеки проект се предава с изчерпателна документация за лесна експлоатация и бъдещо разширение.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              'L1/L2/L3 мрежови диаграми',
              'IP адресен план и VLAN схема',
              'Портова карта и кабелинг схема',
              'Конфигурационни файлове',
              'Runbook за експлоатация',
              'Тестови протоколи и сертификати'
            ].map((doc, index) => (
              <Card key={doc} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon name="FileText" size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900">{doc}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white" aria-labelledby="ni-faq">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="ni-faq" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
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
      <section className="section bg-navy-900 text-white" aria-labelledby="ni-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="ni-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Планирате ли нова мрежова инфраструктура?
            </h2>
            <p className="text-slate-300 mb-8">
              Ще проведем аудит на текущата среда, ще проектираме оптималното решение и ще ви представим ясна оферта с етапи и срокове.
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
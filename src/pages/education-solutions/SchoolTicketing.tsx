import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { educationProducts } from '../../data';
import { PageHero } from '../../components/ui/PageHero';
import { SchoolTicketingDemo } from '../../components/demos/SchoolTicketingDemo';

const product = educationProducts.find(p => p.id === 'school-ticketing');

export function SchoolTicketing() {
  if (!product) return null;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="education" ariaLabelledby="st-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="st-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-4 max-w-2xl leading-relaxed font-medium">
              {product.tagline}
            </p>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {product.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?product=school-ticketing">Заяви демонстрация</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Link to="/education-solutions">Назад към продуктите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Problem & Solution */}
      <section className="section bg-white" aria-labelledby="st-problem">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-fade-in min-w-0">
              <h2 id="st-problem" className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Проблемът, който решаваме
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-base sm:text-lg">
                {product.problem}
              </p>
              <ul className="space-y-4">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-0">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/education.webp"
                alt="Система за управление на задачи и документи в училище"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-slate-50" aria-labelledby="st-how">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="st-how" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Как работи системата
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Интуитивен процес от възлагане до успешно приемане на задача и отчет.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
            {product.howItWorks.map((step, index) => (
              <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg font-heading">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-2">
                  {step}
                </h3>
                <p className="text-slate-600 text-sm mb-0">
                  Пълна проследимост с автоматични известия на всеки етап.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="st-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="st-features" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Ключови функционалности
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Всичко необходимо за ефективно управление на задачи и обмен на документи в училището.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {product.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
                  Оптимизирано за бърза работа от учители, администрация и техническия екип.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive UI Demo Showcase */}
      <section className="section bg-slate-900 text-white" aria-labelledby="st-ui">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Icon name="Sparkles" size={14} />
              <span>Тествайте в реално време</span>
            </div>
            <h2 id="st-ui" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Интерактивна демонстрация на системата
            </h2>
            <p className="text-base text-slate-300 leading-relaxed mb-0">
              Разгледайте училищни задачи по йерархия, карти с прикачени документи (Word, Excel, PDF), 1-годишния архив и бюджета за консумативи в Евро (€).
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-10">
            <SchoolTicketingDemo />
          </div>

          {/* Multi-Tenant Instance Info Block */}
          <div className="max-w-4xl mx-auto p-6 sm:p-7 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-heading font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <Icon name="ShieldCheck" size={18} className="text-emerald-400" />
                <span>Изолирана и защитена инстанция за всяко училище</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mb-0 leading-relaxed max-w-2xl">
                Всяко училище получава своя собствена, изолирана и защитена инстанция (напр.{' '}
                <code className="font-mono bg-slate-950 px-2 py-0.5 rounded text-blue-400 font-semibold">
                  tidelayer.com/school/вашето-училище
                </code>
                ), конфигурирана индивидуално от нашия екип.
              </p>
            </div>

            <Button asChild className="shrink-0 whitespace-nowrap">
              <Link to="/contact?service=education-solutions&plan=school-ticketing">
                Заявете достъп и оферта
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="section bg-white" aria-labelledby="st-users">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="st-users" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              За кого е предназначена
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {product.targetUsers.map((user, index) => (
              <Card key={user} variant="outlined" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Icon name="Users" size={32} className="text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-0">
                  {user}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="st-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="st-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Желаете да видите системата в действие?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Запишете се за персонализирана демонстрация и ще ви покажем как системата може да организира задачите, сроковете и документите във вашето училище.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?product=school-ticketing">Заяви демонстрация</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { webSolutionsServices } from '../../data';

const service = webSolutionsServices.find(s => s.id === 'web-applications');

export function WebApplications() {
  if (!service) return null;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="wa-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              01. Уеб решения / Уеб приложения
            </Badge>
            <h1 id="wa-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=web-applications">Обсудете приложението</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/web-solutions">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="section bg-white" aria-labelledby="wa-problem">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 id="wa-problem" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Проблеми, които решаваме с уеб приложения
              </h2>
              <ul className="space-y-4">
                {[
                  'Ръчни, повтарящи се задачи, които консумират ценно време',
                  'Данни, разпръснати в различни системи и таблици',
                  'Липса на интеграция между CRM, ERP, платежни системи',
                  'Няма реално време визуализация на бизнес показатели',
                  'Трудно мащабиране на процесите при растеж на бизнеса',
                  'Зависост от Excel таблици и имейл комуникация'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="Code" size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-slate-50" aria-labelledby="wa-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wa-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва разработката на уеб приложения
            </h2>
            <p className="text-lg text-slate-600">
              От идея до продакшън — пълен цикъл на разработка.
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

      {/* Tech Stack */}
      <section className="section bg-white" aria-labelledby="wa-tech">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wa-tech" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Технологичен стек
            </h2>
            <p className="text-lg text-slate-600">
              Използваме съвременни, доказани технологии за изграждане на мащабируеми и поддържаеми приложения.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Next.js / React',
              'Node.js / NestJS',
              'PostgreSQL / Prisma',
              'TypeScript',
              'Docker / Kubernetes',
              'AWS / Vercel',
              'GraphQL / REST',
              'Redis / BullMQ'
            ].map((tech) => (
              <Badge key={tech} variant="secondary" size="md" className="px-4 py-2 text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-slate-50" aria-labelledby="wa-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon name="BarChart3" size={64} />
              </div>
            </div>
            <div className="animate-fade-in">
              <h2 id="wa-benefits" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Бизнес ползи от уеб приложението
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
      <section className="section bg-white" aria-labelledby="wa-process">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="wa-process" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Процес на разработка
            </h2>
            <p className="text-lg text-slate-600">
              Agile методология с редовни демо и прозрачност на всеки етап.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {service.process?.map((step, index) => (
              <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-lg font-heading">
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

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="wa-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="wa-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Имате ли идея за уеб приложение?
            </h2>
            <p className="text-slate-300 mb-8">
              Ще ви помогнем да я превърнем в реално, работещ продукт.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=web-applications">Обсудете проекта</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
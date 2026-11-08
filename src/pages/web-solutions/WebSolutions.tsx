import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { webSolutionsServices } from '../../data';
import { PageHero } from '../../components/ui/PageHero';

const VISIBLE_SERVICES = ['website-development', 'website-maintenance'];

export function WebSolutions() {
  return (
    <div>
      {/* Hero */}
      <PageHero theme="web" ariaLabelledby="web-solutions-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              01. Уеб решения
            </Badge>
            <h1 id="web-solutions-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Професионални уеб решения за вашия бизнес
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              От съвременни уебсайтове и кастъм уеб приложения до API интеграции и текуща поддръжка — изграждаме дигиталното присъствие, което поддържа вашия бизнес.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=web-solutions">Започнете проект</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/portfolio">Вижте проекти</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Services Grid */}
      <section className="section bg-white" aria-labelledby="services-title">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="services-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашите уеб услуги
            </h2>
            <p className="text-lg text-slate-600">
              Всеки проект е уникален, но методологията ни е еднаква: качество, прозрачност и бизнес стойност.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {webSolutionsServices.filter(s => VISIBLE_SERVICES.includes(s.id)).map((service) => (
              <Link key={service.id} to={`/web-solutions/${service.id}`} className="group">
                <Card variant="elevated" padding="lg" hover className="h-full flex flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5 group-hover:bg-blue-100 transition-colors">
                    <Icon name={service.icon} size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-navy-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 mb-6 flex-1 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon name="Check" size={14} className="text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {service.features.length > 4 && (
                      <li className="flex items-center gap-2 text-sm text-slate-500">
                        <Icon name="MoreHorizontal" size={14} className="shrink-0" />
                        +{service.features.length - 4} повече
                      </li>
                    )}
                  </ul>
                  <div className="flex items-center gap-1.5 text-blue-600 font-medium group-hover:gap-2.5 transition-all">
                    <span>Научете повече</span>
                    <Icon name="ArrowRight" size={16} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Why choose us for web */}
          <div className="mt-16 animate-fade-in">
            <Link
              to="/web-solutions/website-development"
              className="group"
            >
              <Card variant="elevated" padding="xl" className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white mb-5">
                      <Icon name="Target" size={28} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                      Защо да изберете нас за уеб проекта си?
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-xl leading-relaxed">
                      Съвременен стек (Next.js, React, TypeScript), mobile-first подход, SEO от ден нула, Core Web Vitals оптимизация, достъпност WCAG 2.1 AA и лесно управление на съдържание.
                    </p>
                    <div className="flex items-center gap-1.5 text-blue-300 font-medium group-hover:gap-2.5 transition-all">
                      <span>Обсудете проекта</span>
                      <Icon name="ArrowRight" size={18} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { label: 'Next.js', desc: 'React фреймворк' },
                      { label: 'TypeScript', desc: 'Типова сигурност' },
                      { label: 'Tailwind', desc: 'Утилитарен CSS' }
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/10 border border-white/20">
                        <p className="text-lg font-bold font-heading">{item.label}</p>
                        <p className="text-xs text-slate-300">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { webSolutionsServices } from '../../data';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

export function WebSolutions() {
  const siteControl = useSiteControl();
  const hiddenSet = new Set(siteControl.hiddenNavHrefs);
  const visibleServices = webSolutionsServices.filter(
    (s) => !hiddenSet.has(`/web-solutions/${s.id}`)
  );

  return (
    <div>
      {/* Hero */}
      <PageHero theme="web" ariaLabelledby="web-solutions-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="web-solutions-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Професионални уеб решения за вашия бизнес
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              От съвременни уебсайтове и уеб системи до API интеграции и текуща поддръжка — изграждаме дигиталното присъствие, което подкрепя растежа на бизнеса ви.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?service=web-solutions">Започнете проект</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <Link to="/portfolio">Вижте проекти</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Services Grid */}
      <section className="section bg-white" aria-labelledby="services-title">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2 id="services-title" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашите уеб услуги
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Всеки проект е уникален, но методологията ни е еднаква: качество, прозрачност и бизнес стойност.
            </p>
          </div>

          {visibleServices.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {visibleServices.map((service) => (
                <Link key={service.id} to={`/web-solutions/${service.id}`} className="group min-w-0">
                  <Card variant="elevated" padding="lg" hover className="h-full flex flex-col">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5 group-hover:bg-blue-100 transition-colors">
                      <Icon name={service.icon} size={24} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base mb-6 flex-1 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {service.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <Icon name="Check" size={14} className="text-green-500 shrink-0 mt-1" />
                          <span>{feature}</span>
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
          )}

          {/* Why choose us for web */}
          <div className="mt-12 sm:mt-16 animate-fade-in">
            <Link
              to="/web-solutions/website-development"
              className="group block"
            >
              <Card variant="elevated" padding="xl" className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 border-blue-500/40 text-white">
                <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center">
                  <div className="md:col-span-2 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white mb-5">
                      <Icon name="Target" size={28} />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white mb-3">
                      Защо да изберете нас за уеб проекта си?
                    </h3>
                    <p className="text-slate-100/90 mb-6 max-w-xl leading-relaxed text-sm sm:text-base">
                      Съвременен стек (React, Next.js, TypeScript), mobile-first подход, SEO от ден нула, Core Web Vitals оптимизация, достъпност WCAG 2.1 AA и лесно управление на съдържание.
                    </p>
                    <div className="flex items-center gap-1.5 text-blue-200 font-medium group-hover:gap-2.5 transition-all">
                      <span>Обсъдете проекта</span>
                      <Icon name="ArrowRight" size={18} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4 text-center min-w-0">
                    {[
                      { label: 'Next.js', desc: 'React фреймворк' },
                      { label: 'TypeScript', desc: 'Типова сигурност' },
                      { label: 'Tailwind', desc: 'Модерен CSS' }
                    ].map((item, i) => (
                      <div key={i} className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/20 min-w-0">
                        <p className="text-base sm:text-lg font-bold font-heading text-white mb-0.5 break-words">{item.label}</p>
                        <p className="text-xs text-slate-200 mb-0">{item.desc}</p>
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
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { educationProducts, educationItSupportService } from '../../data';

export function EducationSolutions() {
  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="education-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="accent" size="md" className="mb-4">
              02. Училищни решения
            </Badge>
            <h1 id="education-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Специализиран софтуер и ИТ поддръжка за училища
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Три продукта, разработени за реалните нужди на българските училища, и пълна техническа грижа за ИТ инфраструктурата.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=education-solutions">Обсудете потребностите</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/portfolio">Вижте UI концепции</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section bg-white" aria-labelledby="products-title">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="products-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Нашите продукти за образованието
            </h2>
            <p className="text-lg text-slate-600">
              Всеки продукт решава конкретен проблем, с който се сблъскват българските училища ежедневно.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {educationProducts.map((product) => (
              <Link key={product.id} to={product.cta.href.replace('/contact?product=', '/education-solutions/')} className="group">
                <Card variant="elevated" padding="lg" hover className="h-full flex flex-col">
                  <div className="relative aspect-video bg-slate-100 rounded-xl mb-5 overflow-hidden group-hover:opacity-90 transition-opacity">
                    <img
                      src="/images/sections/education.webp"
                      alt="Образователни технологии в класна стая"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <Badge variant="accent" className="absolute top-3 left-3">
                      Продукт
                    </Badge>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-navy-900 mb-2 group-hover:text-cyan-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 flex-1 leading-relaxed">
                    {product.tagline}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-cyan-600 group-hover:gap-2.5 transition-all">
                    <span>Вижте продукта</span>
                    <Icon name="ArrowRight" size={16} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Education IT Support */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              to="/education-solutions/school-it-support"
              className="md:col-span-2 group"
            >
              <Card variant="elevated" padding="lg" hover className="h-full flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 mb-5 group-hover:bg-cyan-200 transition-colors">
                  <Icon name="LifeBuoy" size={24} />
                </div>
                <h3 className="text-2xl font-heading font-bold text-navy-900 mb-3">
                  ИТ поддръжка за училища
                </h3>
                <p className="text-slate-600 mb-6 flex-1 leading-relaxed">
                  Пълна техническа грижа за компютърни кабинети, мрежи, сървъри, принтери и цялата ИТ инфраструктура на училището.
                </p>
                <ul className="space-y-2 mb-6">
                  {educationItSupportService.features.slice(0, 6).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Icon name="Check" size={14} className="text-cyan-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1.5 text-cyan-600 font-medium group-hover:gap-2.5 transition-all">
                  <span>Поискайте оферта</span>
                  <Icon name="ArrowRight" size={16} />
                </div>
              </Card>
            </Link>

            <Link
              to="/education-solutions"
              className="group"
            >
              <Card variant="outlined" padding="lg" hover className="h-full flex flex-col text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 mx-auto mb-5 group-hover:bg-slate-200 transition-colors">
                  <Icon name="ArrowRight" size={24} />
                </div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">
                  Всички училищни решения
                </h3>
                <p className="text-slate-600 mb-6 flex-1">
                  Разгледайте пълния портфолио от продукти и услуги за образованието.
                </p>
                <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium group-hover:gap-2.5 transition-all">
                  <span>Разгледай</span>
                  <Icon name="ArrowRight" size={16} />
                </div>
              </Card>
            </Link>
          </div>

          {/* Important note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <Icon name="AlertTriangle" size={24} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Важно уточнение</h3>
                <p className="text-amber-800 leading-relaxed">
                  Ние <strong>не</strong> предлагаме електронни класови дневници или пълни системи за управление на училището (като ЧЗД).
                  Нашите продукти са специализирани инструменти, които допълват съществуващите системи и решават конкретни проблеми:
                  дежурства, вътрешни заявки и инвентар.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
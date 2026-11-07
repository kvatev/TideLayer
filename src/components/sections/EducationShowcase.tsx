import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { educationProducts, educationItSupportService } from '../../data';

export function EducationShowcase() {
  return (
    <section className="section bg-white" aria-labelledby="education-title">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
          <h2 id="education-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
            Софтуер за образованието
          </h2>
          <p className="text-lg text-slate-600">
            Три специализирани продукта, разработени за реалните нужди на българските училища, и пълна ИТ поддръжка.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {educationProducts.map((product, index) => (
            <Link
              key={product.id}
              to={product.cta.href.replace('/contact?product=', '/education-solutions/')}
              className="group"
            >
              <Card variant="elevated" padding="lg" hover className="h-full flex flex-col">
                <div className="relative aspect-video bg-slate-100 rounded-xl mb-5 overflow-hidden group-hover:opacity-90 transition-opacity">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Icon name="Monitor" size={48} />
                  </div>
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
      </div>
    </section>
  );
}
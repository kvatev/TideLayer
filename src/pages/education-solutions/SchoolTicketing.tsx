import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { educationProducts } from '../../data';
import { PageHero } from '../../components/ui/PageHero';

const product = educationProducts.find(p => p.id === 'school-ticketing');

export function SchoolTicketing() {
  if (!product) return null;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="education" ariaLabelledby="st-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              02. Училищни решения / Училищна система за заявки
            </Badge>
            <h1 id="st-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-xl text-slate-300 mb-6 max-w-2xl leading-relaxed font-medium">
              {product.tagline}
            </p>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {product.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?product=school-ticketing">Заяви демонстрация</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/education-solutions">Назад към продуктите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Problem & Solution */}
      <section className="section bg-white" aria-labelledby="st-problem">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 id="st-problem" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Проблемът, който решаваме
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                {product.problem}
              </p>
              <ul className="space-y-4">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in shadow-lg">
              <img
                src="/images/sections/education.webp"
                alt="Система за технически заявки в училище"
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
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="st-how" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Как работи системата
            </h2>
            <p className="text-lg text-slate-600">
              Интуитивен процес от подаване до затваряне на заявка.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {product.howItWorks.map((step, index) => (
              <Card key={step} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg font-heading">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">
                  {step}
                </h3>
                <p className="text-slate-600 text-sm">
                  Детайли за стъпка {index + 1} ще бъдат добавени при финализиране.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="st-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="st-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Ключови функционалности
            </h2>
            <p className="text-lg text-slate-600">
              Всичко необходимо за ефективно управление на заявки в училището.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Детайли за {feature.toLowerCase()} ще бъдат добавени при финализиране на продукта.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* UI Preview */}
      <section className="section bg-slate-50" aria-labelledby="st-ui">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="st-ui" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Преглед на интерфейса
            </h2>
            <p className="text-lg text-slate-600">
              Концептуален дизайн на потребителския интерфейс.
            </p>
          </div>

          <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden max-w-5xl mx-auto animate-scale-in">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4 p-8 text-center">
              <Icon name="LayoutDashboard" size={64} />
              <div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">UI концепция</h3>
                <p className="text-slate-600 max-w-md">
                  {product.mockupDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="section bg-white" aria-labelledby="st-users">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="st-users" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              За кого е предназначена
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {product.targetUsers.map((user, index) => (
              <Card key={user} variant="outlined" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Icon name="Users" size={32} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900">
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
            <h2 id="st-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Желаете да видите системата в действие?
            </h2>
            <p className="text-slate-300 mb-8">
              Запишете се за персонализирана демонстрация и ще ви покажем как системата може да подобри управлението на заявки във вашето училище.
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
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';
import { brandConfig } from '../../config/brand';

export function Divisions() {

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
    navy: 'bg-navy-50 text-navy-600 hover:bg-navy-100',
    slate: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
  };

  const iconComponents: Record<string, string> = {
    Globe: 'Globe',
    GraduationCap: 'GraduationCap',
    Server: 'Server',
    Cpu: 'Cpu'
  };

  return (
    <section className="section bg-slate-50" aria-labelledby="divisions-title">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
          <h2 id="divisions-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
            Нашите основни направления
          </h2>
          <p className="text-lg text-slate-600">
            Четири специализирани раздела, които заедно осигуряват пълната технологична подкрепа за вашия бизнес или учебно заведение.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brandConfig.divisions.map((division, index) => (
            <Link
              key={division.id}
              to={division.href}
              className="group"
            >
              <Card
                variant="elevated"
                padding="lg"
                hover
                className="h-full flex flex-col text-center"
              >
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-xl mx-auto mb-5 transition-colors duration-300',
                    colorClasses[division.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon name={iconComponents[division.icon] || 'Layers'} size={28} />
                </div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {division.label}
                </h3>
                <p className="text-slate-600 mb-6 flex-1 leading-relaxed">
                  {division.description}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 group-hover:gap-2.5 transition-all">
                  <span>Разгледай</span>
                  <Icon name="ArrowRight" size={16} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
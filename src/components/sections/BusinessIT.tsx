import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';
import { networksItServices } from '../../data';

export function BusinessIT() {
  return (
    <section className="section bg-slate-50" aria-labelledby="business-it-title">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
          <h2 id="business-it-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
            ИТ инфраструктура за бизнес
          </h2>
          <p className="text-lg text-slate-600">
            Надежни мрежи, сървъри и проактивна поддръжка, които поддържат непрекъснато работния процес на вашата организация.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {networksItServices.map((service) => (
            <Link
              key={service.id}
              to={`/networks-it/${service.id}`}
              className="group"
            >
              <Card variant="elevated" padding="lg" hover className="h-full flex flex-col text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100 text-navy-600 mx-auto mb-5 group-hover:bg-navy-200 transition-colors">
                  <Icon name={service.icon} size={24} />
                </div>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 mb-6 flex-1 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-navy-600 group-hover:gap-2.5 transition-all">
                  <span>Научете повече</span>
                  <Icon name="ArrowRight" size={16} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Monthly support highlight */}
        <div className="animate-fade-in">
          <Link
            to="/networks-it/monthly-support"
            className="group"
          >
            <Card variant="elevated" padding="xl" className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-5">
                    <Icon name="Shield" size={28} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                    Месечна ИТ поддръжка за бизнес
                  </h3>
                  <p className="text-slate-300 mb-6 max-w-xl leading-relaxed">
                    Проактивен мониторинг 24/7, patch management, сигурност, backup проверки и стратегическо планиране — всичко в един предвидим месечен бюджет.
                  </p>
                  <div className="flex items-center gap-1.5 text-blue-400 font-medium group-hover:gap-2.5 transition-all">
                    <span>Изберете план</span>
                    <Icon name="ArrowRight" size={18} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: '24/7', desc: 'Мониторинг' },
                    { label: 'SLA', desc: 'Гарантиран отговор' },
                    { label: 'Експертен', desc: 'Екип' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-2xl font-bold font-heading text-blue-400">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
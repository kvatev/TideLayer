import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';

export function BusinessIT() {
  return (
    <section className="section bg-slate-50" aria-labelledby="business-it-title">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
          <h2 id="business-it-title" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
            ИТ инфраструктура за бизнес
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Надеждни мрежи, сървъри и проактивна поддръжка, които поддържат непрекъснато работния процес на вашата организация.
          </p>
        </div>

        {/* Monthly support highlight */}
        <div className="animate-fade-in">
          <Link to="/networks-it/monthly-support" className="group block">
            <Card variant="elevated" padding="xl" className="bg-navy-900 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 border-navy-700 text-white">
              <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center">
                <div className="md:col-span-2 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-5">
                    <Icon name="Shield" size={28} />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white mb-3">
                    Месечна ИТ поддръжка за бизнес
                  </h3>
                  <p className="text-slate-300 mb-6 max-w-xl leading-relaxed text-sm sm:text-base">
                    Проактивен мониторинг 24/7, patch management, сигурност, backup проверки и стратегическо планиране — всичко в един предвидим месечен бюджет.
                  </p>
                  <div className="flex items-center gap-1.5 text-blue-400 font-medium group-hover:gap-2.5 transition-all">
                    <span>Изберете план</span>
                    <Icon name="ArrowRight" size={18} />
                  </div>
                </div>
                <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4 text-center min-w-0">
                  {[
                    { label: '24/7', desc: 'Мониторинг' },
                    { label: 'SLA', desc: 'Бърз отговор' },
                    { label: 'Екип', desc: 'Експерти' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 min-w-0">
                      <p className="text-xl sm:text-2xl font-bold font-heading text-blue-400 mb-0.5">{item.label}</p>
                      <p className="text-xs text-slate-300 mb-0">{item.desc}</p>
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

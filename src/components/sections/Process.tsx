import { Card } from '../ui/Card';

export function Process() {
  const steps = [
    {
      number: '01',
      title: 'Анализ на нуждите',
      description: 'Разбираме вашите бизнес цели, текущи предизвикателства, бюджет и очаквани резултати. Провеждаме интервюта с ключови страни и аудит на съществуващата инфраструктура.'
    },
    {
      number: '02',
      title: 'Предложение и планиране',
      description: 'Изготвяме детайлно техническо предложение с архитектура, технологичен стек, етапи, срокове и фиксирана цена. Свистим и потвърждаваме плана заедно с вас.'
    },
    {
      number: '03',
      title: 'Реализация и тестване',
      description: 'Разработваме в кратки итерации с редовни демо сесии. Провеждаме автоматизирани и ръчни тестове, code review, security audit и performance оптимизация.'
    },
    {
      number: '04',
      title: 'Внедряване и обучение',
      description: 'Пуснаме в продукция с минимален downtime. Обучаваме вашия екип, предаваме документация и runbook-и, осигуряваме плавен преход.'
    },
    {
      number: '05',
      title: 'Поддръжка и развитие',
      description: 'Мониторим стабилността, прилагаме сигурностни актуализации, развиваме нова функционалност според нуждите ви и провеждаме редовни стратегически прегледи.'
    }
  ];

  return (
    <section className="section bg-slate-50" aria-labelledby="process-title">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
          <h2 id="process-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
            Как работим заедно
          </h2>
          <p className="text-lg text-slate-600">
            Структуриран процес, който гарантира яснота, предвидимост и качество на всеки етап.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-16 bottom-16 w-0.5 bg-slate-200 -translate-x-1/2" aria-hidden="true" />

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-0 relative">
            {steps.map((step, index) => (
              <div key={step.number} className="relative lg:px-4">
                <div className="relative z-10">
                  <Card variant="elevated" padding="lg" className="h-full animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg md:text-xl font-heading">
                        {step.number}
                      </span>
                      <h3 className="text-xl font-heading font-bold text-navy-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </Card>

                  {/* Circle on the line */}
                  <div className="hidden lg:block absolute left-1/2 top-16 w-4 h-4 rounded-full bg-blue-600 border-4 border-white -translate-x-1/2 z-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';

export function WhyChooseUs() {
  const reasons = [
    {
      icon: 'Layers',
      title: 'Комбинация от софтуер и инфраструктура',
      description: 'Единствен партньор, който разбира и уеб приложенията, и мрежовата основа, на която те работят.'
    },
    {
      icon: 'Target',
      title: 'Практично ориентиран подход',
      description: 'Фокусираме се върху бизнес стойност и решаване на реални проблеми, а не върху технологии заради технологиите.'
    },
    {
      icon: 'Settings',
      title: 'Персонализирани решения',
      description: 'Нямаме универсални пакети. Всеки проект се адаптира към конкретните нужди, бюджет и процес на клиента.'
    },
    {
      icon: 'Shield',
      title: 'Дългосрочна техническа поддръжка',
      description: 'Не оставяме проекта след пускането. Осигуряваме поддръжка, развитие и сигурност за години напред.'
    },
    {
      icon: 'Users',
      title: 'Един партньор за различни нужди',
      description: 'Уеб, софтуер за образование, мрежи, сървъри, хардуер — цялата технологична верига на едно място.'
    },
    {
      icon: 'CheckCircle2',
      title: 'Прозрачност и честни цени',
      description: 'Ясни оферти, фиксирани цени за дефиниран обхват, без скрити такси и неочаквани разходи.'
    }
  ];

  return (
    <section className="section bg-white" aria-labelledby="why-title">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
          <h2 id="why-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
            Защо TideLayer Technologies
          </h2>
          <p className="text-lg text-slate-600">
            Избирайте ни не защото сме най-големи, а защото сме най-добро подходящи за дългосрочен технологичен партньор.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <Card
              key={reason.title}
              variant="elevated"
              padding="lg"
              hover
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5">
                <Icon name={reason.icon} size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold text-navy-900 mb-3">
                {reason.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {reason.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
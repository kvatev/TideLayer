import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { educationTeacherTrainingService } from '../../data';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

interface TrainingModule {
  id: string;
  icon: string;
  audience: string;
  duration: string;
  title: string;
  description: string;
  topics: string[];
}

const trainingModules: TrainingModule[] = [
  {
    id: 'Мрежова грамотност',
    icon: 'Wifi',
    audience: 'За всички педагогически специалисти',
    duration: '1 ден (4 уч. часа)',
    title: 'Мрежова грамотност и работа с училищната ИТ среда',
    description:
      'Практическо обучение за уверена ежедневна работа с училищната локална и безжична мрежа, свързване на устройства в час и бърза реакция при често срещани технически ситуации.',
    topics: [
      'Устройство на училищната LAN и Wi-Fi мрежа — учителска, ученическа и гост мрежа',
      'Безпроблемно свързване на лаптопи, интерактивни дисплеи, проектори и мрежови принтери',
      'Споделяне на учебни материали и папки във вътрешната мрежа',
      'Първична диагностика при прекъсване на връзката преди подаване на заявка към ИТ екипа'
    ]
  },
  {
    id: 'Киберсигурност в училище',
    icon: 'Shield',
    audience: 'За учители и административен персонал',
    duration: '1 ден (4 уч. часа)',
    title: 'Киберсигурност и защита на данните в училище',
    description:
      'Защита на училищните акаунти, служебната поща и личните данни на ученици и родители срещу съвременни киберзаплахи, фишинг и неправомерен достъп.',
    topics: [
      'Разпознаване на фишинг имейли, фалшиви линкове и зловредни прикачени файлове',
      'Управление на пароли, двуфакторна автентикация (2FA) и служебни профили',
      'Безопасно използване на публични и училищни Wi-Fi мрежи от лични и служебни устройства',
      'Практически правила за опазване на чувствителна информация и GDPR хигиена'
    ]
  },
  {
    id: 'Интерактивни технологии и STEM',
    icon: 'Monitor',
    audience: 'За преподаватели по всички предмети',
    duration: '1–2 дни (6 уч. часа)',
    title: 'Съвременни технологии, STEM кабинети и облачни платформи',
    description:
      'Ефективно използване на модерното оборудване в класната стая и облачните среди за по-ангажиращи уроци и по-лесна организация на учебния процес.',
    topics: [
      'Пълноценна работа с интерактивни дисплеи, мултимедия и периферия в STEM кабинети',
      'Организация на виртуални класни стаи в Google Workspace for Education и Microsoft 365',
      'Съвместна работа с документи, формуляри за тестове и облачни хранилища',
      'Безопасно и практично използване на дигитални и AI инструменти в подготовката на уроци'
    ]
  },
  {
    id: 'Администриране за ИТ координатори',
    icon: 'Server',
    audience: 'За ИТ учители и системни координатори',
    duration: '2 дни (8 уч. часа)',
    title: 'Мрежово и системно администриране за ИТ координатори',
    description:
      'Задълбочен технически модул за учители по информатика и ИТ координатори, отговарящи за компютърните кабинети и локалната инфраструктура на училището.',
    topics: [
      'Управление на компютърни кабинети, потребителски права и групови политики',
      'Основи на VLAN сегментация, DHCP, DNS, рутери и суитчове в училищна среда',
      'Мониторинг на трафика, контрол на достъпа и филтриране на съдържание',
      'Стратегии за архивиране (backup), възстановяване и работа с тикетинг и инвентарни системи'
    ]
  }
];

const trainingFormats = [
  {
    icon: 'Users',
    title: 'Присъствен практикум на място',
    subtitle: 'Във вашето училище',
    description:
      'Провежда се директно в компютърния кабинет или STEM центъра на училището върху реалната техника и мрежа, с които учителите работят всеки ден.'
  },
  {
    icon: 'Clock',
    title: 'Модулна годишна програма',
    subtitle: 'Поетапно надграждане',
    description:
      'Серия от кратки практически сесии, разпределени през учебния срок или година, съобразени със свободното време на педагогическия колектив.'
  },
  {
    icon: 'BookOpen',
    title: 'Хибридно или онлайн обучение',
    subtitle: 'Дистанционен формат',
    description:
      'Интерактивни онлайн сесии с демонстрации на живо, записи за преговор и индивидуални консултации за учителите.'
  }
];

export function TeacherTraining() {
  const service = educationTeacherTrainingService;
  const { faqs } = useSiteControl();
  const visibleFaqs = faqs.filter((f) =>
    ['teacher-training-format', 'education-support-scope'].includes(f.id)
  );

  return (
    <div>
      {/* Hero */}
      <PageHero theme="education" ariaLabelledby="tt-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1
              id="tt-title"
              className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight"
            >
              {service.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact?service=teacher-training">Заявете обучение</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <Link to="/education-solutions">Назад към училищни решения</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Structured Training Modules */}
      <section className="section bg-white" aria-labelledby="tt-modules">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2
              id="tt-modules"
              className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4"
            >
              Тематични направления и модули
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Програмите са разделени по нива и тематика, така че всяко училище да избере най-подходящите модули за своя екип.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {trainingModules.map((mod, index) => (
              <Card
                key={mod.id}
                variant="elevated"
                padding="lg"
                hover
                className="flex flex-col animate-slide-up min-w-0"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 shrink-0">
                    <Icon name={mod.icon} size={24} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      {mod.audience}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700">
                      {mod.duration}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-3 leading-snug">
                  {mod.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
                  {mod.description}
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 flex-1 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Ключови теми в модула
                  </p>
                  <ul className="space-y-2.5">
                    {mod.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Icon name="Check" size={16} className="text-cyan-600 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" asChild className="w-full mt-auto">
                  <Link to={`/contact?service=teacher-training&plan=${encodeURIComponent(mod.id)}`}>
                    Заяви този модул
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="section bg-slate-50" aria-labelledby="tt-formats">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2
              id="tt-formats"
              className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4"
            >
              Формати на провеждане
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Съобразяваме графика и начина на работа с учебната програма и натовареността на преподавателите.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {trainingFormats.map((fmt, index) => (
              <Card
                key={fmt.title}
                variant="elevated"
                padding="lg"
                className="flex flex-col animate-slide-up min-w-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 shrink-0">
                  <Icon name={fmt.icon} size={24} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                  {fmt.subtitle}
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-2">
                  {fmt.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0 flex-1">
                  {fmt.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section bg-white" aria-labelledby="tt-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2
              id="tt-features"
              className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4"
            >
              Какво включва всяко обучение
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Фокус върху реални умения, които се прилагат още на следващия учебен ден.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {service.features.map((feature, index) => (
              <Card
                key={feature}
                variant="elevated"
                padding="lg"
                hover
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <Icon name="GraduationCap" size={24} className="text-cyan-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-0">
                  Практически казуси, адаптирани към конкретната училищна инфраструктура и софтуер.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-slate-50" aria-labelledby="tt-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in shadow-lg min-w-0">
              <img
                src="/images/sections/education.webp"
                alt="Технологични и мрежови обучения за учители"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in min-w-0">
              <h2
                id="tt-benefits"
                className="text-2xl min-[375px]:text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6"
              >
                Защо да изберете нашите обучения
              </h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Icon name="ArrowRight" size={16} className="text-cyan-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-0">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-white" aria-labelledby="tt-process">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
            <h2
              id="tt-process"
              className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4"
            >
              Как организираме обучението
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Ясен процес от първоначалния разговор до провеждането и материалите за учителите.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
            {service.process?.map((step, index) => (
              <Card
                key={step}
                variant="elevated"
                padding="lg"
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-lg font-heading">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-2">
                  {step}
                </h3>
                <p className="text-slate-600 text-sm mb-0">
                  Съгласувано с ръководството и спецификата на учебното заведение.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {visibleFaqs.length > 0 && (
        <section className="section bg-slate-50" aria-labelledby="tt-faq">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
              <h2
                id="tt-faq"
                className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4"
              >
                Често задавани въпроси
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {visibleFaqs.map((faq, index) => (
                <details
                  key={faq.id}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <summary className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-xl cursor-pointer list-none transition-colors border border-slate-200">
                    <h3 className="text-base sm:text-lg font-semibold text-navy-900">
                      {faq.question}
                    </h3>
                    <Icon
                      name="ChevronDown"
                      size={20}
                      className="text-slate-400 shrink-0 group-open:rotate-180 transition-transform duration-200"
                    />
                  </summary>
                  <div className="p-4 sm:p-5 pt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="tt-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2
              id="tt-cta"
              className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4"
            >
              Планирате технологично обучение за педагогическия екип?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Свържете се с нас и ще изготвим програма, съобразена с броя на учителите, наличната техника и целите на вашето училище.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=teacher-training">Заявете обучение</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}


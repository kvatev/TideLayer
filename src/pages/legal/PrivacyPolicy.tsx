import { Link } from 'react-router-dom';
import { brandConfig } from '../../config/brand';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

const LAST_UPDATED = new Date().toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' });

export function PrivacyPolicy() {
  const { name } = brandConfig;
  const { contactInfo } = useSiteControl();
  const email = contactInfo.email;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="legal" ariaLabelledby="privacy-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="privacy-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Политика за поверителност
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-4 max-w-2xl leading-relaxed">
              Последна актуализация: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </PageHero>

      {/* Content */}
      <section className="section bg-white" aria-label="Съдържание на политиката за поверителност">
        <div className="container">
          <div className="grid lg:grid-cols-[240px_1fr] gap-8">
            {/* Table of Contents */}
            <nav className="lg:sticky lg:top-24 lg:self-start animate-fade-in min-w-0" aria-label="Съдържание">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Съдържание</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#intro" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">1. Въведение</a></li>
                <li><a href="#controller" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">2. Администратор на личните данни</a></li>
                <li><a href="#data-collected" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">3. Какви лични данни събираме</a></li>
                <li><a href="#purpose" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">4. Цели и правна основа за обработка</a></li>
                <li><a href="#sharing" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">5. Разкриване на данни към трети страни</a></li>
                <li><a href="#retention" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">6. Съхранение на данни</a></li>
                <li><a href="#cookies" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">7. Бисквитки и подобни технологии</a></li>
                <li><a href="#rights" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">8. Вашите права</a></li>
                <li><a href="#security" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">9. Сигурност на данните</a></li>
                <li><a href="#third-party" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">10. Връзки към уебсайтове на трети страни</a></li>
                <li><a href="#changes" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">11. Промени в настоящата политика</a></li>
                <li><a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">12. Контакти</a></li>
              </ul>
            </nav>

            {/* Main Content */}
            <div className="max-w-3xl min-w-0 break-words animate-slide-up" style={{ animationDelay: '100ms' }}>
              <section id="intro" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">1. Въведение</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Настоящата Политика за поверителност описва как {name} („ние“, „нас“, „наши“) събира, използва, разкрива и защитава личните ви данни, когато посещавате нашия уебсайт или използвате нашите услуги.</p>
                  <p>Ние уважаваме правото ви на поверителност и се ангажираме да защитаваме личните ви данни в съответствие с приложимото законодателство, включително Регламент (ЕС) 2016/679 (GDPR) и българското законодателство за защита на личните данни.</p>
                </div>
              </section>

              <section id="controller" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">2. Администратор на личните данни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Администратор на личните данни е:</p>
                  <div className="bg-slate-50 p-4 rounded-xl mb-4">
                    <p className="font-medium text-navy-900 mb-1">{name}</p>
                    <p className="text-slate-600 text-sm mb-1">{contactInfo.addressFull}</p>
                    <p className="text-slate-600 text-sm mb-1">Имейл: <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a></p>
                    <p className="text-slate-600 text-sm mb-0">Телефон: <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:underline">{contactInfo.phone}</a></p>
                  </div>
                </div>
              </section>

              <section id="data-collected" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">3. Какви лични данни събираме</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <h4 className="font-semibold text-navy-900 mb-3 text-base sm:text-lg">А. Данни, които вие ни предоставяте доброволно</h4>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Име и фамилия</li>
                    <li>Имейл адрес</li>
                    <li>Телефонен номер</li>
                    <li>Наименование на компания/организация</li>
                    <li>Съобщение и подробности за запитването</li>
                  </ul>
                  <h4 className="font-semibold text-navy-900 mb-3 text-base sm:text-lg">Б. Данни, събирани автоматично</h4>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>IP адрес</li>
                    <li>Тип и версия на браузъра</li>
                    <li>Операционна система</li>
                    <li>Референтна страница (referrer)</li>
                    <li>Време и дата на посещение</li>
                    <li>Страници, посетени на нашия сайт</li>
                  </ul>
                  <h4 className="font-semibold text-navy-900 mb-3 text-base sm:text-lg">В. Бисквитки (Cookies)</h4>
                  <p>Нашият уебсайт използва бисквитки за подобряване на потребителското изживяване и анализ на трафика. Вижте раздел 7 за подробности.</p>
                </div>
              </section>

              <section id="purpose" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">4. Цели и правна основа за обработка</h2>
                <div className="space-y-4 text-slate-600">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2 text-base">Отговор на запитвания и комуникация</h5>
                    <p className="text-sm mb-0">Правна основа: Чл. 6, ал. 1, буква „б“ GDPR (преддоговорни мерки/изпълнение на договор) и Чл. 6, ал. 1, буква „е“ GDPR (законен интерес).</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2 text-base">Изпращане на оферти и търговски предложения</h5>
                    <p className="text-sm mb-0">Правна основа: Чл. 6, ал. 1, буква „е“ GDPR (законен интерес) или съгласие (Чл. 6, ал. 1, буква „а“ GDPR), където се изисква.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2 text-base">Анализ и подобряване на уебсайта</h5>
                    <p className="text-sm mb-0">Правна основа: Чл. 6, ал. 1, буква „е“ GDPR (законен интерес) или съгласие за аналитични бисквитки.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2 text-base">Съответствие с правни задължения</h5>
                    <p className="text-sm mb-0">Правна основа: Чл. 6, ал. 1, буква „в“ GDPR (законово задължение).</p>
                  </div>
                </div>
              </section>

              <section id="sharing" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">5. Разкриване на данни към трети страни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Не продаваме личните ви данни. Може да споделим данни само в следните случаи:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>С доставчици на услуги (обработващи данни), които ни помагат да поддържаме уебсайта и да предоставяме услугите (хостинг, имейл, аналитика), обвързани с договори за защита на данните.</li>
                    <li>Когато това се изисква от закона или от компетентни органи.</li>
                    <li>При преструктуриране на компанията (сливане, придобиване), с предварително уведомяване.</li>
                  </ul>
                </div>
              </section>

              <section id="retention" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">6. Съхранение на данни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Съхраняваме личните данни само толкова дълго, колкото е необходимо за изпълнение на целите, за които са събрани, или колкото се изисква от закона.</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Данни от контактни форми: до 2 години след последния контакт, освен ако не се сключи договор.</li>
                    <li>Договорни и счетоводни данни: според законовите изисквания (обикновено 10 години).</li>
                    <li>Лог файлове и аналитични данни: до 12 месеца.</li>
                  </ul>
                </div>
              </section>

              <section id="cookies" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">7. Бисквитки и подобни технологии</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Използваме следните категории бисквитки:</p>
                  <ul className="list-disc list-inside space-y-3 mb-6">
                    <li><strong className="text-navy-900">Необходими:</strong> За работата на уебсайта (сесии, защита, локални настройки). Не изискват съгласие.</li>
                    <li><strong className="text-navy-900">Аналитични:</strong> За разбиране на трафика и поведението на потребителите. Изискват съгласие.</li>
                    <li><strong className="text-navy-900">Маркетингови:</strong> За персонализирани кампании. Изискват съгласие.</li>
                  </ul>
                  <p>Можете да управлявате предпочитанията си за бисквитки чрез настройките на браузъра си.</p>
                </div>
              </section>

              <section id="rights" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">8. Вашите права</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>В съответствие с GDPR вие имате следните права:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Право на достъп до данните си</li>
                    <li>Право на корекция на неточни данни</li>
                    <li>Право на изтриване („право да бъдете забравени“)</li>
                    <li>Право на ограничаване на обработката</li>
                    <li>Право на преносимост на данните</li>
                    <li>Право да възразите срещу обработката</li>
                    <li>Право да оттеглите съгласието си (когато обработката е базирана на съгласие)</li>
                  </ul>
                  <p>За упражняване на тези права се свържете с нас на <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a>.</p>
                  <p>Имате право да подадете жалба до Комисията за защита на личните данни (КЗЛД) в България, ако сметнете, че обработката нарушава закона.</p>
                </div>
              </section>

              <section id="security" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">9. Сигурност на данните</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Прилагаме подходящи технически и организационни мерки за защита на личните данни от неоторизиран достъп, промяна, разкриване или унищожение. Въпреки това нито един интернет пренос или система за съхранение не е 100% защитена.</p>
                </div>
              </section>

              <section id="third-party" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">10. Връзки към уебсайтове на трети страни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Нашият уебсайт може да съдържа връзки към външни сайтове. Не носим отговорност за политиките за поверителност или съдържанието на тези сайтове. Препоръчваме да се запознаете с техните политики за поверителност.</p>
                </div>
              </section>

              <section id="changes" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">11. Промени в настоящата политика</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Можем да актуализираме тази политика периодично. Всякакви промени ще бъдат публикувани на тази страница с актуализирана дата на влизане в сила. Препоръчваме да преглеждате тази страница редовно.</p>
                </div>
              </section>

              <section id="contact" className="mb-10 pb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">12. Контакти за въпроси относно поверителността</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Ако имате въпроси или запитвания относно настоящата Политика за поверителност или обработката на вашите лични данни, моля, свържете се с нас:</p>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-medium text-navy-900 mb-1">{name}</p>
                    <p className="text-slate-600 text-sm mb-1">Имейл: <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a></p>
                    <p className="text-slate-600 text-sm mb-0">Адрес: {contactInfo.addressFull}</p>
                  </div>
                </div>
              </section>

              <div className="mt-10 pt-6 border-t border-slate-200 bg-slate-50 rounded-xl p-5 sm:p-6">
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-3">Бърза навигация</h3>
                <div className="flex flex-wrap gap-3">
                  <Link to="/" className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Начало
                  </Link>
                  <Link to="/contact" className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Контакти
                  </Link>
                  <Link to="/terms" className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Общи условия
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
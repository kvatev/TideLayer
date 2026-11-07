import { Link } from 'react-router-dom';
import { brandConfig } from '../../config/brand';

export function PrivacyPolicy() {
  const { name, contact } = brandConfig;
  const email = contact.email;
  const currentYear = new Date().getFullYear();

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="privacy-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="privacy-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Политика за поверителност
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Последна актуализация: {new Date().toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white" aria-labelledby="privacy-content">
        <div className="container">
          <div className="grid lg:grid-cols-[240px_1fr] gap-8">
            {/* Table of Contents */}
            <nav className="lg:sticky lg:top-24 lg:self-start animate-fade-in" aria-label="Table of contents">
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
            <div className="max-w-3xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              <section id="intro" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">1. Въведение</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Настоящата Политика за поверителност описва как {name} („ние“, „нас“, „наши“) събира, използва, разкрива и защитава личните ви данни, когато посещавате нашия уебсайт или използвате нашите услуги.</p>
                  <p>Ние уважаваме правото ви на поверителност и се ангажираме да защитаваме личните ви данни в съответствие с прилаганото законодателство, включително Регламент (ЕС) 2016/679 (ГДПР) и българското законодателство за защита на личните данни.</p>
                </div>
              </section>

              <section id="controller" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">2. Администратор на личните данни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Администратор на личните данни е:</p>
                  <div className="bg-slate-50 p-4 rounded-xl mb-4">
                    <p className="font-medium text-navy-900">{name}</p>
                    <p className="text-slate-600 text-sm">{contact.address.full}</p>
                    <p className="text-slate-600 text-sm">Имейл: <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a></p>
                    <p className="text-slate-600 text-sm">Телефон: <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">{contact.phone}</a></p>
                  </div>
                </div>
              </section>

              <section id="data-collected" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">3. Какви лични данни събираме</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <h4 className="font-semibold text-navy-900 mb-3">А. Данни, които вие ни предоставяте доброволно</h4>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Име и фамилия</li>
                    <li>Имейл адрес</li>
                    <li>Телефонен номер</li>
                    <li>Наименование на компания/организация</li>
                    <li>Съобщение/подробности за запитването</li>
                  </ul>
                  <h4 className="font-semibold text-navy-900 mb-3">Б. Данни, събирани автоматично</h4>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>IP адрес</li>
                    <li>Тип и версия на браузър</li>
                    <li>Операционна система</li>
                    <li>Референтна страница (referrer)</li>
                    <li>Време и дата на посещение</li>
                    <li>Страници, посетени на нашия сайт</li>
                  </ul>
                  <h4 className="font-semibold text-navy-900 mb-3">В. Бисквитки (Cookies)</h4>
                  <p>Нашият уебсайт използва бисквитки за подобряване на потребителското изживяване и анализ на трафика. Вижте раздел 7 за подробности.</p>
                </div>
              </section>

              <section id="purpose" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">4. Цели и правна основа за обработка</h2>
                <div className="space-y-4 text-slate-600">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2">Отговор на запитвания и комуникация</h5>
                    <p className="text-sm">Правна основа: Чл. 6, ал. 1, буква „б“ ГДПР (изпълнение на договор/преддоговорни мерки) и Чл. 6, ал. 1, буква „f“ ГДПР (законен интерес).</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2">Изпратване на оферти и комерсиални предложения</h5>
                    <p className="text-sm">Правна основа: Чл. 6, ал. 1, буква „f“ ГДПР (законен интерес) или съгласие (Чл. 6, ал. 1, буква „a“ ГДПР), където се изисква.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2">Анализ и подобряване на уебсайта</h5>
                    <p className="text-sm">Правна основа: Чл. 6, ал. 1, буква „f“ ГДПР (законен интерес) или съгласие за аналитични бисквитки.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-navy-900 mb-2">Съответствие с правни задължения</h5>
                    <p className="text-sm">Правна основа: Чл. 6, ал. 1, буква „c“ ГДПР (законово задължение).</p>
                  </div>
                </div>
              </section>

              <section id="sharing" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">5. Разкриване на данни към трети страни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Не продаваме личните ви данни. Може да споделим данни само в следните случаи:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>С доставчици на услуги (процесори), които ни помагат да експлотираме уебсайта и да предоставяме услугите (хостинг, имейл, аналитика), заключени с договори за обработка на данни.</li>
                    <li>Когато това е изисквано от закона или от компетентни органи.</li>
                    <li>При реорганизация на компанията (сливане, придобиване), с предварително уведомяване.</li>
                  </ul>
                </div>
              </section>

              <section id="retention" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">6. Съхранение на данни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Съхраняваме личните данни само колкото е необходимо за изпълнение на целите, за които са събрани, или колкото е изисквано от закона.</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Данни от контактни форми: до 2 години след последният контакт, освен ако не се сключи договор.</li>
                    <li>Договорни и счетоводни данни: според законовите изисквания (обикновено 10 години).</li>
                    <li>Лог файлове и аналитични данни: до 12 месеца.</li>
                  </ul>
                </div>
              </section>

              <section id="cookies" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">7. Бисквитки и подобни технологии</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Използваме следните категории бисквитки:</p>
                  <ul className="list-disc list-inside space-y-3 mb-6">
                    <li><strong className="text-navy-900">Необходими:</strong> За работа на уебсайта (сесии, защита CSRF, съгласие за бисквитки). Не изискват съгласие.</li>
                    <li><strong className="text-navy-900">Аналитични:</strong> За разбиране на трафика и поведението на потребителите (напр. Google Analytics). Изискват съгласие.</li>
                    <li><strong className="text-navy-900">Маркетингови:</strong> За персонализирани реклами. Изискват съгласие.</li>
                  </ul>
                  <p>Можете да управлявате предпочитанията си за бисквитки чрез банера за съгласие или настройките на браузъра си.</p>
                </div>
              </section>

              <section id="rights" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">8. Вашите права</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>В съответствие с ГДПР, вие имате следните права:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Право на достъп до данните си</li>
                    <li>Право на корекция на неточни данни</li>
                    <li>Право на изтриване („право да бъдеш забравен“)</li>
                    <li>Право на ограничаване на обработката</li>
                    <li>Право на преносимост на данни</li>
                    <li>Право да се възразите против обработката</li>
                    <li>Право да теглите съгласието си (където обработката е базирана на съгласие)</li>
                  </ul>
                  <p>За упражняване на тези права, свържете се с нас на <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>.</p>
                  <p>Имате право да подадете жалба към Комisia за защита на личните данни (КЗЛД) в България, ако счетите, че обработката нарушава закона.</p>
                </div>
              </section>

              <section id="security" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">9. Сигурност на данните</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Прилагаме подходящи технически и организационни мерки за защита на личните данни от неоторизиран достъп, промяна, разкриване или унищожение. Въпреки това, нито един интернет пренос или система за съхранение не е 100% сигурен.</p>
                </div>
              </section>

              <section id="third-party" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">10. Връзки към уебсайтове на трети страни</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Нашият уебсайт може да съдържа връзки към външни сайтове. Не отговаряме за политиките за поверителност или съдържанието на тези сайтове. Препоръчваме да прочетете техните политики за поверителност.</p>
                </div>
              </section>

              <section id="changes" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">11. Промени в настоящата политика</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Може да актуализираме тази политика периодично. Всякакви промени ще бъдат публикувани на тази страница с актуализирана дата на влизане в сила. Препоръчваме да преглеждате тази страница редовно.</p>
                </div>
              </section>

              <section id="contact" className="mb-12 pb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">12. Контакти за въпроси относно поверителност</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Ако имате въпроси или запитвания относно настоящата Политика за поверителност или обработката на вашите лични данни, моля, свържете се с нас:</p>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-medium text-navy-900">{name}</p>
                    <p className="text-slate-600 text-sm">Имейл: <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a></p>
                    <p className="text-slate-600 text-sm">Адрес: {contact.address.full}</p>
                  </div>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-slate-200 bg-slate-50 rounded-xl p-6">
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
import { Link } from 'react-router-dom';
import { brandConfig } from '../../config/brand';

const LAST_UPDATED = new Date().toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' });

export function Terms() {
  const { name, contact } = brandConfig;
  const website = brandConfig.seo.url;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="terms-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="terms-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Общи условия
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Последна актуализация: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white" aria-labelledby="terms-content">
        <div className="container">
          <div className="grid lg:grid-cols-[240px_1fr] gap-8">
            {/* Table of Contents */}
            <nav className="lg:sticky lg:top-24 lg:self-start animate-fade-in" aria-label="Table of contents">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Съдържание</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#intro" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">1. Общи разпоредби</a></li>
                <li><a href="#services" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">2. Описание на услугите</a></li>
                <li><a href="#inquiries" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">3. Запитвания и оферти</a></li>
                <li><a href="#ip" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">4. Интелектуална собственост</a></li>
                <li><a href="#user-conduct" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">5. Отговорност на потребителя</a></li>
                <li><a href="#disclaimer" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">6. Отказ от гаранции и ограничение на отговорност</a></li>
                <li><a href="#indemnification" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">7. Безвъзмездие</a></li>
                <li><a href="#governing-law" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">8. Приложимо право и разрешаване на спорове</a></li>
                <li><a href="#changes" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">9. Промени в Условията</a></li>
                <li><a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">10. Контакти</a></li>
              </ul>
            </nav>

            {/* Main Content */}
            <div className="max-w-3xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              <section id="intro" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">1. Общи разпоредби</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Настоящите Общи условия („Условия“) управляват достъпа ви до и използването на уебсайта на <strong>{name}</strong> („сайтът“, „ние“, „нас“, „наши“) на адрес <strong>{website || 'tidelayer.tech'}</strong>, както и всякакви услуги, предлагани чрез него.</p>
                  <p>Чрез достъп до или използване на сайта, вие потвърждавате, че сте прочели, разбрали и приемате настоящите Условия. Ако не се съгласявате с някоя част от тях, моля, не използвайте сайта.</p>
                  <p>Ние се запазваме правото да модифицираме тези Условия по всяко време. Промените влизат в сила от момента на публикуване на актуализираната версия на тази страница. Продължаването на използването на сайта след публикуване на промени представлява приемане на новите Условия.</p>
                </div>
              </section>

              <section id="services" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">2. Описание на услугите</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>{name} е технологична компания, предлагаща услуги в четири основни области:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li><strong>Уеб решения:</strong> разработка на уебсайтове, уеб приложения, API интеграции, автоматизация, поддръжка и развитие.</li>
                    <li><strong>Училищни решения:</strong> софтуерни продукти (График на учителските дежурства, Училищна система за заявки, Училищна инвентарна система) и ИТ поддръжка за образователни институции.</li>
                    <li><strong>Мрежи и ИТ инфраструктура:</strong> проектиране и изграждане на мрежи, Wi-Fi/LAN, сървъри/NAS/backup, месечна ИТ поддръжка.</li>
                    <li><strong>Хардуерен сервиз:</strong> диагностика, ремонт, ъпгрейд, сглобяване на ПЦ (допълнителна услуга).</li>
                  </ul>
                  <p>Представянето на услуги на сайта не представлява оферта в смисъл на Закона за задълженията и договорите. То е покана за оферта. Конкретните условия за всяка услуга се уточняват чрез индивидуални оферти и договори.</p>
                </div>
              </section>

              <section id="inquiries" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">3. Запитвания и оферти</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Чрез контактните форми на сайта вие можете да ни изпратите запитване. Ние се ангажираме да отговорим в разумни срокове (обикновено в рамките на 1 работен ден).</p>
                  <p>Всяка изчетена от нас оферта е валидна за определен в нея период (обикновено 14–30 дни), освен ако не е указано друго. Цените в офертите са в левове (BGN) и включват/не включват ДДС, както е указано изрично.</p>
                  <p>Сключването на договор за услуги изисква писмено съгласие (по имейл или подписан документ) от двете страни.</p>
                </div>
              </section>

              <section id="ip" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">4. Интелектуална собственост</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Всички права върху интеллектуалната собственост относно сайта, неговото съдържание (текстове, изображения, графики, лога, код, дизайн), като и цялостно така и по отделни елементи, принадлежат на {name} или на съответните лицензиодатели.</p>
                  <p>Не ви се предоставя лиценз за копиране, разпространение, модифициране, публично извеждане или създаване на производни произведения от съдържанието на сайта без изричното ни писмено съгласие.</p>
                  <p>Демонстрационните проекти и UI концепции, показани в портфолиото, са собственост на {name} и служат за илюстрация на възможностите ни. Те не са реални клиентски проекти, освен ако не е указано изрично друго.</p>
                </div>
              </section>

              <section id="user-conduct" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">5. Отговорност на потребителя</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Вие се съгласявате да не използвате сайта:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>За неправни цели или в нарушение на прилагано законодателство.</li>
                    <li>За предаване на злонамерен код, вируси или други вредоносни компоненти.</li>
                    <li>За опит за неоторизиран достъп до системи, сървъри или мрежи, свързани със сайта.</li>
                    <li>За скъпане, събиране на данни (scraping) или автоматизиран достъп без съгласие.</li>
                    <li>За нарушаване на права на интеллектуална собственост.</li>
                  </ul>
                  <p>Ние се запазваме правото да ограничим или прекратим достъпа ви до сайта при нарушение на настоящите Условия.</p>
                </div>
              </section>

              <section id="disclaimer" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">6. Отказ от гаранции и ограничение на отговорност</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Сайтът и неговите съдържания се предоставят „каквото е“ и „каквото е достъпно“, без каквито и да е гаранции — изрични или подразумевани, включително но не се ограничаващи до гаранции за търговска годност, пригодност за определена цел и невъзмутимост.</p>
                  <p>Не гарантираме, че сайтът ще бъде непрекъснато достъвен, безгрешен, без вируси или че дефектът ще бъдат коригирани.</p>
                  <p>В максималния допустим от закона обхват, {name} не носи отговорност за каквито и да е директни, непряки, случайни, специални или последициални щети (включително загуба на печалби, данни, клиенти, репутация), произтичащи от или свързани с:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Използване или неспособност за използване на сайта.</li>
                    <li>Неоторизиран достъп до или промяна на вашите предавания или данни.</li>
                    <li>Действия на трети страни на сайта.</li>
                  </ul>
                  <p>Ние не отговаряме за съдържанието на външни сайтове, към които водим връзки. Тези връзки са за удобство и не подсказват за одобрение.</p>
                </div>
              </section>

              <section id="indemnification" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">7. Безвъзмездие</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Вие се съгласявате да обезщетите, защитите и държите {name}, нейните директори, служители и партньори безвредни от всякакви претенции, загуби, разходи, щети и разходи за адвокати, произтичащи от или свързани с:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Вашето нарушение на настоящите Условия.</li>
                    <li>Вашето използване на сайта във нарушение на закона или правата на трети страни.</li>
                  </ul>
                </div>
              </section>

              <section id="governing-law" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">8. Приложимо право и разрешаване на спорове</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Настоящите Условия се управляват от и се тълкуват в съответствие с българското законодателство.</p>
                  <p>Всякакви спорове, свързани с настоящите Условия или използването на сайта, ще бъдат разрешавани от компетентните български съди, освен ако страните не се съгласят на алтернативно разрешаване (медиация, арбитраж).</p>
                </div>
              </section>

              <section id="changes" className="mb-12 pb-8 border-b border-slate-100">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">9. Промени в Условията</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Може да актуализираме тези Условия периодично. Всякакви промени ще бъдат публикувани на тази страница с актуализирана дата на влизане в сила. Продължаването на използването на сайта след публикуване на промени представлява приемане на новите Условия.</p>
                  <p>При съществени промени ще се опитаме да уведомим потребителите чрез изричен банер на сайта или по имейл (ако сме в притежание на такъв).</p>
                </div>
              </section>

              <section id="contact" className="mb-12 pb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-6">10. Контакти</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>За въпроси относно настоящите Общи условия, моля, свържете се с нас:</p>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-medium text-navy-900">{name}</p>
                    <p className="text-slate-600 text-sm">{contact.address.full}</p>
                    <p className="text-slate-600 text-sm">Имейл: <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a></p>
                    <p className="text-slate-600 text-sm">Телефон: <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">{contact.phone}</a></p>
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
                  <Link to="/privacy" className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Политика за поверителност
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
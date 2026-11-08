import { Link } from 'react-router-dom';
import { brandConfig } from '../../config/brand';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

const LAST_UPDATED = new Date().toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' });

export function Terms() {
  const { name } = brandConfig;
  const { contactInfo } = useSiteControl();
  const website = brandConfig.seo.url;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="legal" ariaLabelledby="terms-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="terms-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Общи условия
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-4 max-w-2xl leading-relaxed">
              Последна актуализация: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </PageHero>

      {/* Content */}
      <section className="section bg-white" aria-label="Съдържание на общите условия">
        <div className="container">
          <div className="grid lg:grid-cols-[240px_1fr] gap-8">
            {/* Table of Contents */}
            <nav className="lg:sticky lg:top-24 lg:self-start animate-fade-in min-w-0" aria-label="Съдържание">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Съдържание</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#intro" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">1. Общи разпоредби</a></li>
                <li><a href="#services" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">2. Описание на услугите</a></li>
                <li><a href="#inquiries" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">3. Запитвания и оферти</a></li>
                <li><a href="#ip" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">4. Интелектуална собственост</a></li>
                <li><a href="#user-conduct" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">5. Отговорност на потребителя</a></li>
                <li><a href="#disclaimer" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">6. Отказ от гаранции и ограничение на отговорност</a></li>
                <li><a href="#indemnification" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">7. Обезщетение</a></li>
                <li><a href="#governing-law" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">8. Приложимо право и разрешаване на спорове</a></li>
                <li><a href="#changes" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">9. Промени в Условията</a></li>
                <li><a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors block py-1">10. Контакти</a></li>
              </ul>
            </nav>

            {/* Main Content */}
            <div className="max-w-3xl min-w-0 break-words animate-slide-up" style={{ animationDelay: '100ms' }}>
              <section id="intro" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">1. Общи разпоредби</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Настоящите Общи условия („Условия“) уреждат достъпа ви до и използването на уебсайта на <strong>{name}</strong> („сайтът“, „ние“, „нас“, „наши“) на адрес <strong className="break-all">{website || 'tidelayer.com'}</strong>, както и всички услуги, предлагани чрез него.</p>
                  <p>Чрез достъп до или използване на сайта вие потвърждавате, че сте прочели, разбрали и приемате настоящите Условия. Ако не се съгласявате с някоя част от тях, моля, не използвайте сайта.</p>
                  <p>Запазваме си правото да актуализираме тези Условия по всяко време. Промените влизат в сила от момента на публикуване на актуализираната версия на тази страница. Продължаването на използването на сайта след публикуване на промени представлява приемане на новите Условия.</p>
                </div>
              </section>

              <section id="services" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">2. Описание на услугите</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>{name} е технологична компания, предлагаща услуги в четири основни области:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li><strong>Уеб решения:</strong> уеб разработка, корпоративни сайтове и уеб системи, поддръжка и развитие на уебсайтове.</li>
                    <li><strong>Училищни решения:</strong> софтуерни продукти (График на учителските дежурства, Училищна система за заявки, Училищна инвентарна система) и ИТ поддръжка за образователни институции.</li>
                    <li><strong>Мрежи и ИТ инфраструктура:</strong> изграждане на мрежи и месечна ИТ поддръжка за бизнес клиенти.</li>
                    <li><strong>Хардуерен сервиз:</strong> диагностика, ремонт, ъпгрейд и сглобяване на компютърни системи (допълнителна услуга).</li>
                  </ul>
                  <p>Представянето на услуги на сайта не представлява обвързваща оферта по смисъла на Закона за задълженията и договорите, а покана за отправяне на запитване. Конкретните условия за всяка услуга се уточняват чрез индивидуални оферти и договори.</p>
                </div>
              </section>

              <section id="inquiries" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">3. Запитвания и оферти</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Чрез контактните форми на сайта можете да ни изпратите запитване. Ние се ангажираме да отговорим в разумни срокове (обикновено в рамките на 1 работен ден).</p>
                  <p>Всяка изготвена от нас оферта е валидна за посочения в нея период (обикновено 14–30 дни), освен ако не е указано друго. Всички цени в сайта и в офертите се посочват в евро (€ / EUR) с изрично уточнение относно ДДС.</p>
                  <p>Сключването на договор за услуги изисква писмено съгласие (по имейл или подписан документ) от двете страни.</p>
                </div>
              </section>

              <section id="ip" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">4. Интелектуална собственост</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Всички права върху интелектуалната собственост относно сайта, неговото съдържание (текстове, изображения, графики, лога, код, дизайн), както цялостно, така и по отделни елементи, принадлежат на {name} или на съответните правоносители.</p>
                  <p>Не ви се предоставя лиценз за копиране, разпространение, модифициране, публично извеждане или създаване на производни произведения от съдържанието на сайта без изричното ни писмено съгласие.</p>
                  <p>Демонстрационните проекти и UI концепции, показани на сайта, служат за илюстрация на възможностите ни и са обект на авторско право.</p>
                </div>
              </section>

              <section id="user-conduct" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">5. Отговорност на потребителя</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Вие се съгласявате да не използвате сайта:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>За неправомерни цели или в нарушение на приложимото законодателство.</li>
                    <li>За предаване на злонамерен код, вируси или други вредоносни компоненти.</li>
                    <li>За опит за неоторизиран достъп до системи, сървъри или мрежи, свързани със сайта.</li>
                    <li>За автоматизирано извличане на данни (scraping) без изрично съгласие.</li>
                    <li>За нарушаване на права на интелектуална собственост.</li>
                  </ul>
                  <p>Запазваме си правото да ограничим или прекратим достъпа ви до сайта при нарушение на настоящите Условия.</p>
                </div>
              </section>

              <section id="disclaimer" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">6. Отказ от гаранции и ограничение на отговорност</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Сайтът и неговото съдържание се предоставят „както са“ и „както са достъпни“, без каквито и да е гаранции — изрични или подразумевани, включително гаранции за търговска годност, пригодност за определена цел и ненарушимост на чужди права.</p>
                  <p>Не гарантираме, че сайтът ще бъде непрекъснато достъпен, безгрешен или че евентуални технически дефекти ще бъдат отстранявани незабавно.</p>
                  <p>В максималния допустим от закона обхват {name} не носи отговорност за директни, непряки, случайни, специални или последващи щети (включително пропуснати ползи, загуба на данни, клиенти или репутация), произтичащи от:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Използване или невъзможност за използване на сайта.</li>
                    <li>Неоторизиран достъп или промяна на ваши данни.</li>
                    <li>Действия на трети страни на сайта.</li>
                  </ul>
                  <p>Не носим отговорност за съдържанието на външни сайтове, към които водят препратки от нашия сайт.</p>
                </div>
              </section>

              <section id="indemnification" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">7. Обезщетение</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Вие се съгласявате да обезщетите и защитите {name}, нейните служители и партньори от всякакви претенции, загуби, щети и правни разходи, произтичащи от:</p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Ваше нарушение на настоящите Условия.</li>
                    <li>Използване на сайта от ваша страна в нарушение на закона или правата на трети лица.</li>
                  </ul>
                </div>
              </section>

              <section id="governing-law" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">8. Приложимо право и разрешаване на спорове</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Настоящите Условия се регулират и тълкуват в съответствие с българското законодателство.</p>
                  <p>Всички спорове, свързани с настоящите Условия или използването на сайта, ще се решават от компетентните български съдилища, освен ако страните не договорят извънсъдебно споразумение.</p>
                </div>
              </section>

              <section id="changes" className="mb-10 pb-8 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">9. Промени в Условията</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>Можем да актуализираме тези Условия периодично. Всяка промяна се публикува на тази страница с актуална дата на влизане в сила. Продължаването на използването на сайта след публикуване на промени означава приемане на новите Условия.</p>
                  <p>При съществени промени ще уведомим потребителите чрез изрично съобщение на сайта или по имейл (когато разполагаме с такъв).</p>
                </div>
              </section>

              <section id="contact" className="mb-10 pb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-navy-900 mb-5">10. Контакти</h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>За въпроси относно настоящите Общи условия, моля, свържете се с нас:</p>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-medium text-navy-900 mb-1">{name}</p>
                    <p className="text-slate-600 text-sm mb-1">{contactInfo.addressFull}</p>
                    <p className="text-slate-600 text-sm mb-1">Имейл: <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline break-all">{contactInfo.email}</a></p>
                    <p className="text-slate-600 text-sm mb-0">Телефон: <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:underline">{contactInfo.phone}</a></p>
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
                  <Link to="/privacy-policy" className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
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
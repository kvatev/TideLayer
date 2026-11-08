import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { inquiryTypes } from '../../data';
import { brandConfig } from '../../config/brand';
import { inquiryStore } from '../../data/inquiries';
import { useSiteControl } from '../../data/siteControl';
import { PageHero } from '../../components/ui/PageHero';

function resolveQuerySelection(serviceParam: string | null, productParam: string | null, extraParam: string | null) {
  let inquiryType = '';
  let productPreselect = '';

  if (productParam) {
    inquiryType = 'education-solutions';
    productPreselect = productParam;
  } else if (serviceParam) {
    if (['web-solutions', 'website-development', 'website-maintenance'].includes(serviceParam)) {
      inquiryType = 'web-solutions';
      if (serviceParam !== 'web-solutions') {
        productPreselect = extraParam ? `${serviceParam} (${extraParam})` : serviceParam;
      }
    } else if (['education-solutions', 'school-it-support'].includes(serviceParam)) {
      inquiryType = 'education-solutions';
      if (serviceParam === 'school-it-support') {
        productPreselect = 'school-it-support';
      }
    } else if (['networks-it', 'network-installation', 'monthly-support'].includes(serviceParam)) {
      inquiryType = 'networks-it';
      if (serviceParam !== 'networks-it') {
        productPreselect = extraParam ? `${serviceParam} (${extraParam})` : serviceParam;
      }
    } else if (serviceParam === 'hardware-service') {
      inquiryType = 'hardware-service';
    } else {
      inquiryType = 'other';
    }
  }

  return { inquiryType, productPreselect };
}

const SERVICE_BADGE_LABELS: Record<string, string> = {
  'website-development': 'Уеб разработка',
  'website-maintenance': 'Поддръжка на уебсайтове',
  'school-it-support': 'ИТ поддръжка за училища',
  'network-installation': 'Изграждане на мрежи',
  'monthly-support': 'Месечна ИТ поддръжка',
  'duty-scheduler': 'График на учителските дежурства',
  'school-ticketing': 'Училищна система за заявки',
  'school-inventory': 'Училищна инвентарна система',
};

function formatPreselectLabel(val: string): string {
  const [base, note] = val.split(' (');
  const label = SERVICE_BADGE_LABELS[base] ?? val;
  return note ? `${label} (${note}` : label;
}

export function Contact() {
  const [searchParams] = useSearchParams();
  const siteControl = useSiteControl();
  const hiddenSet = new Set(siteControl.hiddenNavHrefs);

  const serviceParam = searchParams.get('service');
  const productParam = searchParams.get('product');
  const extraParam = searchParams.get('tier') || searchParams.get('plan');

  const queryKey = `${serviceParam ?? ''}|${productParam ?? ''}|${extraParam ?? ''}`;
  const querySelection = resolveQuerySelection(serviceParam, productParam, extraParam);

  const [selectionOverride, setSelectionOverride] = useState<{
    key: string;
    inquiryType: string;
    productPreselect: string;
  } | null>(null);

  const activeInquiryType =
    selectionOverride?.key === queryKey ? selectionOverride.inquiryType : querySelection.inquiryType;
  const activeProductPreselect =
    selectionOverride?.key === queryKey ? selectionOverride.productPreselect : querySelection.productPreselect;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!activeInquiryType) newErrors.inquiryType = 'Моля, изберете тип запитване';
    if (!formData.name.trim()) newErrors.name = 'Името е задължително';
    if (!formData.email.trim()) newErrors.email = 'Имейлът е задължителен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Невалиден имейл адрес';
    if (!formData.message.trim()) newErrors.message = 'Съобщението е задължително';
    else if (formData.message.trim().length < 20) newErrors.message = 'Съобщението трябва да е минимум 20 символа';
    if (!formData.consent) newErrors.consent = 'Трябва да се съгласите с обработката на лични данни';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitStatus('submitting');

    // Simulate brief submission processing
    await new Promise(resolve => setTimeout(resolve, 600));

    // Save inquiry to persistent store
    inquiryStore.add({
      inquiryType: activeInquiryType,
      productPreselect: activeProductPreselect || undefined,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      company: formData.company.trim() || undefined,
      message: formData.message.trim(),
    });

    setSubmitStatus('success');
    setSelectionOverride({ key: queryKey, inquiryType: '', productPreselect: '' });
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      consent: false,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'inquiryType') {
      setSelectionOverride({
        key: queryKey,
        inquiryType: value,
        productPreselect: value !== activeInquiryType ? '' : activeProductPreselect,
      });
    } else if (name === 'productPreselect') {
      setSelectionOverride({
        key: queryKey,
        inquiryType: activeInquiryType,
        productPreselect: value,
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const { contactInfo } = siteControl;

  const quickLinks = [
    { icon: 'Globe', title: 'Уеб разработка', href: '/web-solutions/website-development' },
    { icon: 'GraduationCap', title: 'Училищни продукти', href: '/education-solutions' },
    { icon: 'Network', title: 'Мрежи и ИТ', href: '/networks-it' },
    { icon: 'Cpu', title: 'Хардуерен сервиз', href: '/hardware-service' },
  ].filter((item) => !hiddenSet.has(item.href));

  return (
    <div>
      {/* Hero */}
      <PageHero theme="contact" ariaLabelledby="contact-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="contact-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Благодарим за интереса
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Всеки проект започва с разговор. Опишете ни какво ви трябва и ще се върнем с конкретно предложение в рамките на 1 работен ден.
            </p>
          </div>
        </div>
      </PageHero>

      {/* Contact Info + Form */}
      <section className="section bg-white" aria-labelledby="contact-form-title">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 animate-fade-in min-w-0">
              <Card variant="elevated" padding="xl" className="lg:sticky lg:top-24 h-fit">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-6">Контактна информация</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="MapPin" size={20} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy-900 text-base">Адрес</h3>
                      <p className="text-slate-600 text-sm mb-1">{contactInfo.addressFull}</p>
                      <p className="text-slate-500 text-sm mb-0">Обслужваме клиенти в цяла България</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="Mail" size={20} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy-900 text-base">Имейл</h3>
                      <a href={`mailto:${contactInfo.email}`} className="text-slate-600 text-sm hover:text-blue-600 transition-colors break-all">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="Phone" size={20} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy-900 text-base">Телефон</h3>
                      <a href={`tel:${contactInfo.phone}`} className="text-slate-600 text-sm hover:text-blue-600 transition-colors">
                        {contactInfo.phone}
                      </a>
                      <p className="text-slate-500 text-sm mt-1 mb-0">Работно време: Понеделник–Петък 9:00–18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="Clock" size={20} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy-900 text-base">Време за отговор</h3>
                      <p className="text-slate-600 text-sm mb-1">Обикновено в рамките на 1 работен ден</p>
                      <p className="text-slate-500 text-sm mb-0">За аварийни случаи — според договора за поддръжка</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-navy-900 text-base mb-4">Можете да ни намерите и в</h3>
                  <div className="flex flex-wrap gap-3">
                    <a href={brandConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                      <Icon name="Linkedin" size={20} />
                    </a>
                    <a href={brandConfig.social.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors" aria-label="GitHub">
                      <Icon name="Github" size={20} />
                    </a>
                    <a href={brandConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors" aria-label="Facebook">
                      <Icon name="Facebook" size={20} />
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 animate-slide-up min-w-0" style={{ animationDelay: '100ms' }}>
              <Card variant="elevated" padding="xl">
                <h2 id="contact-form-title" className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-2">Изпратете ни запитване</h2>
                <p className="text-slate-600 text-sm sm:text-base mb-8">Попълнете формата и ще се свържем с вас възможно най-скоро.</p>

                {submitStatus === 'success' && (
                  <div className="mb-8 p-4 sm:p-5 bg-green-50 border border-green-200 rounded-xl animate-fade-in" role="alert">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Icon name="Check" size={16} className="text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-green-800 text-base">Благодарим ви!</h3>
                        <p className="text-green-700 text-sm mb-0">Вашето запитване е изпратено успешно. Ще се свържем с вас в кратки срокове.</p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-8 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-xl animate-fade-in" role="alert">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <Icon name="AlertCircle" size={16} className="text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-red-800 text-base">Възникна грешка</h3>
                        <p className="text-red-700 text-sm mb-0">Моля, опитайте отново или ни пишете директно на имейл.</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Preselected service context badge */}
                  {activeProductPreselect && activeInquiryType !== 'education-solutions' && (
                    <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-800">
                      <span className="truncate">
                        Избрана услуга: <strong>{formatPreselectLabel(activeProductPreselect)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectionOverride({
                            key: queryKey,
                            inquiryType: activeInquiryType,
                            productPreselect: '',
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium shrink-0"
                        aria-label="Премахни избраната услуга"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Inquiry Type */}
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-navy-900 mb-2">
                      Тип запитване <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={activeInquiryType}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-3.5 sm:px-4 py-3 rounded-xl border transition-colors text-sm sm:text-base',
                        'bg-white text-slate-900 placeholder:text-slate-400',
                        'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                        errors.inquiryType && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      )}
                      aria-invalid={!!errors.inquiryType}
                      aria-describedby={errors.inquiryType ? 'inquiryType-error' : undefined}
                    >
                      <option value="">Изберете тип запитване</option>
                      {inquiryTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label} — {type.description}
                        </option>
                      ))}
                    </select>
                    {errors.inquiryType && (
                      <p id="inquiryType-error" className="mt-1.5 text-sm text-red-600" role="alert">{errors.inquiryType}</p>
                    )}
                  </div>

                  {/* Product Preselect (conditional) */}
                  {activeInquiryType === 'education-solutions' && (
                    <div>
                      <label htmlFor="productPreselect" className="block text-sm font-medium text-navy-900 mb-2">
                        Продукт / услуга (по избор)
                      </label>
                      <select
                        id="productPreselect"
                        name="productPreselect"
                        value={activeProductPreselect}
                        onChange={handleChange}
                        className={cn(
                          'w-full px-3.5 sm:px-4 py-3 rounded-xl border transition-colors text-sm sm:text-base',
                          'bg-white text-slate-900 placeholder:text-slate-400',
                          'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        )}
                      >
                        <option value="">Изберете продукт (по избор)</option>
                        <option value="duty-scheduler">График на учителските дежурства</option>
                        <option value="school-ticketing">Училищна система за заявки</option>
                        <option value="school-inventory">Училищна инвентарна система</option>
                        <option value="school-it-support">ИТ поддръжка за училища</option>
                      </select>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-navy-900 mb-2">
                      Име <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Вашето пълно име"
                      error={errors.name}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1.5 text-sm text-red-600" role="alert">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-2">
                      Имейл <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      error={errors.email}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1.5 text-sm text-red-600" role="alert">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone + Company row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-navy-900 mb-2">
                        Телефон
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+359 88 123 4567"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-navy-900 mb-2">
                        Компания / Училище
                      </label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Наименование на организацията"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-navy-900 mb-2">
                      Съобщение <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Опишете ни какво ви е необходимо, какъв е обхватът на проекта, какви са сроковете и бюджетът (ако имате предпочитания)..."
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border transition-colors resize-y min-h-[120px]',
                        'bg-white text-slate-900 placeholder:text-slate-400',
                        'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                        errors.message && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      )}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : 'message-hint'}
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-1.5 text-sm text-red-600" role="alert">{errors.message}</p>
                    )}
                    {!errors.message && (
                      <p id="message-hint" className="mt-1.5 text-sm text-slate-500">Минимум 20 символа</p>
                    )}
                  </div>

                  {/* Consent */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        id="consent"
                        type="checkbox"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        aria-invalid={!!errors.consent}
                        aria-describedby={errors.consent ? 'consent-error' : undefined}
                      />
                      <span className="text-sm text-slate-600 leading-relaxed">
                        Съгласен/на съм с обработката на моите лични данни за целта на отговор на това запитване,
                        съгласно {' '}
                        <Link to="/privacy-policy" className="text-blue-600 hover:underline">Политиката за поверителност</Link>
                        {' '}
                        и {' '}
                        <Link to="/terms" className="text-blue-600 hover:underline">Общите условия</Link>
                        . <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.consent && (
                      <p id="consent-error" className="mt-1.5 text-sm text-red-600 ml-7" role="alert">{errors.consent}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      variant="primary"
                      disabled={submitStatus === 'submitting'}
                      className="w-full sm:w-auto sm:min-w-[200px]"
                    >
                      {submitStatus === 'submitting' ? (
                        <>
                          <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                          Изпращане...
                        </>
                      ) : (
                        'Изпратете запитване'
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      {quickLinks.length > 0 && (
        <section className="section bg-slate-50" aria-labelledby="contact-quick">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in">
              <h2 id="contact-quick" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-4">
                Бързи връзки към основните ни услуги
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
              {quickLinks.map((item, index) => (
                <Card key={item.title} variant="elevated" padding="lg" className="text-center flex flex-col animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon name={item.icon} size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy-900 mb-3 flex-1">{item.title}</h3>
                  <Button variant="outline" asChild className="w-full mt-auto">
                    <Link to={item.href}>Разгледайте</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="contact-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="contact-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Предпочитате ли директен контакт?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
              Пишете ни на имейл или ни се обадете — ще отговорим бързо и по същество.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
              <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
                <a href={`mailto:${contactInfo.email}`}>Напишете ни на имейл</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                <a href={`tel:${contactInfo.phone}`}>Обадете ни се</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
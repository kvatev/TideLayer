import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { brandConfig } from '../../config/brand';
import { inquiryTypes } from '../../data';

export function Contact() {
  const [formData, setFormData] = useState({
    inquiryType: '',
    productPreselect: '',
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
    if (!formData.inquiryType) newErrors.inquiryType = 'Моля, изберете тип запитване';
    if (!formData.name.trim()) newErrors.name = 'Името е задължително';
    if (!formData.email.trim()) newErrors.email = 'Имейлът е задължителен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Невалиден имейл адрес';
    if (!formData.message.trim()) newErrors.message = 'Съобщението е задължително';
    if (formData.message.trim().length < 20) newErrors.message = 'Съобщението трябва да е минимум 20 символа';
    if (!formData.consent) newErrors.consent = 'Трябва да съгласите с обработката на лични данни';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitStatus('submitting');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would be an actual API call to Supabase/Formspree/etc.
    console.log('Form submitted:', formData);
    
    setSubmitStatus('success');
    setFormData({
      inquiryType: '',
      productPreselect: '',
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const { contact: companyInfo } = brandConfig;

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="contact-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              Контакти
            </Badge>
            <h1 id="contact-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Поздравяваме ви за интереса
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Всеки проект започва с разговор. Опишете ни какво ви трябва и ще се върнем с конкретен предлог в рамките на 1 работен ден.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="section bg-white" aria-labelledby="contact-form-title">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 animate-fade-in">
              <Card variant="elevated" padding="xl" className="sticky top-24 h-fit">
                <h2 className="text-2xl font-heading font-bold text-navy-900 mb-6">Контактна информация</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="MapPin" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900">Адрес</h3>
                      <p className="text-slate-600 text-sm">{companyInfo.address.full}</p>
                      <p className="text-slate-500 text-sm">Обслужваме клиенти в цяла България</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="Mail" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900">Имейл</h3>
                      <a href={`mailto:${companyInfo.email}`} className="text-slate-600 text-sm hover:text-blue-600 transition-colors">
                        {companyInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="Phone" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900">Телефон</h3>
                      <a href={`tel:${companyInfo.phone}`} className="text-slate-600 text-sm hover:text-blue-600 transition-colors">
                        {companyInfo.phone}
                      </a>
                      <p className="text-slate-500 text-sm mt-1">Работно време: Понеделник–Петък 9:00–18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="Clock" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900">Време за отговор</h3>
                      <p className="text-slate-600 text-sm">Обикновено в рамките на 1 работен ден</p>
                      <p className="text-slate-500 text-sm mt-1">За аварийни случаи — според договора за поддръжка</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="font-semibold text-navy-900 mb-4">Също ни можете да намерите</h3>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                      <Icon name="Linkedin" size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors" aria-label="GitHub">
                      <Icon name="Github" size={20} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors" aria-label="Facebook">
                      <Icon name="Facebook" size={20} />
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <Card variant="elevated" padding="xl">
                <h2 id="contact-form-title" className="text-2xl font-heading font-bold text-navy-900 mb-2">Изпратете ни запитване</h2>
                <p className="text-slate-600 mb-8">Попълнете формата и ще се свържем с вас възможно най-скоро.</p>

                {submitStatus === 'success' && (
                  <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-xl animate-fade-in" role="alert">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Icon name="Check" size={16} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Благодарим ви!</h3>
                        <p className="text-green-700 text-sm">Вашето запитване е изпратено успешно. Ще се свържем с вас в кратки срокове.</p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl animate-fade-in" role="alert">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <Icon name="AlertCircle" size={16} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800">Възникна грешка</h3>
                        <p className="text-red-700 text-sm">Моля, опитайте отново или ни пишете директно на имейл.</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Inquiry Type */}
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-navy-900 mb-2">
                      Тип запитване <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border transition-colors',
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
                  {formData.inquiryType === 'education-solutions' && (
                    <div>
                      <label htmlFor="productPreselect" className="block text-sm font-medium text-navy-900 mb-2">
                        Продукт (по избор)
                      </label>
                      <select
                        id="productPreselect"
                        name="productPreselect"
                        value={formData.productPreselect}
                        onChange={handleChange}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border transition-colors',
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
                      placeholder="Опишете ни какво ви е необходимо, какъв е обхватът на проекта, какви са сроковете и бюджетът (ако имате предвидение)..."
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
                        type="checkbox"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        aria-invalid={!!errors.consent}
                        aria-describedby={errors.consent ? 'consent-error' : undefined}
                      />
                      <span className="text-sm text-slate-600 leading-relaxed">
                        Съгласен/на съм с обработката на моите лични данни за целта на отговор на това запитване, 
                        съгласно {' '}
                        <a href="/privacy" className="text-blue-600 hover:underline">Политиката за поверителност</a>
                        {' '}
                        и {' '}
                        <a href="/terms" className="text-blue-600 hover:underline">Общите условия</a>
                        . <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.consent && (
                      <p id="consent-error" className="mt-1.5 text-sm text-red-600 ml-7" role="alert">{errors.consent}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      variant="primary"
                      disabled={submitStatus === 'submitting'}
                      className="w-full sm:w-auto min-w-[200px]"
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
      <section className="section bg-slate-50" aria-labelledby="contact-quick">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="contact-quick" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Бързи връзки към основните ни услуги
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: 'Globe', title: 'Уеб разработка', href: '/web-solutions/website-development' },
              { icon: 'Code', title: 'Уеб приложения', href: '/web-solutions/web-applications' },
              { icon: 'GraduationCap', title: 'Училищни продукти', href: '/education-solutions' },
              { icon: 'Network', title: 'Мрежи и ИТ', href: '/networks-it' },
            ].map((item, index) => (
              <Card key={item.title} variant="elevated" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name={item.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
                <Button variant="outline" asChild className="w-full mt-2">
                  <Link to={item.href}>Разгледайте</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="contact-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="contact-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Предпочитате ли директен контакт?
            </h2>
            <p className="text-slate-300 mb-8">
              Пишете ни на имейл или обадете се — ще отговорим бързо и по същество.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="primary" asChild>
                <a href={`mailto:${companyInfo.email}`}>Напишете ни на имейл</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <a href={`tel:${companyInfo.phone}`}>Обзаведете се</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
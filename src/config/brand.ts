export const brandConfig = {
  name: 'TideLayer Technologies',
  tagline: 'Web. Systems. Support.',
  shortName: 'TideLayer',
  
  // Company info - UPDATE THESE WITH REAL VALUES
  contact: {
    email: 'hello@tidelayer.com',
    phone: '+359 XX XXX XXX',
    address: {
      city: 'Бургас',
      country: 'България',
      full: 'Бургас, България'
    }
  },

  // Social media - UPDATE WITH REAL LINKS
  social: {
    linkedin: 'https://linkedin.com/company/tidelayer',
    github: 'https://github.com/tidelayer',
    facebook: 'https://facebook.com/tidelayer',
    twitter: 'https://twitter.com/tidelayer'
  },

  // SEO defaults
  seo: {
    defaultTitle: 'TideLayer Technologies | Web. Systems. Support.',
    defaultDescription: 'Технологични решения за бизнес и образование. Уеб разработка, софтуер за училища, ИТ инфраструктура и хардуерен сервиз.',
    defaultKeywords: [
      'уеб разработка',
      'софтуер за образование',
      'ИТ инфраструктура',
      'хардуерен сервиз',
      'Бургас',
      'уеб приложения',
      'мрежово оборудване',
      'сървъри',
      'Wi-Fi инсталация'
    ],
    ogImage: '/images/og-default.jpg',
    siteName: 'TideLayer Technologies',
    locale: 'bg_BG',
    url: 'https://tidelayer.com'
  },

  // Navigation structure
  navigation: {
    main: [
      { label: 'Начало', href: '/' },
      { label: 'Уеб решения', href: '/web-solutions', hasDropdown: true },
      { label: 'Училищни решения', href: '/education-solutions', hasDropdown: true },
      { label: 'Мрежи и ИТ', href: '/networks-it', hasDropdown: true },
      { label: 'Хардуерен сервиз', href: '/hardware-service' },
      { label: 'Портфолио', href: '/portfolio' },
      { label: 'За нас', href: '/about' },
      { label: 'Контакти', href: '/contact', isCTA: true }
    ],
    
    webSolutionsDropdown: [
      { label: 'Уеб разработка', href: '/web-solutions/website-development' },
      { label: 'Уеб приложения', href: '/web-solutions/web-applications' },
      { label: 'Поддръжка на уебсайтове', href: '/web-solutions/website-maintenance' }
    ],
    
    educationSolutionsDropdown: [
      { label: 'График на дежурства', href: '/education-solutions/duty-scheduler' },
      { label: 'Система за заявки', href: '/education-solutions/school-ticketing' },
      { label: 'Инвентарна система', href: '/education-solutions/school-inventory' },
      { label: 'ИТ поддръжка за училища', href: '/education-solutions/school-it-support' }
    ],
    
    networksItDropdown: [
      { label: 'Изграждане на мрежи', href: '/networks-it/network-installation' },
      { label: 'Wi-Fi и LAN', href: '/networks-it/wifi-lan' },
      { label: 'Сървъри и NAS', href: '/networks-it/servers-nas' },
      { label: 'Месечна ИТ поддръжка', href: '/networks-it/monthly-support' }
    ]
  },

  // Service divisions in order
  divisions: [
    {
      id: 'web-solutions',
      label: 'Уеб решения',
      shortLabel: 'Web Solutions',
      icon: 'Globe',
      href: '/web-solutions',
      color: 'blue',
      description: 'Професионални уебсайтове, уеб приложения, API интеграции, автоматизация и поддръжка.',
      featured: true
    },
    {
      id: 'education-solutions',
      label: 'Училищни решения',
      shortLabel: 'Education Solutions',
      icon: 'GraduationCap',
      href: '/education-solutions',
      color: 'cyan',
      description: 'Специализиран софтуер за училища и ИТ поддръжка за образователни институции.',
      featured: true
    },
    {
      id: 'networks-it',
      label: 'Мрежи и ИТ инфраструктура',
      shortLabel: 'Networks & IT',
      icon: 'Server',
      href: '/networks-it',
      color: 'navy',
      description: 'Проектиране, инсталация и поддръжка на мрежова инфраструктура, сървъри и VPN.',
      featured: false
    },
    {
      id: 'hardware-service',
      label: 'Хардуерен сервиз',
      shortLabel: 'Hardware Service',
      icon: 'Cpu',
      href: '/hardware-service',
      color: 'slate',
      description: 'Диагностика, ремонт, ъпгрейд и сглобяване на компютри и електроника.',
      featured: false
    }
  ]
} as const;

export type BrandConfig = typeof brandConfig;
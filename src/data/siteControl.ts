import { useState, useEffect } from 'react';
import type { FAQ, Project } from '../types';
import { brandConfig } from '../config/brand';
import { demoProjects, faqs as defaultFaqs } from './index';

export type HomeSectionKey =
  | 'intro'
  | 'divisions'
  | 'portfolioPreview'
  | 'educationShowcase'
  | 'businessIT'
  | 'whyChooseUs'
  | 'process'
  | 'finalCTA';

export interface SiteControlState {
  hiddenNavHrefs: string[];
  hiddenServiceIds: string[];
  hiddenDivisionIds: string[];
  hiddenSections: HomeSectionKey[];
  projects: Project[];
  hiddenProjectIds: string[];
  faqs: FAQ[];
  contactInfo: {
    email: string;
    phone: string;
    addressFull: string;
  };
}

const STORAGE_KEY = 'tl_site_control_v1';
export const SITE_CONTROL_EVENT = 'tl-site-control-changed';

export const HOME_SECTION_LABELS: { key: HomeSectionKey; label: string; description: string }[] = [
  { key: 'intro', label: 'Въведение („За нашия подход“)', description: 'Въвеждащият текстов блок на началната страница' },
  { key: 'divisions', label: 'Основни направления', description: '4-те карти за уеб, училищни, мрежови и хардуерни услуги' },
  { key: 'portfolioPreview', label: 'Избрани проекти (Начало)', description: 'Блокът с последните 3 проекта на началната страница' },
  { key: 'educationShowcase', label: 'Училищен софтуер (Начало)', description: 'Блокът с образователни продукти и ИТ поддръжка' },
  { key: 'businessIT', label: 'ИТ инфраструктура за бизнес', description: 'Тъмният акцент за месечна ИТ поддръжка на началната страница' },
  { key: 'whyChooseUs', label: 'Защо TideLayer', description: '6-те ключови предимства на екипа' },
  { key: 'process', label: 'Процес на работа', description: '5-те стъпки от анализ до поддръжка' },
  { key: 'finalCTA', label: 'Финален CTA банер', description: 'Заключителният блок с бутон „Свържете се с нас“' },
];

export const MANAGEABLE_NAV_ITEMS: { href: string; label: string; group: string; locked?: boolean }[] = [
  { href: '/', label: 'Начало', group: 'Основна навигация', locked: true },
  { href: '/web-solutions', label: 'Уеб решения', group: 'Основна навигация' },
  { href: '/education-solutions', label: 'Училищни решения', group: 'Основна навигация' },
  { href: '/networks-it', label: 'Мрежи и ИТ', group: 'Основна навигация' },
  { href: '/hardware-service', label: 'Хардуерен сервиз', group: 'Основна навигация' },
  { href: '/portfolio', label: 'Портфолио', group: 'Основна навигация' },
  { href: '/contact', label: 'Контакти', group: 'Основна навигация' },

  { href: '/web-solutions/website-development', label: 'Уеб разработка', group: 'Уеб решения' },
  { href: '/web-solutions/website-maintenance', label: 'Поддръжка на уебсайтове', group: 'Уеб решения' },

  { href: '/education-solutions/duty-scheduler', label: 'График на дежурства', group: 'Училищни решения' },
  { href: '/education-solutions/school-ticketing', label: 'Система за заявки', group: 'Училищни решения' },
  { href: '/education-solutions/school-inventory', label: 'Инвентарна система', group: 'Училищни решения' },
  { href: '/education-solutions/school-it-support', label: 'ИТ поддръжка за училища', group: 'Училищни решения' },
  { href: '/education-solutions/teacher-training', label: 'Обучения за учители', group: 'Училищни решения' },

  { href: '/networks-it/network-installation', label: 'Изграждане на мрежи', group: 'Мрежи и ИТ' },
  { href: '/networks-it/monthly-support', label: 'Месечна ИТ поддръжка', group: 'Мрежи и ИТ' },
];

export function getDefaultSiteControl(): SiteControlState {
  return {
    hiddenNavHrefs: [],
    hiddenServiceIds: [],
    hiddenDivisionIds: [],
    hiddenSections: [],
    projects: demoProjects.map((p) => ({ ...p, tags: [...p.tags] })),
    hiddenProjectIds: [],
    faqs: defaultFaqs.map((f) => ({ ...f })),
    contactInfo: {
      email: brandConfig.contact.email,
      phone: brandConfig.contact.phone,
      addressFull: brandConfig.contact.address.full,
    },
  };
}

function normalizeState(raw: Partial<SiteControlState> | null | undefined): SiteControlState {
  const def = getDefaultSiteControl();
  if (!raw || typeof raw !== 'object') return def;
  return {
    hiddenNavHrefs: Array.isArray(raw.hiddenNavHrefs) ? raw.hiddenNavHrefs : def.hiddenNavHrefs,
    hiddenServiceIds: Array.isArray(raw.hiddenServiceIds) ? raw.hiddenServiceIds : def.hiddenServiceIds,
    hiddenDivisionIds: Array.isArray(raw.hiddenDivisionIds) ? raw.hiddenDivisionIds : def.hiddenDivisionIds,
    hiddenSections: Array.isArray(raw.hiddenSections) ? raw.hiddenSections : def.hiddenSections,
    projects: Array.isArray(raw.projects) ? raw.projects : def.projects,
    hiddenProjectIds: Array.isArray(raw.hiddenProjectIds) ? raw.hiddenProjectIds : def.hiddenProjectIds,
    faqs: Array.isArray(raw.faqs) ? raw.faqs : def.faqs,
    contactInfo: {
      email: typeof raw.contactInfo?.email === 'string' ? raw.contactInfo.email : def.contactInfo.email,
      phone: typeof raw.contactInfo?.phone === 'string' ? raw.contactInfo.phone : def.contactInfo.phone,
      addressFull: typeof raw.contactInfo?.addressFull === 'string' ? raw.contactInfo.addressFull : def.contactInfo.addressFull,
    },
  };
}

export function loadSiteControl(): SiteControlState {
  if (typeof window === 'undefined') return getDefaultSiteControl();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSiteControl();
    return normalizeState(JSON.parse(raw));
  } catch {
    return getDefaultSiteControl();
  }
}

function persist(next: SiteControlState): SiteControlState {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(SITE_CONTROL_EVENT));
    } catch {
      // ignore storage quota issues
    }
  }
  return next;
}

export const siteControlStore = {
  getState(): SiteControlState {
    return loadSiteControl();
  },

  update(updater: (prev: SiteControlState) => SiteControlState): SiteControlState {
    const current = loadSiteControl();
    return persist(updater(current));
  },

  toggleNavHref(href: string): SiteControlState {
    return this.update((s) => {
      const hidden = s.hiddenNavHrefs.includes(href);
      return {
        ...s,
        hiddenNavHrefs: hidden
          ? s.hiddenNavHrefs.filter((h) => h !== href)
          : [...s.hiddenNavHrefs, href],
      };
    });
  },

  hideAllOptionalNav(): SiteControlState {
    const optionalHrefs = MANAGEABLE_NAV_ITEMS.filter((i) => !i.locked).map((i) => i.href);
    return this.update((s) => ({
      ...s,
      hiddenNavHrefs: optionalHrefs,
    }));
  },

  restoreAllNav(): SiteControlState {
    return this.update((s) => ({ ...s, hiddenNavHrefs: [] }));
  },

  toggleDivision(id: string): SiteControlState {
    return this.update((s) => {
      const hidden = s.hiddenDivisionIds.includes(id);
      return {
        ...s,
        hiddenDivisionIds: hidden
          ? s.hiddenDivisionIds.filter((d) => d !== id)
          : [...s.hiddenDivisionIds, id],
      };
    });
  },

  hideAllDivisions(): SiteControlState {
    return this.update((s) => ({
      ...s,
      hiddenDivisionIds: brandConfig.divisions.map((d) => d.id),
    }));
  },

  restoreAllDivisions(): SiteControlState {
    return this.update((s) => ({ ...s, hiddenDivisionIds: [] }));
  },

  toggleSection(key: HomeSectionKey): SiteControlState {
    return this.update((s) => {
      const hidden = s.hiddenSections.includes(key);
      return {
        ...s,
        hiddenSections: hidden
          ? s.hiddenSections.filter((k) => k !== key)
          : [...s.hiddenSections, key],
      };
    });
  },

  hideAllSections(): SiteControlState {
    return this.update((s) => ({
      ...s,
      hiddenSections: HOME_SECTION_LABELS.map((x) => x.key),
    }));
  },

  restoreAllSections(): SiteControlState {
    return this.update((s) => ({ ...s, hiddenSections: [] }));
  },

  addProject(project: Omit<Project, 'id'>): SiteControlState {
    const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return this.update((s) => ({
      ...s,
      projects: [{ ...project, id }, ...s.projects],
    }));
  },

  toggleProjectVisibility(id: string): SiteControlState {
    return this.update((s) => {
      const hidden = s.hiddenProjectIds.includes(id);
      return {
        ...s,
        hiddenProjectIds: hidden
          ? s.hiddenProjectIds.filter((p) => p !== id)
          : [...s.hiddenProjectIds, id],
      };
    });
  },

  deleteProject(id: string): SiteControlState {
    return this.update((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      hiddenProjectIds: s.hiddenProjectIds.filter((p) => p !== id),
    }));
  },

  deleteAllProjects(): SiteControlState {
    return this.update((s) => ({ ...s, projects: [], hiddenProjectIds: [] }));
  },

  restoreDefaultProjects(): SiteControlState {
    return this.update((s) => ({
      ...s,
      projects: demoProjects.map((p) => ({ ...p, tags: [...p.tags] })),
      hiddenProjectIds: [],
    }));
  },

  deleteFaq(id: string): SiteControlState {
    return this.update((s) => ({
      ...s,
      faqs: s.faqs.filter((f) => f.id !== id),
    }));
  },

  addFaq(question: string, answer: string): SiteControlState {
    const id = `faq-${Date.now()}`;
    return this.update((s) => ({
      ...s,
      faqs: [{ id, question, answer }, ...s.faqs],
    }));
  },

  deleteAllFaqs(): SiteControlState {
    return this.update((s) => ({ ...s, faqs: [] }));
  },

  restoreDefaultFaqs(): SiteControlState {
    return this.update((s) => ({
      ...s,
      faqs: defaultFaqs.map((f) => ({ ...f })),
    }));
  },

  updateContactInfo(info: { email: string; phone: string; addressFull: string }): SiteControlState {
    return this.update((s) => ({ ...s, contactInfo: info }));
  },

  clearAllSiteContent(): SiteControlState {
    return persist({
      hiddenNavHrefs: MANAGEABLE_NAV_ITEMS.filter((i) => !i.locked).map((i) => i.href),
      hiddenServiceIds: [],
      hiddenDivisionIds: brandConfig.divisions.map((d) => d.id),
      hiddenSections: HOME_SECTION_LABELS.map((x) => x.key),
      projects: [],
      hiddenProjectIds: [],
      faqs: [],
      contactInfo: loadSiteControl().contactInfo,
    });
  },

  resetAllToDefaults(): SiteControlState {
    return persist(getDefaultSiteControl());
  },
};

export function useSiteControl(): SiteControlState {
  const [state, setState] = useState<SiteControlState>(() => loadSiteControl());

  useEffect(() => {
    const sync = () => setState(loadSiteControl());
    window.addEventListener(SITE_CONTROL_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SITE_CONTROL_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return state;
}


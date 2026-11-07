// Inquiry store with demo seed data so the admin panel looks populated
import type { InquiryType } from '../types';

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

export type Inquiry = {
  id: string;
  inquiryType: string;
  productPreselect?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  createdAt: string;
  status: InquiryStatus;
};

// Seed demo inquiries so the panel looks real from day one
const SEED: Inquiry[] = [
  {
    id: 'demo-1',
    inquiryType: 'website-development',
    name: 'Георги Петров',
    email: 'g.petrov@firma.bg',
    phone: '+359 88 123 4567',
    company: 'Петров ЕООД',
    message: 'Здравейте, искам да направим корпоративен уебсайт за нашата фирма. Занимаваме се с дистрибуция на строителни материали и имаме нужда от каталог с продукти и форма за запитване.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'new',
  },
  {
    id: 'demo-2',
    inquiryType: 'network-installation',
    name: 'Марийка Иванова',
    email: 'm.ivanova@school.bg',
    phone: '+359 87 987 6543',
    company: 'ОУ „Васил Левски"',
    message: 'Нуждаем се от изграждане на структурирана кабелна мрежа в нова сграда. Имаме 3 етажа, 18 класни стаи, компютърен кабинет и административно крило.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'read',
  },
  {
    id: 'demo-3',
    inquiryType: 'monthly-support',
    name: 'Стоян Николов',
    email: 'stoyan@techstart.bg',
    company: 'TechStart Ltd.',
    message: 'Търся абонаментна ИТ поддръжка за офис от 15 човека. Имаме сървър, NAS и около 20 работни станции. Интересува ме какви планове предлагате.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'replied',
  },
  {
    id: 'demo-4',
    inquiryType: 'duty-scheduler',
    name: 'Елена Стоянова',
    email: 'elena.stoyanova@sou.edu.bg',
    phone: '+359 89 456 7890',
    company: 'СОУ „Климент Охридски"',
    message: 'Директорът ни препоръча вашата система за дежурства. Училището ни има 48 учители и 3 смени. Искам демонстрация.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    status: 'new',
  },
  {
    id: 'demo-5',
    inquiryType: 'hardware-service',
    name: 'Димитър Георгиев',
    email: 'd.georgiev@mail.bg',
    phone: '+359 88 321 0987',
    message: 'Лаптопът ми не се включва след гръмотевична буря. Нужна ми е диагностика и евентуален ремонт. Кога мога да го донеса?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    status: 'archived',
  },
];

const inquiries: Inquiry[] = [...SEED];

export const inquiryStore = {
  add(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Inquiry {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    inquiries.unshift(newInquiry);
    return newInquiry;
  },

  getAll(): Inquiry[] {
    return [...inquiries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): Inquiry | undefined {
    return inquiries.find((i) => i.id === id);
  },

  updateStatus(id: string, status: InquiryStatus): boolean {
    const idx = inquiries.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    inquiries[idx] = { ...inquiries[idx], status };
    return true;
  },

  delete(id: string): boolean {
    const idx = inquiries.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    inquiries.splice(idx, 1);
    return true;
  },

  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      new: all.filter((i) => i.status === 'new').length,
      read: all.filter((i) => i.status === 'read').length,
      replied: all.filter((i) => i.status === 'replied').length,
      archived: all.filter((i) => i.status === 'archived').length,
    };
  },
};

// Legacy compat — keep addInquiry export working from Contact.tsx
export const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) =>
  inquiryStore.add(inquiry);

export const getInquiries = () => inquiryStore.getAll();

// Re-export type for external use
export type { InquiryType };

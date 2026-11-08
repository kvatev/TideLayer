export type ItemCondition = 'new' | 'good' | 'needs_repair' | 'written_off' | 'missing';

export interface InventoryCategory {
  id: string;
  school_id: string;
  name: string;
  description: string | null;
  created_at?: string;
}

export interface InventoryRoom {
  id: string;
  school_id: string;
  name: string;
  building_or_floor: string | null;
  responsible_person: string | null; // МОЛ на кабинета
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  school_id: string;
  room_id: string | null;
  category_id: string | null;
  name: string;
  inventory_code: string;
  serial_number: string | null;
  brand_or_model?: string | null;
  quantity: number;
  condition: ItemCondition;
  assigned_to: string | null; // МОЛ
  purchase_date: string | null; // YYYY-MM-DD
  warranty_until?: string | null; // YYYY-MM-DD
  purchase_price: number | null; // in EUR €
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined / computed for fast UI rendering
  room_name?: string;
  category_name?: string;
}

export interface InventoryLog {
  id: string;
  school_id: string;
  item_id: string | null;
  item_name?: string;
  actor_name: string;
  action: string;
  notes: string | null;
  created_at: string;
}

export const CONDITION_META: Record<
  ItemCondition,
  { label: string; badge: string; bg: string; text: string }
> = {
  new: {
    label: 'Отлично (Ново)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  good: {
    label: 'Добро (Изправно)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  needs_repair: {
    label: 'За ремонт / Сервиз',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
  },
  written_off: {
    label: 'Бракувано',
    badge: 'bg-slate-200 text-slate-700 border-slate-300',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  },
  missing: {
    label: 'Липсва / Изгубено',
    badge: 'bg-red-50 text-red-700 border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-700',
  },
};

export function formatEur(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00 €';
  }
  return `${amount.toLocaleString('bg-BG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export function isValidUuid(str: string | null | undefined): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function makeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

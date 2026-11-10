export type ItemCondition = 'new' | 'good' | 'needs_repair' | 'written_off' | 'missing';

export type TrackingType = 'individual' | 'batch';

export type RoomType =
  | 'classroom'
  | 'it_lab'
  | 'stem_lab'
  | 'teacher_room'
  | 'gym'
  | 'lab'
  | 'library'
  | 'office'
  | 'storage'
  | 'other';

export type InventoryUserRole =
  | 'admin'
  | 'inventory_manager'
  | 'room_responsible'
  | 'viewer';

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
  room_number?: string | null; // напр. "201", "104", "Б-12"
  name: string;
  room_type?: RoomType | null;
  building?: string | null; // напр. "Корпус А", "Корпус Б"
  floor?: string | null; // напр. "Етаж 2", "Партер"
  building_or_floor?: string | null; // backward compatibility
  responsible_person: string | null; // МОЛ на кабинета
  responsible_user_id?: string | null; // ID на училищен потребител, ако има
  description?: string | null;
  is_archived?: boolean;
  created_at?: string;
}

export interface ItemAttachment {
  id: string;
  name: string;
  url: string;
  type: 'photo' | 'document';
  size_kb?: number;
  uploaded_at: string;
}

export interface InventoryItem {
  id: string;
  school_id: string;
  room_id: string | null;
  category_id: string | null;
  name: string;
  inventory_code: string; // Уникален инвентарен номер
  tracking_type: TrackingType; // individual vs batch
  manufacturer?: string | null; // Производител
  model?: string | null; // Модел
  brand_or_model?: string | null; // backward compatibility
  serial_number: string | null;
  quantity: number; // 1 за индивидуални, N за количествени
  condition: ItemCondition;
  assigned_to: string | null; // МОЛ
  assigned_user_id?: string | null;
  purchase_date: string | null; // YYYY-MM-DD
  warranty_until?: string | null; // YYYY-MM-DD
  purchase_price: number | null; // in EUR €
  notes: string | null;
  description?: string | null;
  photos?: string[]; // URLs or base64
  attachments?: ItemAttachment[];
  is_archived?: boolean;
  is_written_off?: boolean;
  written_off_date?: string | null;
  written_off_reason?: string | null;
  created_at: string;
  updated_at: string;

  // Joined / computed for fast UI rendering
  room_name?: string;
  room_number?: string | null;
  category_name?: string;
}

export interface InventoryMovement {
  id: string;
  school_id: string;
  item_id: string;
  item_name: string;
  inventory_code: string;
  from_room_id: string | null;
  from_room_name: string;
  to_room_id: string | null;
  to_room_name: string;
  from_mol?: string | null;
  to_mol?: string | null;
  moved_by_name: string;
  moved_by_user_id?: string | null;
  movement_date: string;
  reason?: string | null;
  created_at: string;
}

export type AuditScope = 'all' | 'rooms' | 'categories';
export type AuditStatus = 'in_progress' | 'completed' | 'cancelled';
export type AuditItemStatus =
  | 'present'
  | 'missing'
  | 'damaged'
  | 'discrepancy'
  | 'unverified';

export interface InventoryAuditSession {
  id: string;
  school_id: string;
  title: string;
  order_number?: string | null; // Заповед №
  scope: AuditScope;
  target_room_ids: string[];
  target_category_ids: string[];
  committee_members: string[]; // Имената на членовете на комисията
  status: AuditStatus;
  started_at: string;
  completed_at?: string | null;
  summary_notes?: string | null;
  created_by_name: string;
  created_at: string;
}

export interface InventoryAuditItem {
  id: string;
  school_id: string;
  audit_id: string;
  item_id: string;
  item_name: string;
  inventory_code: string;
  expected_room_id: string | null;
  expected_room_name: string;
  found_room_id: string | null;
  status: AuditItemStatus;
  notes?: string | null;
  checked_by_name?: string | null;
  checked_at?: string | null;
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

export const ROOM_TYPE_LABELS: Record<RoomType, { label: string; icon: string }> = {
  classroom: { label: 'Класна стая / Кабинет', icon: 'GraduationCap' },
  it_lab: { label: 'Компютърен кабинет', icon: 'Monitor' },
  stem_lab: { label: 'STEM лаборатория', icon: 'Cpu' },
  teacher_room: { label: 'Учителска стая', icon: 'Users' },
  gym: { label: 'Физкултурен салон / База', icon: 'Target' },
  lab: { label: 'Специализирана лаборатория', icon: 'Sparkles' },
  library: { label: 'Училищна библиотека', icon: 'BookOpen' },
  office: { label: 'Административен офис / Дирекция', icon: 'Briefcase' },
  storage: { label: 'Склад / Хранилище', icon: 'Package' },
  other: { label: 'Друго помещение', icon: 'Building' },
};

export function getRoomTypeLabel(type?: RoomType | string | null): string {
  if (!type) return 'Помещение';
  const meta = ROOM_TYPE_LABELS[type as RoomType];
  if (!meta) return String(type);
  return typeof meta === 'object' && meta ? meta.label : String(meta);
}

export const CONDITION_META: Record<
  ItemCondition,
  { label: string; badge: string; bg: string; text: string; colorClass: string; dotColor: string }
> = {
  new: {
    label: 'Отлично (Ново)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  good: {
    label: 'Добро (Изправно)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  needs_repair: {
    label: 'За ремонт / Сервиз',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
  },
  written_off: {
    label: 'Бракувано',
    badge: 'bg-slate-200 text-slate-700 border-slate-300',
    colorClass: 'bg-slate-200 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-500',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  },
  missing: {
    label: 'Липсва / Изгубено',
    badge: 'bg-red-50 text-red-700 border-red-200',
    colorClass: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
  },
};

export const AUDIT_ITEM_STATUS_META: Record<
  AuditItemStatus,
  { label: string; badge: string; color: string; colorClass: string }
> = {
  present: {
    label: 'Наличен',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    color: 'text-emerald-600',
  },
  missing: {
    label: 'Липсващ',
    badge: 'bg-red-50 text-red-700 border-red-200',
    colorClass: 'bg-red-50 text-red-700 border-red-200',
    color: 'text-red-600',
  },
  damaged: {
    label: 'Повреден',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    color: 'text-amber-600',
  },
  discrepancy: {
    label: 'С несъответствие',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    color: 'text-purple-600',
  },
  unverified: {
    label: 'Непроверен',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    color: 'text-slate-400',
  },
};

export const AUDIT_STATUS_META: Record<
  AuditStatus,
  { label: string; badge: string }
> = {
  in_progress: {
    label: 'В процес на ревизия',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'Приключена (Заключена)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Анулирана',
    badge: 'bg-slate-100 text-slate-600 border-slate-300',
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

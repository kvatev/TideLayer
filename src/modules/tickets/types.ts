export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'ordered'
  | 'delivered'
  | 'rejected';

export interface TicketDepartment {
  id: string;
  school_id: string;
  name: string;
  description: string | null;
  color?: string | null;
  manager_name?: string | null;
  created_at?: string;
}

export type DocumentFileType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'other';

export interface TaskDocumentAttachment {
  id: string;
  school_id: string;
  task_id: string;
  message_id?: string | null;
  file_name: string;
  file_size_bytes: number;
  file_type: DocumentFileType;
  mime_type: string;
  file_url: string; // public URL, blob, or data URL
  uploaded_by_user_id: string | null;
  uploaded_by_name: string;
  uploaded_by_role: string;
  uploaded_at: string;
}

export interface SchoolTicket {
  id: string;
  school_id: string;
  department_id: string | null;
  created_by_user_id: string | null;
  assigned_to_user_id: string | null;
  assigned_role_target?: string | null; // напр. 'all_teachers', 'all_administration', 'all_staff'
  assigned_user_ids?: string[];
  due_date?: string | null;
  title: string;
  description: string;
  room_or_location: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  department_name?: string;
  creator_name?: string;
  creator_role?: string;
  assignee_name?: string;
  assignee_role?: string;
  messages_count?: number;
  attachments_count?: number;
  attachments?: TaskDocumentAttachment[];
}

export interface TicketMessage {
  id: string;
  school_id: string;
  ticket_id: string;
  sender_user_id: string | null;
  sender_name: string;
  sender_role?: string;
  message: string;
  attachments?: TaskDocumentAttachment[];
  created_at: string;
}

export interface TicketOrder {
  id: string;
  school_id: string;
  ticket_id: string | null;
  item_name: string;
  quantity: number;
  estimated_price: number | null; // strictly in EUR (€)
  status: OrderStatus;
  created_at: string;
  // Computed / joined fields
  ticket_title?: string;
}

export interface TicketChannel {
  id: string;
  school_id: string;
  name: string;
  channel_type: string;
  is_active: boolean;
  created_at: string;
}

export interface ChannelMessage {
  id: string;
  school_id: string;
  channel_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
}

export interface TicketAnnouncement {
  id: string;
  school_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface TicketAuditLog {
  id: string;
  school_id: string;
  ticket_id: string | null;
  actor_name: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export const PRIORITY_LABELS: Record<
  TicketPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  low: {
    label: 'Нисък',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  medium: {
    label: 'Нормален',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  high: {
    label: 'Висок',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  urgent: {
    label: 'Спешен',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export const STATUS_LABELS: Record<
  TicketStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  open: {
    label: 'Нова задача',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-600',
  },
  in_progress: {
    label: 'В процес',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  resolved: {
    label: 'Изпълнена / За преглед',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
  },
  closed: {
    label: 'Приключена / Одобрена',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
};

export const DOCUMENT_TYPE_META: Record<
  DocumentFileType,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    iconColor: string;
    dotColor: string;
    extList: string[];
  }
> = {
  pdf: {
    label: 'PDF Документ',
    badgeBg: 'bg-red-50 text-red-700',
    badgeText: 'PDF',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    dotColor: 'bg-red-500',
    extList: ['.pdf'],
  },
  word: {
    label: 'Word Документ',
    badgeBg: 'bg-blue-50 text-blue-700',
    badgeText: 'DOCX',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    dotColor: 'bg-blue-500',
    extList: ['.doc', '.docx'],
  },
  excel: {
    label: 'Excel Таблица',
    badgeBg: 'bg-emerald-50 text-emerald-700',
    badgeText: 'XLSX',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    dotColor: 'bg-emerald-500',
    extList: ['.xls', '.xlsx', '.csv'],
  },
  powerpoint: {
    label: 'PowerPoint Презентация',
    badgeBg: 'bg-amber-50 text-amber-800',
    badgeText: 'PPTX',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    dotColor: 'bg-amber-500',
    extList: ['.ppt', '.pptx'],
  },
  other: {
    label: 'Файл',
    badgeBg: 'bg-slate-100 text-slate-700',
    badgeText: 'FILE',
    border: 'border-slate-200',
    iconColor: 'text-slate-600',
    dotColor: 'bg-slate-400',
    extList: [],
  },
};

export function detectDocumentType(fileName: string, mimeType?: string): DocumentFileType {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  if (ext === '.pdf' || mimeType?.includes('pdf')) return 'pdf';
  if (['.doc', '.docx'].includes(ext) || mimeType?.includes('word') || mimeType?.includes('msword')) return 'word';
  if (['.xls', '.xlsx', '.csv'].includes(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'excel';
  if (['.ppt', '.pptx'].includes(ext) || mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return 'powerpoint';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const RETENTION_DAYS = 365;

export function getDocumentRetentionInfo(uploadedAt: string): {
  isWithinRetention: boolean;
  daysPassed: number;
  daysRemaining: number;
  retentionLabel: string;
} {
  const uploadMs = new Date(uploadedAt).getTime();
  const nowMs = Date.now();
  const diffDays = Math.floor((nowMs - uploadMs) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, RETENTION_DAYS - diffDays);
  const isWithinRetention = diffDays <= RETENTION_DAYS;

  return {
    isWithinRetention,
    daysPassed: diffDays,
    daysRemaining,
    retentionLabel: isWithinRetention
      ? `Остават ${daysRemaining} дни от 1-год. архив`
      : 'Архивиран (над 1 година)',
  };
}

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  pending: {
    label: 'Чака одобрение',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
  },
  approved: {
    label: 'Одобрена',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
  },
  ordered: {
    label: 'Поръчана',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
  },
  delivered: {
    label: 'Доставена',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
  },
  rejected: {
    label: 'Отхвърлена',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
  },
};

export function formatEur(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '0.00 €';
  }
  return `${amount.toFixed(2)} €`;
}

export function isValidUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
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


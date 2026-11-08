export type SchoolStage = 'secondary' | 'primary';

export interface DutyLocation {
  id: string;
  school_id?: string;
  name: string;
  floor_or_zone: string | null;
  stage: SchoolStage;
  required_teachers: number;
  sort_order: number;
}

export interface Teacher {
  id: string;
  name: string;
  stage?: SchoolStage;
  periodId?: string;
}

export interface DutyAssignment {
  id?: string;
  teacherId: string;
  day: string;
  location: string;
  shiftNumber?: string | number | null;
  stage?: SchoolStage;
  note?: string | null;
  periodId?: string;
}

export interface CellTeacher extends Teacher {
  shiftNumber?: string | number | null;
  note?: string | null;
}

export const SHIFT_PRESETS = ['1', '2', '1, 2', '1,2'] as const;

export interface SchoolPeriod {
  year: string; // e.g. "2025/2026"
  term: 1 | 2;  // 1 = I срок, 2 = II срок
}

export interface DBPeriod {
  id: string;
  year: string;
  term: 1 | 2;
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface UnavailabilityEntry {
  id: string;
  teacher_id: string;
  weekday: Weekday | null;
  specific_date: string | null;
  note: string | null;
}

export interface DutyBroadcast {
  id: string;
  title?: string | null;
  message: string;
  priority: 'info' | 'warning' | 'urgent';
  is_active?: boolean;
  created_at: string;
}

export interface FullDutyBackup {
  version: number;
  exportedAt: string;
  schoolSlug: string;
  schoolName: string;
  periods: DBPeriod[];
  teachers: Teacher[];
  locations: DutyLocation[];
  assignments: DutyAssignment[];
  unavailabilities: UnavailabilityEntry[];
  broadcasts: DutyBroadcast[];
  settings: DutyAppSettings;
}

export function formatPeriodLabel(period: SchoolPeriod): string {
  return `${period.year} - ${period.term === 1 ? 'I срок' : 'II срок'}`;
}

export function parsePeriodLabel(label: string): SchoolPeriod | null {
  const trimmed = label.trim();
  const match = trimmed.match(/^(\d{4}\/\d{4})\s*-\s*(I|II)\s*срок$/i);
  if (!match) return null;
  return {
    year: match[1],
    term: match[2].toUpperCase() === 'II' ? 2 : 1,
  };
}

export function isValidUuid(value: string): boolean {
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

export interface DutyAppSettings {
  header_title: string;
  header_subtitle: string;
  footer_note: string;
  admin_name: string;
  admin_email: string;
  pdf_school_name: string;
  pdf_school_info1: string;
  pdf_school_info2: string;
  pdf_director_name: string;
  pdf_schedule_description: string;
  location_1: string;
  location_2: string;
  location_3: string;
  location_4: string;
  location_5: string;
  primary_location_1: string;
  primary_location_2: string;
  primary_location_3: string;
  logo_url: string;
  schedule_title: string;
  approval_text: string;
  approval_role: string;
  day_column_header: string;
  tip_text: string;
  term_1_label: string;
  term_2_label: string;
  pdf_schedule_description_primary: string;
}

export const DAYS = [
  'Понеделник',
  'Вторник',
  'Сряда',
  'Четвъртък',
  'Петък',
] as const;

export const DAY_TO_NUMBER: Record<string, number> = {
  Понеделник: 1,
  Вторник: 2,
  Сряда: 3,
  Четвъртък: 4,
  Петък: 5,
};

export const NUMBER_TO_DAY: Record<number, string> = {
  1: 'Понеделник',
  2: 'Вторник',
  3: 'Сряда',
  4: 'Четвъртък',
  5: 'Петък',
};

export const DAY_NAME_TO_WEEKDAY: Record<string, Weekday> = {
  Понеделник: 'monday',
  Вторник: 'tuesday',
  Сряда: 'wednesday',
  Четвъртък: 'thursday',
  Петък: 'friday',
  Събота: 'saturday',
  Неделя: 'sunday',
};

export const WEEKDAY_TO_BG: Record<Weekday, string> = {
  monday: 'Понеделник',
  tuesday: 'Вторник',
  wednesday: 'Сряда',
  thursday: 'Четвъртък',
  friday: 'Петък',
  saturday: 'Събота',
  sunday: 'Неделя',
};

export const CANTEEN_DUTY_PRESETS = [
  'фоайе',
  'столова',
  'столова/фоайе',
  'стол',
  'пред кабинет по музика',
] as const;

export function getCurrentPeriod(): SchoolPeriod {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  if (month >= 8) {
    return { year: `${year}/${year + 1}`, term: 1 };
  } else if (month === 0) {
    return { year: `${year - 1}/${year}`, term: 1 };
  } else {
    return { year: `${year - 1}/${year}`, term: 2 };
  }
}

export function createDefaultDutySettings(
  schoolName: string,
  schoolCity?: string | null,
  schoolLogoUrl?: string | null,
  contactPerson?: string | null,
  contactEmail?: string | null
): DutyAppSettings {
  const subtitle = schoolCity ? `${schoolName}, гр. ${schoolCity}` : schoolName;
  return {
    header_title: 'График за дежурства',
    header_subtitle: subtitle,
    footer_note:
      '*Забележка: 1 - дежури от 07:30-08:00 ч.; 2 - дежури от 08:00 до 08:40 ч.',
    admin_name: contactPerson || 'Училищен администратор',
    admin_email: contactEmail || 'info@tidelayer.bg',
    pdf_school_name: schoolName.toUpperCase(),
    pdf_school_info1: schoolCity ? `гр. ${schoolCity}` : '',
    pdf_school_info2: contactEmail ? `e-mail: ${contactEmail}` : '',
    pdf_director_name: contactPerson ? contactPerson.toUpperCase() : 'ДИРЕКТОР',
    pdf_schedule_description:
      'за дежурство на учителите от прогимназиален и гимназиален етап',
    location_1: 'Дежурни на III-ти етаж',
    location_2: 'Дежурни на IV-ти етаж',
    location_3: 'Училищен стол и пред кабинет по музика',
    location_4: 'Главен дежурен – западен вход 07:30-08:40 ч.',
    location_5: 'Дежурен на 0 етаж',
    primary_location_1: 'Главен дежурен параден вход - 07:00 ч.',
    primary_location_2: 'Дежурен на I етаж - 07:30 ч.',
    primary_location_3: 'Дежурен на II етаж - 07:30 ч.',
    logo_url: schoolLogoUrl || '',
    schedule_title: 'ГРАФИК',
    approval_text: 'УТВЪРЖДАВАМ:',
    approval_role: 'ДИРЕКТОР',
    day_column_header: 'Ден от седмицата',
    tip_text:
      '💡 Съвет: Провлачете учител от списъка вляво в желаната клетка, преместете между клетки или натиснете „+ Добави“ в клетката.',
    term_1_label: 'I учебен срок',
    term_2_label: 'II учебен срок',
    pdf_schedule_description_primary:
      'за дежурство на учителите от начален етап (I - IV клас)',
  };
}


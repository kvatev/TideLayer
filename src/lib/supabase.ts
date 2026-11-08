import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://lbvkdzixgylydeicmiqp.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_On5b3Rw7topxR7Vw2At5yw_y72MFwMU';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() || DEFAULT_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// =============================================================================
// MULTI-TENANT SAAS TYPES
// =============================================================================

export type SchoolModuleKey = 'duty' | 'tickets' | 'inventory';
export type LicensePlanType = '6_months' | '1_year' | '2_years' | 'custom';
export type SchoolUserRole =
  | 'director'
  | 'school_admin'
  | 'deputy_director'
  | 'administration'
  | 'teacher'
  | 'staff'
  | 'technician';

export const ROLE_HIERARCHY_LEVEL: Record<SchoolUserRole, number> = {
  director: 1,
  school_admin: 1,
  deputy_director: 2,
  administration: 3,
  teacher: 4,
  staff: 4,
  technician: 4,
};

/**
 * Checks if a user role can assign tasks to a target role in school hierarchy.
 * - Level 1 (Director / School Admin) can assign to all roles.
 * - Level 2 (Deputy Director) can assign to Administration, Teachers, Staff.
 * - Level 3 (Administration) can assign to Teachers and Staff.
 * - Level 4 (Teacher / Staff) cannot assign downward tasks.
 */
export function canAssignTaskToRole(sourceRole: SchoolUserRole, targetRole: SchoolUserRole): boolean {
  const sourceLevel = ROLE_HIERARCHY_LEVEL[sourceRole] ?? 4;
  if (sourceLevel === 1) return true;
  const targetLevel = ROLE_HIERARCHY_LEVEL[targetRole] ?? 4;
  return targetLevel > sourceLevel;
}

export interface SchoolRecord {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface SchoolLicenseRecord {
  id: string;
  school_id: string;
  module_key: SchoolModuleKey;
  is_enabled: boolean;
  plan_type: LicensePlanType | null;
  paid_at: string | null;
  expires_at: string | null;
  price_paid: number | null;
  updated_at: string;
}

export interface SchoolUserRecord {
  id: string;
  school_id: string;
  auth_user_id: string | null;
  email: string;
  password_hash: string;
  pin_code: string | null;
  full_name: string;
  role: SchoolUserRole;
  allowed_modules: SchoolModuleKey[];
  is_active: boolean;
  created_at: string;
}

export interface SchoolBundle {
  school: SchoolRecord;
  licenses: Record<SchoolModuleKey, SchoolLicenseRecord>;
  users: SchoolUserRecord[];
}

export interface LicenseAlert {
  id: string;
  type: 'expired' | 'expiring_soon';
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  moduleKey: SchoolModuleKey;
  moduleName: string;
  expiresAt: string;
  daysRemaining: number;
}

export interface SchoolPortalSession {
  schoolId: string;
  schoolSlug: string;
  userId: string;
  fullName: string;
  email: string;
  role: SchoolUserRole;
  allowedModules: SchoolModuleKey[];
  isSuperAdminPreview?: boolean;
  loggedInAt: string;
}

export const ALL_MODULE_KEYS: SchoolModuleKey[] = ['duty', 'tickets', 'inventory'];

export const MODULE_META: Record<
  SchoolModuleKey,
  {
    key: SchoolModuleKey;
    name: string;
    shortName: string;
    description: string;
    icon: string;
    accentColor: string;
  }
> = {
  duty: {
    key: 'duty',
    name: 'График за дежурства',
    shortName: 'Дежурства',
    description: 'Седмично разпределение на дежурните учители по етажи, зони, смени и часови диапазони с PDF експорт.',
    icon: 'Calendar',
    accentColor: 'blue',
  },
  tickets: {
    key: 'tickets',
    name: 'Система за задачи и документи',
    shortName: 'Задачи и Документи',
    description: 'Вътрешно възлагане на задачи, йерархичен контрол, споделяне на учебни документи и 1-годишен архив.',
    icon: 'ClipboardList',
    accentColor: 'cyan',
  },
  inventory: {
    key: 'inventory',
    name: 'Инвентарна система',
    shortName: 'Инвентар',
    description: 'Регистър на техника, компютърни кабинети, интерактивни дисплеи, серийни номера и материално отговорни лица.',
    icon: 'Monitor',
    accentColor: 'emerald',
  },
};

export const ROLE_LABELS: Record<SchoolUserRole, string> = {
  director: 'Директор (Ниво 1)',
  school_admin: 'Училищен Админ / Директор (Ниво 1)',
  deputy_director: 'Заместник-директор (Ниво 2)',
  administration: 'Администрация / ЗАС / Счетоводство (Ниво 3)',
  teacher: 'Учител (Ниво 4)',
  staff: 'Служител / Персонал (Ниво 4)',
  technician: 'ИТ координатор / Техник (Ниво 4)',
};

// =============================================================================
// CYRILLIC TO SLUG HELPER
// =============================================================================

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
};

export function slugifySchoolName(input: string): string {
  const lower = input.trim().toLowerCase();
  let out = '';
  for (const ch of lower) {
    if (CYRILLIC_MAP[ch] !== undefined) {
      out += CYRILLIC_MAP[ch];
    } else if (/[a-z0-9]/.test(ch)) {
      out += ch;
    } else if (/\s|-|_/.test(ch)) {
      out += '-';
    }
  }
  return out
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

// =============================================================================
// LICENSE STATUS & ALERT HELPERS
// =============================================================================

export interface ComputedLicenseInfo {
  state: 'active' | 'expired' | 'inactive';
  label: string;
  daysRemaining: number | null;
  isExpiringSoon: boolean;
  formattedExpiresAt: string | null;
}

export function computeLicenseInfo(license?: SchoolLicenseRecord | null): ComputedLicenseInfo {
  if (!license || !license.is_enabled) {
    return {
      state: 'inactive',
      label: 'Неактивен (Неплатен)',
      daysRemaining: null,
      isExpiringSoon: false,
      formattedExpiresAt: license?.expires_at
        ? new Date(license.expires_at).toLocaleDateString('bg-BG')
        : null,
    };
  }

  if (!license.expires_at) {
    return {
      state: 'active',
      label: 'Активен (Платен)',
      daysRemaining: 365,
      isExpiringSoon: false,
      formattedExpiresAt: 'Безсрочен',
    };
  }

  const nowMs = Date.now();
  const expMs = new Date(license.expires_at).getTime();
  const diffDays = Math.ceil((expMs - nowMs) / (1000 * 60 * 60 * 24));
  const formatted = new Date(license.expires_at).toLocaleDateString('bg-BG');

  if (expMs < nowMs) {
    return {
      state: 'expired',
      label: 'Изтекъл',
      daysRemaining: diffDays,
      isExpiringSoon: false,
      formattedExpiresAt: formatted,
    };
  }

  return {
    state: 'active',
    label: 'Активен (Платен)',
    daysRemaining: diffDays,
    isExpiringSoon: diffDays <= 14,
    formattedExpiresAt: formatted,
  };
}

export function computeAllLicenseAlerts(bundles: SchoolBundle[]): LicenseAlert[] {
  const alerts: LicenseAlert[] = [];

  for (const b of bundles) {
    for (const modKey of ALL_MODULE_KEYS) {
      const lic = b.licenses[modKey];
      if (!lic || !lic.is_enabled || !lic.expires_at) continue;

      const info = computeLicenseInfo(lic);
      if (info.state === 'expired') {
        alerts.push({
          id: `${b.school.id}-${modKey}-expired`,
          type: 'expired',
          schoolId: b.school.id,
          schoolName: b.school.name,
          schoolSlug: b.school.slug,
          moduleKey: modKey,
          moduleName: MODULE_META[modKey].name,
          expiresAt: lic.expires_at,
          daysRemaining: info.daysRemaining ?? 0,
        });
      } else if (info.state === 'active' && info.isExpiringSoon && info.daysRemaining !== null) {
        alerts.push({
          id: `${b.school.id}-${modKey}-expiring`,
          type: 'expiring_soon',
          schoolId: b.school.id,
          schoolName: b.school.name,
          schoolSlug: b.school.slug,
          moduleKey: modKey,
          moduleName: MODULE_META[modKey].name,
          expiresAt: lic.expires_at,
          daysRemaining: info.daysRemaining,
        });
      }
    }
  }

  // Sort: expired first, then by lowest daysRemaining
  return alerts.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'expired' ? -1 : 1;
    return a.daysRemaining - b.daysRemaining;
  });
}

// =============================================================================
// RESILIENT STORAGE ENGINE (SUPABASE + LOCAL FALLBACK IF TABLES NOT CREATED YET)
// =============================================================================

const LOCAL_SAAS_KEY = 'tl_saas_multi_tenant_v1';

interface LocalSaasStore {
  schools: SchoolRecord[];
  licenses: SchoolLicenseRecord[];
  users: SchoolUserRecord[];
}

function getInitialDemoStore(): LocalSaasStore {
  const now = new Date();
  const inOneYear = new Date(now);
  inOneYear.setFullYear(inOneYear.getFullYear() + 1);

  const inTenDays = new Date(now);
  inTenDays.setDate(inTenDays.getDate() + 10);

  const schoolId = '11111111-2222-3333-4444-555555555555';

  return {
    schools: [
      {
        id: schoolId,
        name: 'СУ „Константин Петканов“',
        slug: 'su-konstantin-petkanov',
        logo_url: null,
        city: 'Бургас',
        contact_person: 'Красимир Ватев',
        contact_phone: '+359 88 888 8888',
        contact_email: 'info@petkanov-school.bg',
        is_active: true,
        notes: 'Основна училищна инстанция — гр. Бургас',
        created_at: now.toISOString(),
      },
    ],
    licenses: [
      {
        id: 'lic-duty-1',
        school_id: schoolId,
        module_key: 'duty',
        is_enabled: true,
        plan_type: '1_year',
        paid_at: now.toISOString(),
        expires_at: inOneYear.toISOString(),
        price_paid: 240,
        updated_at: now.toISOString(),
      },
      {
        id: 'lic-tickets-1',
        school_id: schoolId,
        module_key: 'tickets',
        is_enabled: true,
        plan_type: '6_months',
        paid_at: now.toISOString(),
        expires_at: inTenDays.toISOString(),
        price_paid: 120,
        updated_at: now.toISOString(),
      },
      {
        id: 'lic-inventory-1',
        school_id: schoolId,
        module_key: 'inventory',
        is_enabled: false,
        plan_type: null,
        paid_at: null,
        expires_at: null,
        price_paid: null,
        updated_at: now.toISOString(),
      },
    ],
    users: [
      {
        id: 'usr-admin-1',
        school_id: schoolId,
        auth_user_id: null,
        email: 'director@petkanov.bg',
        password_hash: 'school123',
        pin_code: '1234',
        full_name: 'д-р Валентина Каменова (Директор)',
        role: 'director',
        allowed_modules: ['duty', 'tickets', 'inventory'],
        is_active: true,
        created_at: now.toISOString(),
      },
      {
        id: 'usr-deputy-1',
        school_id: schoolId,
        auth_user_id: null,
        email: 'deputy@petkanov.bg',
        password_hash: 'school123',
        pin_code: '2345',
        full_name: 'Мария Тодорова (Зам.-директор УД)',
        role: 'deputy_director',
        allowed_modules: ['duty', 'tickets', 'inventory'],
        is_active: true,
        created_at: now.toISOString(),
      },
      {
        id: 'usr-admin-office-1',
        school_id: schoolId,
        auth_user_id: null,
        email: 'office@petkanov.bg',
        password_hash: 'school123',
        pin_code: '3456',
        full_name: 'Силвия Николова (ЗАС / Администрация)',
        role: 'administration',
        allowed_modules: ['duty', 'tickets', 'inventory'],
        is_active: true,
        created_at: now.toISOString(),
      },
      {
        id: 'usr-teacher-1',
        school_id: schoolId,
        auth_user_id: null,
        email: 'teacher@petkanov.bg',
        password_hash: 'school123',
        pin_code: '4567',
        full_name: 'Георги Димитров (Старши учител)',
        role: 'teacher',
        allowed_modules: ['duty', 'tickets', 'inventory'],
        is_active: true,
        created_at: now.toISOString(),
      },
    ],
  };
}

function readLocalStore(): LocalSaasStore {
  if (typeof window === 'undefined') return getInitialDemoStore();
  try {
    const raw = localStorage.getItem(LOCAL_SAAS_KEY);
    if (!raw) {
      const seed = getInitialDemoStore();
      localStorage.setItem(LOCAL_SAAS_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<LocalSaasStore>;
    return {
      schools: Array.isArray(parsed.schools) ? parsed.schools : [],
      licenses: Array.isArray(parsed.licenses) ? parsed.licenses : [],
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return getInitialDemoStore();
  }
}

function writeLocalStore(store: LocalSaasStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SAAS_KEY, JSON.stringify(store));
  } catch {
    // ignore quota error
  }
}

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return (
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
  );
}

function createDefaultLicenseRecord(schoolId: string, moduleKey: SchoolModuleKey): SchoolLicenseRecord {
  return {
    id: makeUuid(),
    school_id: schoolId,
    module_key: moduleKey,
    is_enabled: false,
    plan_type: null,
    paid_at: null,
    expires_at: null,
    price_paid: null,
    updated_at: new Date().toISOString(),
  };
}

function assembleBundles(
  schools: SchoolRecord[],
  licenses: SchoolLicenseRecord[],
  users: SchoolUserRecord[]
): SchoolBundle[] {
  return schools.map((school) => {
    const schoolLics = licenses.filter((l) => l.school_id === school.id);
    const licMap = {} as Record<SchoolModuleKey, SchoolLicenseRecord>;
    for (const k of ALL_MODULE_KEYS) {
      const existing = schoolLics.find((l) => l.module_key === k);
      licMap[k] = existing ?? createDefaultLicenseRecord(school.id, k);
    }
    const schoolUsers = users.filter((u) => u.school_id === school.id);
    return {
      school,
      licenses: licMap,
      users: schoolUsers,
    };
  });
}

export interface FetchSaasResult {
  bundles: SchoolBundle[];
  usingFallback: boolean;
  fallbackMessage: string | null;
}

export async function fetchAllSchoolBundles(): Promise<FetchSaasResult> {
  try {
    const [schoolsRes, licensesRes, usersRes] = await Promise.all([
      supabase.from('schools').select('*').order('created_at', { ascending: false }),
      supabase.from('school_licenses').select('*'),
      supabase.from('school_users').select('*').order('created_at', { ascending: false }),
    ]);

    if (schoolsRes.error || licensesRes.error || usersRes.error) {
      const errMsg =
        schoolsRes.error?.message ||
        licensesRes.error?.message ||
        usersRes.error?.message ||
        'Таблиците в Supabase все още не са създадени.';
      const local = readLocalStore();
      return {
        bundles: assembleBundles(local.schools, local.licenses, local.users),
        usingFallback: true,
        fallbackMessage: `Връзката със Supabase е активна, но таблиците още не са инициализирани (${errMsg}). Изпълнете файла supabase/schema_multi_tenant.sql в Supabase SQL Editor. Дотогава промените се пазят надеждно локално.`,
      };
    }

    const schools = (schoolsRes.data || []) as SchoolRecord[];
    const licenses = (licensesRes.data || []) as SchoolLicenseRecord[];
    const users = (usersRes.data || []) as SchoolUserRecord[];

    return {
      bundles: assembleBundles(schools, licenses, users),
      usingFallback: false,
      fallbackMessage: null,
    };
  } catch (err) {
    const local = readLocalStore();
    return {
      bundles: assembleBundles(local.schools, local.licenses, local.users),
      usingFallback: true,
      fallbackMessage:
        err instanceof Error
          ? `Използва се локален режим (${err.message}).`
          : 'Използва се локален режим.',
    };
  }
}

export async function fetchSchoolBundleBySlug(slug: string): Promise<{
  bundle: SchoolBundle | null;
  usingFallback: boolean;
}> {
  const normalizedSlug = slug.trim().toLowerCase();
  const all = await fetchAllSchoolBundles();
  const found =
    all.bundles.find((b) => b.school.slug.toLowerCase() === normalizedSlug) || null;
  return {
    bundle: found,
    usingFallback: all.usingFallback,
  };
}

export interface CreateSchoolInput {
  name: string;
  slug: string;
  city?: string;
  logo_url?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
}

export async function createSchoolInstance(input: CreateSchoolInput): Promise<{
  school: SchoolRecord;
  usingFallback: boolean;
}> {
  const cleanSlug = (input.slug.trim() || slugifySchoolName(input.name)).toLowerCase();
  const now = new Date().toISOString();

  // Try Supabase first
  const { data: insertedSchool, error: schoolErr } = await supabase
    .from('schools')
    .insert({
      name: input.name.trim(),
      slug: cleanSlug,
      city: input.city?.trim() || null,
      logo_url: input.logo_url?.trim() || null,
      contact_person: input.contact_person?.trim() || null,
      contact_phone: input.contact_phone?.trim() || null,
      contact_email: input.contact_email?.trim() || null,
      notes: input.notes?.trim() || null,
      is_active: true,
    })
    .select('*')
    .single();

  if (!schoolErr && insertedSchool) {
    const school = insertedSchool as SchoolRecord;
    // Automatically create 3 license records (duty, tickets, inventory) with is_enabled = false
    const licenseRows = ALL_MODULE_KEYS.map((module_key) => ({
      school_id: school.id,
      module_key,
      is_enabled: false,
      plan_type: null,
      paid_at: null,
      expires_at: null,
      price_paid: null,
    }));
    await supabase.from('school_licenses').insert(licenseRows);
    return { school, usingFallback: false };
  }

  // Fallback to local store
  const store = readLocalStore();
  if (store.schools.some((s) => s.slug.toLowerCase() === cleanSlug)) {
    throw new Error('Училище с този URL slug вече съществува.');
  }

  const newSchool: SchoolRecord = {
    id: makeUuid(),
    name: input.name.trim(),
    slug: cleanSlug,
    city: input.city?.trim() || null,
    logo_url: input.logo_url?.trim() || null,
    contact_person: input.contact_person?.trim() || null,
    contact_phone: input.contact_phone?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    notes: input.notes?.trim() || null,
    is_active: true,
    created_at: now,
  };

  const newLicenses = ALL_MODULE_KEYS.map((mod) =>
    createDefaultLicenseRecord(newSchool.id, mod)
  );

  store.schools.unshift(newSchool);
  store.licenses.push(...newLicenses);
  writeLocalStore(store);

  return { school: newSchool, usingFallback: true };
}

export async function updateSchoolInstance(
  schoolId: string,
  patch: Partial<Omit<SchoolRecord, 'id' | 'created_at'>>
): Promise<void> {
  try {
    await supabase.from('schools').update(patch).eq('id', schoolId);
  } catch {
    // ignore
  }

  const store = readLocalStore();
  store.schools = store.schools.map((s) =>
    s.id === schoolId ? { ...s, ...patch } : s
  );
  writeLocalStore(store);
}

export async function deleteSchoolInstance(schoolId: string): Promise<void> {
  try {
    await supabase.from('schools').delete().eq('id', schoolId);
  } catch {
    // ignore
  }

  const store = readLocalStore();
  store.schools = store.schools.filter((s) => s.id !== schoolId);
  store.licenses = store.licenses.filter((l) => l.school_id !== schoolId);
  store.users = store.users.filter((u) => u.school_id !== schoolId);
  writeLocalStore(store);
}

export type LicensePeriodAction =
  | { type: '6_months'; pricePaid?: number | null }
  | { type: '1_year'; pricePaid?: number | null }
  | { type: '2_years'; pricePaid?: number | null }
  | { type: 'custom'; expiresAtIso: string; pricePaid?: number | null }
  | { type: 'stop' };

export async function updateSchoolLicensePeriod(
  schoolId: string,
  moduleKey: SchoolModuleKey,
  action: LicensePeriodAction
): Promise<void> {
  const now = new Date();
  let is_enabled = true;
  let plan_type: LicensePlanType | null = null;
  let paid_at: string | null = now.toISOString();
  let expires_at: string | null = null;
  let price_paid: number | null =
    'pricePaid' in action && action.pricePaid !== undefined ? action.pricePaid : null;

  if (action.type === 'stop') {
    is_enabled = false;
  } else if (action.type === '6_months') {
    plan_type = '6_months';
    const d = new Date(now);
    d.setMonth(d.getMonth() + 6);
    expires_at = d.toISOString();
  } else if (action.type === '1_year') {
    plan_type = '1_year';
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    expires_at = d.toISOString();
  } else if (action.type === '2_years') {
    plan_type = '2_years';
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 2);
    expires_at = d.toISOString();
  } else if (action.type === 'custom') {
    plan_type = 'custom';
    expires_at = new Date(action.expiresAtIso).toISOString();
  }

  const payload = {
    school_id: schoolId,
    module_key: moduleKey,
    is_enabled,
    ...(action.type !== 'stop'
      ? {
          plan_type,
          paid_at,
          expires_at,
          ...(price_paid !== null ? { price_paid } : {}),
        }
      : {}),
    updated_at: now.toISOString(),
  };

  try {
    await supabase
      .from('school_licenses')
      .upsert(payload, { onConflict: 'school_id,module_key' });
  } catch {
    // ignore
  }

  // Always keep local store mirror in sync
  const store = readLocalStore();
  const idx = store.licenses.findIndex(
    (l) => l.school_id === schoolId && l.module_key === moduleKey
  );
  if (idx >= 0) {
    const existing = store.licenses[idx];
    store.licenses[idx] = {
      ...existing,
      is_enabled,
      plan_type: action.type === 'stop' ? existing.plan_type : plan_type,
      paid_at: action.type === 'stop' ? existing.paid_at : paid_at,
      expires_at: action.type === 'stop' ? existing.expires_at : expires_at,
      price_paid:
        action.type === 'stop'
          ? existing.price_paid
          : price_paid ?? existing.price_paid,
      updated_at: now.toISOString(),
    };
  } else {
    store.licenses.push({
      id: makeUuid(),
      school_id: schoolId,
      module_key: moduleKey,
      is_enabled,
      plan_type,
      paid_at,
      expires_at,
      price_paid,
      updated_at: now.toISOString(),
    });
  }
  writeLocalStore(store);
}

export interface CreateSchoolUserInput {
  school_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  pin_code?: string;
  role: SchoolUserRole;
  allowed_modules: SchoolModuleKey[];
}

export async function createSchoolUser(input: CreateSchoolUserInput): Promise<SchoolUserRecord> {
  const now = new Date().toISOString();
  const row = {
    school_id: input.school_id,
    full_name: input.full_name.trim(),
    email: input.email.trim().toLowerCase(),
    password_hash: input.password_hash,
    pin_code: input.pin_code?.trim() || null,
    role: input.role,
    allowed_modules: input.allowed_modules,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('school_users')
    .insert(row)
    .select('*')
    .single();

  if (!error && data) {
    return data as SchoolUserRecord;
  }

  const store = readLocalStore();
  if (
    store.users.some(
      (u) => u.school_id === input.school_id && u.email.toLowerCase() === row.email
    )
  ) {
    throw new Error('Потребител с този имейл/потребителско име вече съществува в това училище.');
  }

  const created: SchoolUserRecord = {
    id: makeUuid(),
    auth_user_id: null,
    ...row,
    created_at: now,
  };
  store.users.unshift(created);
  writeLocalStore(store);
  return created;
}

export async function updateSchoolUser(
  userId: string,
  patch: Partial<Pick<SchoolUserRecord, 'email' | 'password_hash' | 'pin_code' | 'is_active' | 'role' | 'allowed_modules' | 'full_name'>>
): Promise<void> {
  try {
    await supabase.from('school_users').update(patch).eq('id', userId);
  } catch {
    // ignore
  }

  const store = readLocalStore();
  store.users = store.users.map((u) => (u.id === userId ? { ...u, ...patch } : u));
  writeLocalStore(store);
}

export async function deleteSchoolUser(userId: string): Promise<void> {
  try {
    await supabase.from('school_users').delete().eq('id', userId);
  } catch {
    // ignore
  }

  const store = readLocalStore();
  store.users = store.users.filter((u) => u.id !== userId);
  writeLocalStore(store);
}

// =============================================================================
// SCHOOL PORTAL AUTHENTICATION & SESSION HELPERS
// =============================================================================

const SCHOOL_SESSION_PREFIX = 'tl_school_portal_session_';
const MAIN_ADMIN_AUTH_KEY = 'tl_admin_auth';

export function isMainAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(MAIN_ADMIN_AUTH_KEY) === 'true';
}

export function getSchoolPortalSession(schoolSlug: string): SchoolPortalSession | null {
  if (typeof window === 'undefined') return null;
  const key = `${SCHOOL_SESSION_PREFIX}${schoolSlug.toLowerCase()}`;
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SchoolPortalSession;
  } catch {
    return null;
  }
}

export function saveSchoolPortalSession(session: SchoolPortalSession): void {
  if (typeof window === 'undefined') return;
  const key = `${SCHOOL_SESSION_PREFIX}${session.schoolSlug.toLowerCase()}`;
  sessionStorage.setItem(key, JSON.stringify(session));
}

export function clearSchoolPortalSession(schoolSlug: string): void {
  if (typeof window === 'undefined') return;
  const key = `${SCHOOL_SESSION_PREFIX}${schoolSlug.toLowerCase()}`;
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

export async function authenticateSchoolPortalUser(
  schoolSlug: string,
  identifier: string,
  secret: string,
  mode: 'credentials' | 'pin' = 'credentials'
): Promise<{ session?: SchoolPortalSession; error?: string }> {
  const { bundle } = await fetchSchoolBundleBySlug(schoolSlug);
  if (!bundle) {
    return { error: 'Училищната инстанция не беше намерена.' };
  }
  if (!bundle.school.is_active) {
    return { error: 'Инстанцията на това училище е временно спряна от администратора.' };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanSecret = secret.trim();

  let matchedUser: SchoolUserRecord | undefined;

  if (mode === 'pin') {
    matchedUser = bundle.users.find(
      (u) => u.is_active && u.pin_code && u.pin_code.trim() === cleanSecret
    );
    if (!matchedUser) {
      return { error: 'Невалиден ПИН код или неактивен потребител.' };
    }
  } else {
    matchedUser = bundle.users.find(
      (u) =>
        u.is_active &&
        u.email.trim().toLowerCase() === cleanId &&
        u.password_hash === cleanSecret
    );
    if (!matchedUser) {
      return { error: 'Невалиден имейл/потребителско име или парола.' };
    }
  }

  const session: SchoolPortalSession = {
    schoolId: bundle.school.id,
    schoolSlug: bundle.school.slug,
    userId: matchedUser.id,
    fullName: matchedUser.full_name,
    email: matchedUser.email,
    role: matchedUser.role,
    allowedModules: matchedUser.allowed_modules || ALL_MODULE_KEYS,
    isSuperAdminPreview: false,
    loggedInAt: new Date().toISOString(),
  };

  saveSchoolPortalSession(session);
  return { session };
}


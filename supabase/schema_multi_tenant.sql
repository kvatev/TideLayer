-- =============================================================================
-- TideLayer Multi-Tenant SaaS Schema for School Solutions
-- Execute this file in Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CORE MULTI-TENANT TABLES (SCHOOLS, LICENSES, USERS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  city TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL CHECK (module_key IN ('duty', 'tickets', 'inventory')),
  is_enabled BOOLEAN DEFAULT false,
  plan_type TEXT CHECK (plan_type IN ('6_months', '1_year', '2_years', 'custom')),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  price_paid NUMERIC(10,2),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, module_key)
);

CREATE TABLE IF NOT EXISTS public.school_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  auth_user_id UUID NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  pin_code TEXT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('director', 'school_admin', 'deputy_director', 'administration', 'teacher', 'staff', 'technician')),
  allowed_modules TEXT[] DEFAULT ARRAY['duty', 'tickets', 'inventory'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, email)
);

-- =============================================================================
-- 2. MODULE 1: ГРАФИК НА ДЕЖУРСТВАТА (DUTY SCHEDULER)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.duty_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  stage TEXT DEFAULT 'upper' CHECK (stage IN ('primary', 'upper', 'both')),
  max_duties_per_week INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.duty_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  floor_or_zone TEXT,
  stage TEXT DEFAULT 'upper' CHECK (stage IN ('primary', 'upper', 'both')),
  required_teachers INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.duty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL DEFAULT '2026/2027 - I срок',
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  location_id UUID REFERENCES public.duty_locations(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.duty_teachers(id) ON DELETE CASCADE,
  shift_number INTEGER DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.duty_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.duty_teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 5),
  unavailable_date DATE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.duty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL UNIQUE REFERENCES public.schools(id) ON DELETE CASCADE,
  current_school_year TEXT DEFAULT '2026/2027',
  current_term TEXT DEFAULT 'I срок',
  tip_text TEXT,
  footer_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.duty_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'info' CHECK (priority IN ('info', 'warning', 'urgent')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. MODULE 2: СИСТЕМА ЗА ЗАДАЧИ И ДОКУМЕНТИ (TASK & DOCUMENT MANAGEMENT)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.ticket_departments(id) ON DELETE SET NULL,
  created_by_user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
  assigned_to_user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
  assigned_role_target TEXT NULL, -- напр. 'all_teachers', 'all_administration', 'all_staff'
  assigned_user_ids UUID[] NULL, -- множество изпълнители
  due_date TIMESTAMPTZ NULL, -- краен срок за изпълнение
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  room_or_location TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Прикачени учебни документи (PDF, Word, Excel, PowerPoint) с 1-годишна валидност (365 дни)
CREATE TABLE IF NOT EXISTS public.task_document_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.ticket_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'word', 'excel', 'powerpoint', 'other')),
  mime_type TEXT,
  file_url TEXT NOT NULL,
  uploaded_by_user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
  uploaded_by_name TEXT NOT NULL,
  uploaded_by_role TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_docs_school_uploaded ON public.task_document_attachments(school_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_docs_task_id ON public.task_document_attachments(task_id);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
  sender_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  estimated_price NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'delivered', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  actor_name TEXT,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 4. MODULE 3: УЧИЛИЩЕН ИНВЕНТАР (SCHOOL INVENTORY)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  room_number TEXT,
  name TEXT NOT NULL,
  room_type TEXT DEFAULT 'classroom',
  building TEXT,
  floor TEXT,
  building_or_floor TEXT,
  responsible_person TEXT,
  responsible_user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
  description TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.inventory_rooms(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  inventory_code TEXT NOT NULL,
  tracking_type TEXT DEFAULT 'individual' CHECK (tracking_type IN ('individual', 'batch')),
  manufacturer TEXT,
  model TEXT,
  brand_or_model TEXT,
  serial_number TEXT,
  quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'good', 'needs_repair', 'written_off', 'missing')),
  assigned_to TEXT,
  assigned_user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
  purchase_date DATE,
  warranty_until DATE,
  purchase_price NUMERIC(10,2),
  notes TEXT,
  description TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_archived BOOLEAN DEFAULT false,
  is_written_off BOOLEAN DEFAULT false,
  written_off_date DATE,
  written_off_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, inventory_code)
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  from_room_id UUID REFERENCES public.inventory_rooms(id) ON DELETE SET NULL,
  from_room_name TEXT,
  to_room_id UUID REFERENCES public.inventory_rooms(id) ON DELETE SET NULL,
  to_room_name TEXT NOT NULL,
  from_mol TEXT,
  to_mol TEXT,
  moved_by_name TEXT,
  moved_by_user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
  movement_date TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_number TEXT,
  scope TEXT DEFAULT 'all' CHECK (scope IN ('all', 'rooms', 'categories')),
  target_room_ids UUID[] DEFAULT ARRAY[]::UUID[],
  target_category_ids UUID[] DEFAULT ARRAY[]::UUID[],
  committee_members TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  summary_notes TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES public.inventory_audits(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'unverified' CHECK (status IN ('present', 'missing', 'damaged', 'discrepancy', 'unverified')),
  expected_room_id UUID REFERENCES public.inventory_rooms(id) ON DELETE SET NULL,
  found_room_id UUID REFERENCES public.inventory_rooms(id) ON DELETE SET NULL,
  notes TEXT,
  checked_by_name TEXT,
  checked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  actor_name TEXT,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Safe migrations for existing databases (adds new columns if tables already exist)
ALTER TABLE public.inventory_rooms ADD COLUMN IF NOT EXISTS room_number TEXT;
ALTER TABLE public.inventory_rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'classroom';
ALTER TABLE public.inventory_rooms ADD COLUMN IF NOT EXISTS building TEXT;
ALTER TABLE public.inventory_rooms ADD COLUMN IF NOT EXISTS floor TEXT;
ALTER TABLE public.inventory_rooms ADD COLUMN IF NOT EXISTS building_or_floor TEXT;
ALTER TABLE public.inventory_rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.inventory_rooms ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS tracking_type TEXT DEFAULT 'individual';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS brand_or_model TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS documents TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS is_written_off BOOLEAN DEFAULT false;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS written_off_date DATE;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS written_off_reason TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- =============================================================================
-- 5. INDEXES BY school_id & slug
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_school_licenses_school_id ON public.school_licenses(school_id);
CREATE INDEX IF NOT EXISTS idx_school_users_school_id ON public.school_users(school_id);

CREATE INDEX IF NOT EXISTS idx_duty_teachers_school_id ON public.duty_teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_duty_locations_school_id ON public.duty_locations(school_id);
CREATE INDEX IF NOT EXISTS idx_duty_assignments_school_id ON public.duty_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_duty_unavailability_school_id ON public.duty_unavailability(school_id);
CREATE INDEX IF NOT EXISTS idx_duty_settings_school_id ON public.duty_settings(school_id);
CREATE INDEX IF NOT EXISTS idx_duty_broadcasts_school_id ON public.duty_broadcasts(school_id);

CREATE INDEX IF NOT EXISTS idx_ticket_departments_school_id ON public.ticket_departments(school_id);
CREATE INDEX IF NOT EXISTS idx_tickets_school_id ON public.tickets(school_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_school_id ON public.ticket_messages(school_id);
CREATE INDEX IF NOT EXISTS idx_ticket_channels_school_id ON public.ticket_channels(school_id);
CREATE INDEX IF NOT EXISTS idx_ticket_announcements_school_id ON public.ticket_announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_ticket_audit_logs_school_id ON public.ticket_audit_logs(school_id);

CREATE INDEX IF NOT EXISTS idx_inventory_rooms_school_id ON public.inventory_rooms(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_school_id ON public.inventory_categories(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_school_id ON public.inventory_items(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON public.inventory_items(school_id, inventory_code);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_school_id ON public.inventory_movements(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audits_school_id ON public.inventory_audits(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_items_audit_id ON public.inventory_audit_items(audit_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_school_id ON public.inventory_logs(school_id);

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'schools',
    'school_licenses',
    'school_users',
    'duty_teachers',
    'duty_locations',
    'duty_assignments',
    'duty_unavailability',
    'duty_settings',
    'duty_broadcasts',
    'ticket_departments',
    'tickets',
    'ticket_messages',
    'ticket_channels',
    'ticket_announcements',
    'ticket_audit_logs',
    'inventory_rooms',
    'inventory_categories',
    'inventory_items',
    'inventory_movements',
    'inventory_audits',
    'inventory_audit_items',
    'inventory_logs'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow full access for app %I" ON public.%I;', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "Allow full access for app %I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);',
      tbl, tbl
    );
  END LOOP;
END $$;


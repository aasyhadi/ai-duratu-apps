-- ============================================================
-- SCHEMA INSPECTION
-- Purchase Order Dependencies
-- Duratu Kafe ERP
--
-- Jalankan melalui:
-- Supabase Dashboard -> SQL Editor
--
-- Hasilnya digunakan untuk menyusun:
-- 006_create_purchase_order.sql
-- ============================================================

-- ============================================================
-- 1. DAFTAR KOLOM TABEL TERKAIT
-- ============================================================

select
  c.table_schema,
  c.table_name,
  c.ordinal_position,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale
from information_schema.columns as c
where
  c.table_schema = 'public'
  and c.table_name in (
    'purchase_requests',
    'purchase_request_items',
    'suppliers',
    'products',
    'inventory_movements'
  )
order by
  c.table_name,
  c.ordinal_position;


-- ============================================================
-- 2. PRIMARY KEY, UNIQUE, FOREIGN KEY, DAN CHECK CONSTRAINT
-- ============================================================

select
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints as tc
left join information_schema.key_column_usage as kcu
  on
    tc.constraint_name = kcu.constraint_name
    and tc.table_schema = kcu.table_schema
    and tc.table_name = kcu.table_name
left join information_schema.constraint_column_usage as ccu
  on
    tc.constraint_name = ccu.constraint_name
    and tc.table_schema = ccu.table_schema
where
  tc.table_schema = 'public'
  and tc.table_name in (
    'purchase_requests',
    'purchase_request_items',
    'suppliers',
    'products',
    'inventory_movements'
  )
order by
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  kcu.ordinal_position;


-- ============================================================
-- 3. DETAIL CHECK CONSTRAINT
-- ============================================================

select
  ns.nspname as table_schema,
  cls.relname as table_name,
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
from pg_constraint as con
join pg_class as cls
  on cls.oid = con.conrelid
join pg_namespace as ns
  on ns.oid = cls.relnamespace
where
  ns.nspname = 'public'
  and cls.relname in (
    'purchase_requests',
    'purchase_request_items',
    'suppliers',
    'products',
    'inventory_movements'
  )
order by
  cls.relname,
  con.conname;


-- ============================================================
-- 4. ENUM YANG DIGUNAKAN DATABASE
-- ============================================================

select
  ns.nspname as enum_schema,
  typ.typname as enum_name,
  enum.enumlabel as enum_value,
  enum.enumsortorder
from pg_type as typ
join pg_enum as enum
  on typ.oid = enum.enumtypid
join pg_namespace as ns
  on ns.oid = typ.typnamespace
where ns.nspname = 'public'
order by
  typ.typname,
  enum.enumsortorder;


-- ============================================================
-- 5. INDEX PADA TABEL TERKAIT
-- ============================================================

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where
  schemaname = 'public'
  and tablename in (
    'purchase_requests',
    'purchase_request_items',
    'suppliers',
    'products',
    'inventory_movements'
  )
order by
  tablename,
  indexname;


-- ============================================================
-- 6. TRIGGER PADA TABEL TERKAIT
-- ============================================================

select
  event_object_schema,
  event_object_table,
  trigger_name,
  event_manipulation,
  action_timing,
  action_orientation,
  action_statement
from information_schema.triggers
where
  event_object_schema = 'public'
  and event_object_table in (
    'purchase_requests',
    'purchase_request_items',
    'suppliers',
    'products',
    'inventory_movements'
  )
order by
  event_object_table,
  trigger_name,
  event_manipulation;


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

select
  ns.nspname as table_schema,
  cls.relname as table_name,
  cls.relrowsecurity as rls_enabled,
  cls.relforcerowsecurity as rls_forced
from pg_class as cls
join pg_namespace as ns
  on ns.oid = cls.relnamespace
where
  ns.nspname = 'public'
  and cls.relname in (
    'purchase_requests',
    'purchase_request_items',
    'suppliers',
    'products',
    'inventory_movements'
  )
order by cls.relname;


-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where
  schemaname = 'public'
  and tablename in (
    'purchase_requests',
    'purchase_request_items',
    'suppliers',
    'products',
    'inventory_movements'
  )
order by
  tablename,
  policyname;


-- ============================================================
-- 9. FUNGSI YANG BERKAITAN DENGAN PURCHASE DAN INVENTORY
-- ============================================================

select
  ns.nspname as function_schema,
  proc.proname as function_name,
  pg_get_function_identity_arguments(proc.oid)
    as function_arguments,
  pg_get_function_result(proc.oid)
    as function_result,
  lang.lanname as function_language,
  proc.prosecdef as security_definer
from pg_proc as proc
join pg_namespace as ns
  on ns.oid = proc.pronamespace
join pg_language as lang
  on lang.oid = proc.prolang
where
  ns.nspname = 'public'
  and (
    proc.proname ilike '%purchase%'
    or proc.proname ilike '%inventory%'
    or proc.proname ilike '%stock%'
  )
order by proc.proname;


-- ============================================================
-- 10. DEFINISI FUNGSI TERKAIT
-- ============================================================

select
  ns.nspname as function_schema,
  proc.proname as function_name,
  pg_get_function_identity_arguments(proc.oid)
    as function_arguments,
  pg_get_functiondef(proc.oid)
    as function_definition
from pg_proc as proc
join pg_namespace as ns
  on ns.oid = proc.pronamespace
where
  ns.nspname = 'public'
  and (
    proc.proname ilike '%purchase%'
    or proc.proname ilike '%inventory%'
    or proc.proname ilike '%stock%'
  )
order by proc.proname;
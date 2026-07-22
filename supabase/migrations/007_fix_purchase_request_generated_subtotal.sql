-- ============================================================
-- FIX GENERATED SUBTOTAL COMPATIBILITY
-- Duratu Kafe ERP
--
-- purchase_request_items.subtotal adalah generated column.
-- Kolom tersebut tidak boleh di-INSERT atau di-UPDATE langsung.
--
-- Migration ini memperbaiki:
-- 1. submit_purchase_request
-- 2. approve_purchase_request
--
-- Nilai total dihitung langsung dari:
-- quantity * unit_cost
-- ============================================================


-- ============================================================
-- 1. FIX SUBMIT PURCHASE REQUEST
-- ============================================================

create or replace function public.submit_purchase_request(
  p_request_id bigint
)
returns table (
  request_id bigint,
  request_number text,
  previous_status text,
  current_status text,
  estimated_total numeric
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_request_number text;
  v_current_status text;
  v_estimated_total numeric := 0;
  v_item_count integer := 0;
  v_invalid_item_count integer := 0;
begin
  -- Validasi ID
  if p_request_id is null or p_request_id < 1 then
    raise exception
      using message =
        'ID draft pembelian tidak valid.';
  end if;

  -- Ambil dan kunci Purchase Request
  select
    pr.request_number,
    pr.status
  into
    v_request_number,
    v_current_status
  from public.purchase_requests as pr
  where pr.id = p_request_id
  for update;

  if not found then
    raise exception
      using message =
        'Draft pembelian tidak ditemukan.';
  end if;

  -- Hanya draft yang dapat diajukan
  if v_current_status <> 'draft' then
    raise exception
      using message =
        format(
          'Draft pembelian tidak dapat diajukan karena status saat ini adalah %s.',
          v_current_status
        );
  end if;

  -- Pastikan supplier sudah dipilih
  if not exists (
    select 1
    from public.purchase_requests as pr
    join public.suppliers as s
      on s.id = pr.supplier_id
    where
      pr.id = p_request_id
      and s.is_active is true
  ) then
    raise exception
      using message =
        'Supplier wajib dipilih dan harus berstatus aktif sebelum permintaan diajukan.';
  end if;

  -- Pastikan terdapat item
  select count(*)
  into v_item_count
  from public.purchase_request_items as pri
  where pri.purchase_request_id = p_request_id;

  if v_item_count < 1 then
    raise exception
      using message =
        'Draft pembelian harus memiliki minimal satu item sebelum diajukan.';
  end if;

  -- Validasi item dan produk
  select count(*)
  into v_invalid_item_count
  from public.purchase_request_items as pri
  left join public.products as p
    on p.id = pri.product_id
  where
    pri.purchase_request_id = p_request_id
    and (
      p.id is null
      or p.is_active is not true
      or p.track_stock is not true
      or pri.quantity is null
      or pri.quantity <= 0
      or pri.unit_cost is null
      or pri.unit_cost < 0
    );

  if v_invalid_item_count > 0 then
    raise exception
      using message =
        'Terdapat item atau produk yang tidak valid pada draft pembelian.';
  end if;

  -- Hitung ulang total tanpa mengubah generated column subtotal
  select
    coalesce(
      sum(
        pri.quantity
        * pri.unit_cost
      ),
      0
    )
  into v_estimated_total
  from public.purchase_request_items as pri
  where pri.purchase_request_id = p_request_id;

  -- Ubah status menjadi submitted
  update public.purchase_requests
  set
    status = 'submitted',
    estimated_total = v_estimated_total,
    updated_at = now()
  where id = p_request_id;

  return query
  select
    p_request_id,
    v_request_number,
    v_current_status,
    'submitted'::text,
    v_estimated_total;
end;
$$;


-- ============================================================
-- 2. FIX APPROVE PURCHASE REQUEST
-- ============================================================

create or replace function public.approve_purchase_request(
  p_request_id bigint
)
returns table (
  request_id bigint,
  request_number text,
  previous_status text,
  current_status text,
  estimated_total numeric
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_request_number text;
  v_current_status text;
  v_estimated_total numeric := 0;
  v_item_count integer := 0;
  v_invalid_item_count integer := 0;
begin
  -- Validasi ID
  if p_request_id is null or p_request_id < 1 then
    raise exception
      using message =
        'ID permintaan pembelian tidak valid.';
  end if;

  -- Ambil dan kunci Purchase Request
  select
    pr.request_number,
    pr.status
  into
    v_request_number,
    v_current_status
  from public.purchase_requests as pr
  where pr.id = p_request_id
  for update;

  if not found then
    raise exception
      using message =
        'Permintaan pembelian tidak ditemukan.';
  end if;

  -- Hanya submitted yang dapat disetujui
  if v_current_status <> 'submitted' then
    raise exception
      using message =
        format(
          'Permintaan pembelian tidak dapat disetujui karena status saat ini adalah %s.',
          v_current_status
        );
  end if;

  -- Pastikan supplier masih aktif
  if not exists (
    select 1
    from public.purchase_requests as pr
    join public.suppliers as s
      on s.id = pr.supplier_id
    where
      pr.id = p_request_id
      and s.is_active is true
  ) then
    raise exception
      using message =
        'Supplier permintaan pembelian tidak ditemukan atau sudah tidak aktif.';
  end if;

  -- Pastikan terdapat item
  select count(*)
  into v_item_count
  from public.purchase_request_items as pri
  where pri.purchase_request_id = p_request_id;

  if v_item_count < 1 then
    raise exception
      using message =
        'Permintaan pembelian harus memiliki minimal satu item sebelum disetujui.';
  end if;

  -- Validasi item dan produk
  select count(*)
  into v_invalid_item_count
  from public.purchase_request_items as pri
  left join public.products as p
    on p.id = pri.product_id
  where
    pri.purchase_request_id = p_request_id
    and (
      p.id is null
      or p.is_active is not true
      or p.track_stock is not true
      or pri.quantity is null
      or pri.quantity <= 0
      or pri.unit_cost is null
      or pri.unit_cost < 0
    );

  if v_invalid_item_count > 0 then
    raise exception
      using message =
        'Terdapat item atau produk yang tidak valid pada permintaan pembelian.';
  end if;

  -- Hitung total tanpa memperbarui generated column subtotal
  select
    coalesce(
      sum(
        pri.quantity
        * pri.unit_cost
      ),
      0
    )
  into v_estimated_total
  from public.purchase_request_items as pri
  where pri.purchase_request_id = p_request_id;

  -- Ubah status menjadi approved
  update public.purchase_requests
  set
    status = 'approved',
    estimated_total = v_estimated_total,
    updated_at = now()
  where id = p_request_id;

  return query
  select
    p_request_id,
    v_request_number,
    v_current_status,
    'approved'::text,
    v_estimated_total;
end;
$$;


-- ============================================================
-- 3. HAK AKSES
-- ============================================================

revoke all
on function public.submit_purchase_request(bigint)
from public;

grant execute
on function public.submit_purchase_request(bigint)
to authenticated;


revoke all
on function public.approve_purchase_request(bigint)
from public;

grant execute
on function public.approve_purchase_request(bigint)
to authenticated;
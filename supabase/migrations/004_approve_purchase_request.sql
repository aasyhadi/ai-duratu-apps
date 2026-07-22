-- ============================================================
-- RPC: approve_purchase_request
-- Duratu Kafe ERP
--
-- Transisi status:
-- submitted -> approved
--
-- Fungsi:
-- 1. Memvalidasi ID Purchase Request.
-- 2. Mengunci record agar tidak diproses bersamaan.
-- 3. Memastikan status saat ini adalah submitted.
-- 4. Memastikan Purchase Request memiliki item.
-- 5. Memvalidasi seluruh item dan produk.
-- 6. Menghitung ulang subtotal dan estimated_total.
-- 7. Mengubah status menjadi approved secara atomik.
--
-- Catatan:
-- Approval belum mengubah stok.
-- Stok baru bertambah saat Goods Receipt dibuat.
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
  -- ----------------------------------------------------------
  -- Validasi ID
  -- ----------------------------------------------------------
  if p_request_id is null or p_request_id < 1 then
    raise exception
      using message =
        'ID permintaan pembelian tidak valid.';
  end if;

  -- ----------------------------------------------------------
  -- Ambil dan kunci Purchase Request
  -- ----------------------------------------------------------
  select
    pr.request_number,
    pr.status::text
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

  -- ----------------------------------------------------------
  -- Hanya submitted yang dapat disetujui
  -- ----------------------------------------------------------
  if v_current_status <> 'submitted' then
    raise exception
      using message =
        format(
          'Permintaan pembelian tidak dapat disetujui karena status saat ini adalah %s.',
          v_current_status
        );
  end if;

  -- ----------------------------------------------------------
  -- Pastikan terdapat item
  -- ----------------------------------------------------------
  select count(*)
  into v_item_count
  from public.purchase_request_items as pri
  where pri.purchase_request_id = p_request_id;

  if v_item_count < 1 then
    raise exception
      using message =
        'Permintaan pembelian harus memiliki minimal satu item sebelum disetujui.';
  end if;

  -- ----------------------------------------------------------
  -- Validasi seluruh item dan produk
  -- ----------------------------------------------------------
  select count(*)
  into v_invalid_item_count
  from public.purchase_request_items as pri
  left join public.products as p
    on p.id = pri.product_id
  where
    pri.purchase_request_id = p_request_id
    and (
      pri.product_id is null
      or p.id is null
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

  -- ----------------------------------------------------------
  -- Sinkronisasi subtotal setiap item
  -- ----------------------------------------------------------
  update public.purchase_request_items
  set
    subtotal =
      quantity
      * unit_cost
  where purchase_request_id = p_request_id;

  -- ----------------------------------------------------------
  -- Hitung ulang estimated_total
  -- ----------------------------------------------------------
  select
    coalesce(
      sum(pri.subtotal),
      0
    )
  into v_estimated_total
  from public.purchase_request_items as pri
  where pri.purchase_request_id = p_request_id;

  -- ----------------------------------------------------------
  -- Ubah status menjadi approved
  -- ----------------------------------------------------------
  update public.purchase_requests
  set
    status = 'approved',
    estimated_total = v_estimated_total,
    updated_at = now()
  where id = p_request_id;

  -- ----------------------------------------------------------
  -- Return hasil
  -- ----------------------------------------------------------
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
-- Hak akses
-- ============================================================

revoke all
on function public.approve_purchase_request(
  bigint
)
from public;

grant execute
on function public.approve_purchase_request(
  bigint
)
to authenticated;
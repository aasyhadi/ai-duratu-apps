-- ============================================================
-- RPC: submit_purchase_request
-- Duratu Kafe ERP
--
-- Fungsi:
-- 1. Memastikan Purchase Request tersedia.
-- 2. Mengunci record agar tidak diproses bersamaan.
-- 3. Hanya mengizinkan status draft menjadi submitted.
-- 4. Memastikan Purchase Request memiliki item.
-- 5. Memastikan seluruh item dan produk masih valid.
-- 6. Menghitung ulang estimated_total dari item.
-- 7. Mengubah status menjadi submitted secara atomik.
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
  -- ----------------------------------------------------------
  -- Validasi ID
  -- ----------------------------------------------------------
  if p_request_id is null or p_request_id < 1 then
    raise exception
      using message =
        'ID draft pembelian tidak valid.';
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
        'Draft pembelian tidak ditemukan.';
  end if;

  -- ----------------------------------------------------------
  -- Hanya draft yang dapat diajukan
  -- ----------------------------------------------------------
  if v_current_status <> 'draft' then
    raise exception
      using message =
        format(
          'Draft pembelian tidak dapat diajukan karena status saat ini adalah %s.',
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
        'Draft pembelian harus memiliki minimal satu item sebelum diajukan.';
  end if;

  -- ----------------------------------------------------------
  -- Validasi isi item dan produk
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
        'Terdapat item atau produk yang tidak valid pada draft pembelian.';
  end if;

  -- ----------------------------------------------------------
  -- Hitung ulang estimated total dari sumber item
  -- ----------------------------------------------------------
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

  -- ----------------------------------------------------------
  -- Sinkronisasi subtotal seluruh item
  -- ----------------------------------------------------------
  update public.purchase_request_items
  set
    subtotal =
      quantity
      * unit_cost
  where purchase_request_id = p_request_id;

  -- ----------------------------------------------------------
  -- Ubah status menjadi submitted
  -- ----------------------------------------------------------
  update public.purchase_requests
  set
    status = 'submitted',
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
    'submitted'::text,
    v_estimated_total;
end;
$$;

-- ============================================================
-- Hak akses
-- ============================================================

revoke all
on function public.submit_purchase_request(
  bigint
)
from public;

grant execute
on function public.submit_purchase_request(
  bigint
)
to authenticated;
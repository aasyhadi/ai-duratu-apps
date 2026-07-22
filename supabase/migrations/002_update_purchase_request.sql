-- ============================================================
-- RPC: update_purchase_request
-- Duratu Kafe ERP
--
-- Fungsi:
-- 1. Memastikan Purchase Request tersedia.
-- 2. Hanya mengizinkan perubahan ketika status masih "draft".
-- 3. Memvalidasi supplier.
-- 4. Memvalidasi seluruh produk.
-- 5. Memperbarui header Purchase Request.
-- 6. Mengganti seluruh item lama dengan item baru.
-- 7. Menghitung ulang estimated_total.
--
-- Seluruh proses dijalankan dalam satu transaksi PostgreSQL.
-- Jika salah satu langkah gagal, semua perubahan dibatalkan.
-- ============================================================

create or replace function public.update_purchase_request(
  p_request_id bigint,
  p_supplier_id bigint default null,
  p_request_date date default current_date,
  p_expected_date date default null,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns table (
  request_id bigint,
  request_number text,
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
  v_item jsonb;

  v_product_id bigint;
  v_quantity numeric;
  v_unit_cost numeric;
  v_item_notes text;

  v_product_exists boolean;
  v_supplier_exists boolean;
  v_duplicate_count integer;
begin
  -- ----------------------------------------------------------
  -- Validasi ID Purchase Request
  -- ----------------------------------------------------------
  if p_request_id is null or p_request_id < 1 then
    raise exception
      using message = 'ID draft pembelian tidak valid.';
  end if;

  -- ----------------------------------------------------------
  -- Mengunci record agar tidak diperbarui bersamaan
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
      using message = 'Draft pembelian tidak ditemukan.';
  end if;

  -- ----------------------------------------------------------
  -- Hanya draft yang dapat diperbarui
  -- ----------------------------------------------------------
  if v_current_status <> 'draft' then
    raise exception
      using message =
        'Draft pembelian tidak dapat diubah karena statusnya bukan draft.';
  end if;

  -- ----------------------------------------------------------
  -- Validasi tanggal
  -- ----------------------------------------------------------
  if p_request_date is null then
    raise exception
      using message = 'Tanggal permintaan wajib diisi.';
  end if;

  if
    p_expected_date is not null
    and p_expected_date < p_request_date
  then
    raise exception
      using message =
        'Tanggal kebutuhan tidak boleh lebih awal dari tanggal permintaan.';
  end if;

  -- ----------------------------------------------------------
  -- Validasi supplier jika dipilih
  -- ----------------------------------------------------------
  if p_supplier_id is not null then
    select exists (
      select 1
      from public.suppliers as s
      where
        s.id = p_supplier_id
        and s.is_active = true
    )
    into v_supplier_exists;

    if not v_supplier_exists then
      raise exception
        using message =
          'Supplier tidak ditemukan atau sudah tidak aktif.';
    end if;
  end if;

  -- ----------------------------------------------------------
  -- Validasi payload item
  -- ----------------------------------------------------------
  if p_items is null then
    raise exception
      using message =
        'Daftar item draft pembelian wajib tersedia.';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception
      using message =
        'Format item draft pembelian tidak valid.';
  end if;

  if jsonb_array_length(p_items) < 1 then
    raise exception
      using message =
        'Draft pembelian harus memiliki minimal satu item.';
  end if;

  -- ----------------------------------------------------------
  -- Mencegah produk duplikat
  -- ----------------------------------------------------------
  select count(*)
  into v_duplicate_count
  from (
    select
      item ->> 'productId' as product_id
    from jsonb_array_elements(p_items) as item
    group by item ->> 'productId'
    having count(*) > 1
  ) as duplicate_products;

  if v_duplicate_count > 0 then
    raise exception
      using message =
        'Produk yang sama tidak boleh ditambahkan lebih dari satu kali.';
  end if;

  -- ----------------------------------------------------------
  -- Validasi setiap item dan hitung estimated_total
  -- ----------------------------------------------------------
  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id :=
        nullif(
          v_item ->> 'productId',
          ''
        )::bigint;

      v_quantity :=
        nullif(
          v_item ->> 'quantity',
          ''
        )::numeric;

      v_unit_cost :=
        nullif(
          v_item ->> 'unitCost',
          ''
        )::numeric;

      v_item_notes :=
        nullif(
          btrim(
            coalesce(
              v_item ->> 'notes',
              ''
            )
          ),
          ''
        );
    exception
      when invalid_text_representation then
        raise exception
          using message =
            'Terdapat nilai item draft pembelian yang tidak valid.';
    end;

    if v_product_id is null or v_product_id < 1 then
      raise exception
        using message =
          'Produk pada draft pembelian tidak valid.';
    end if;

    if v_quantity is null or v_quantity <= 0 then
      raise exception
        using message =
          'Jumlah pembelian harus lebih besar dari nol.';
    end if;

    if v_unit_cost is null or v_unit_cost < 0 then
      raise exception
        using message =
          'Harga satuan pembelian tidak boleh negatif.';
    end if;

    select exists (
      select 1
      from public.products as p
      where
        p.id = v_product_id
        and p.is_active = true
        and p.track_stock = true
    )
    into v_product_exists;

    if not v_product_exists then
      raise exception
        using message =
          format(
            'Produk dengan ID %s tidak ditemukan, tidak aktif, atau tidak melacak stok.',
            v_product_id
          );
    end if;

    v_estimated_total :=
      v_estimated_total
      + (
        v_quantity
        * v_unit_cost
      );
  end loop;

  -- ----------------------------------------------------------
  -- Perbarui header Purchase Request
  -- ----------------------------------------------------------
  update public.purchase_requests
  set
    supplier_id = p_supplier_id,
    request_date = p_request_date,
    expected_date = p_expected_date,
    notes = nullif(
      btrim(
        coalesce(
          p_notes,
          ''
        )
      ),
      ''
    ),
    estimated_total = v_estimated_total,
    updated_at = now()
  where id = p_request_id;

  -- ----------------------------------------------------------
  -- Hapus seluruh item lama
  -- ----------------------------------------------------------
  delete from public.purchase_request_items
  where purchase_request_id = p_request_id;

  -- ----------------------------------------------------------
  -- Masukkan item baru
  -- ----------------------------------------------------------
  insert into public.purchase_request_items (
    purchase_request_id,
    product_id,
    quantity,
    unit_cost,
    subtotal,
    notes
  )
  select
    p_request_id,

    (
      item ->> 'productId'
    )::bigint,

    (
      item ->> 'quantity'
    )::numeric,

    (
      item ->> 'unitCost'
    )::numeric,

    (
      (
        item ->> 'quantity'
      )::numeric
      *
      (
        item ->> 'unitCost'
      )::numeric
    ),

    nullif(
      btrim(
        coalesce(
          item ->> 'notes',
          ''
        )
      ),
      ''
    )
  from jsonb_array_elements(
    p_items
  ) as item;

  -- ----------------------------------------------------------
  -- Return hasil
  -- ----------------------------------------------------------
  return query
  select
    p_request_id,
    v_request_number,
    v_estimated_total;
end;
$$;

revoke all
on function public.update_purchase_request(
  bigint,
  bigint,
  date,
  date,
  text,
  jsonb
)
from public;

grant execute
on function public.update_purchase_request(
  bigint,
  bigint,
  date,
  date,
  text,
  jsonb
)
to authenticated;
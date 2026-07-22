-- ============================================================
-- RPC: reject_purchase_request
-- Duratu Kafe ERP
--
-- Transisi status:
-- submitted -> rejected
--
-- Fungsi:
-- 1. Menambahkan kolom alasan dan waktu penolakan.
-- 2. Memastikan Purchase Request tersedia.
-- 3. Mengunci record agar tidak diproses bersamaan.
-- 4. Hanya mengizinkan status submitted menjadi rejected.
-- 5. Mewajibkan alasan penolakan.
-- 6. Menyimpan alasan dan waktu penolakan secara atomik.
-- ============================================================

alter table public.purchase_requests
add column if not exists rejection_reason text;

alter table public.purchase_requests
add column if not exists rejected_at timestamptz;

create or replace function public.reject_purchase_request(
  p_request_id bigint,
  p_rejection_reason text
)
returns table (
  request_id bigint,
  request_number text,
  previous_status text,
  current_status text,
  rejection_reason text,
  rejected_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_request_number text;
  v_current_status text;
  v_rejection_reason text;
  v_rejected_at timestamptz;
begin
  -- ----------------------------------------------------------
  -- Validasi ID Purchase Request
  -- ----------------------------------------------------------
  if p_request_id is null or p_request_id < 1 then
    raise exception
      using message =
        'ID permintaan pembelian tidak valid.';
  end if;

  -- ----------------------------------------------------------
  -- Normalisasi dan validasi alasan penolakan
  -- ----------------------------------------------------------
  v_rejection_reason :=
    nullif(
      btrim(
        coalesce(
          p_rejection_reason,
          ''
        )
      ),
      ''
    );

  if v_rejection_reason is null then
    raise exception
      using message =
        'Alasan penolakan wajib diisi.';
  end if;

  if char_length(v_rejection_reason) < 5 then
    raise exception
      using message =
        'Alasan penolakan minimal 5 karakter.';
  end if;

  if char_length(v_rejection_reason) > 500 then
    raise exception
      using message =
        'Alasan penolakan maksimal 500 karakter.';
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
  -- Hanya submitted yang dapat ditolak
  -- ----------------------------------------------------------
  if v_current_status <> 'submitted' then
    raise exception
      using message =
        format(
          'Permintaan pembelian tidak dapat ditolak karena status saat ini adalah %s.',
          v_current_status
        );
  end if;

  v_rejected_at := now();

  -- ----------------------------------------------------------
  -- Ubah status menjadi rejected
  -- ----------------------------------------------------------
  update public.purchase_requests
  set
    status = 'rejected',
    rejection_reason = v_rejection_reason,
    rejected_at = v_rejected_at,
    updated_at = v_rejected_at
  where id = p_request_id;

  -- ----------------------------------------------------------
  -- Return hasil
  -- ----------------------------------------------------------
  return query
  select
    p_request_id,
    v_request_number,
    v_current_status,
    'rejected'::text,
    v_rejection_reason,
    v_rejected_at;
end;
$$;

-- ============================================================
-- Hak akses
-- ============================================================

revoke all
on function public.reject_purchase_request(
  bigint,
  text
)
from public;

grant execute
on function public.reject_purchase_request(
  bigint,
  text
)
to authenticated;
import type {
  Supplier,
  SupplierListResult,
} from "@/features/suppliers/types/supplier";

import {
  normalizePageSize,
  normalizePositiveInteger,
} from "@/features/shared/utils/number";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_SUPPLIER_PAGE_SIZE =
  10;

const MAX_SUPPLIER_PAGE_SIZE =
  100;

export type GetSuppliersOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
};

type SupplierRow = {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapSupplierRow(
  row: SupplierRow,
): Supplier {
  return {
    id:
      row.id,

    name:
      row.name,

    contactPerson:
      row.contact_person,

    phone:
      row.phone,

    email:
      row.email,

    address:
      row.address,

    notes:
      row.notes,

    isActive:
      row.is_active,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

export async function getSuppliers(
  options: GetSuppliersOptions = {},
): Promise<SupplierListResult> {
  const page =
    normalizePositiveInteger(
      options.page,
      1,
    );

  const pageSize =
    normalizePageSize(
      options.pageSize,
      {
        fallback:
          DEFAULT_SUPPLIER_PAGE_SIZE,

        maximum:
          MAX_SUPPLIER_PAGE_SIZE,
      },
    );

  const search =
    options.search?.trim() ??
    "";

  const from =
    (page - 1) *
    pageSize;

  const to =
    from +
    pageSize -
    1;

  const supabase =
    await createClient();

  let query =
    supabase
      .from("suppliers")
      .select(
        `
          id,
          name,
          contact_person,
          phone,
          email,
          address,
          notes,
          is_active,
          created_at,
          updated_at
        `,
        {
          count: "exact",
        },
      );

  if (
    typeof options.isActive ===
    "boolean"
  ) {
    query =
      query.eq(
        "is_active",
        options.isActive,
      );
  }

  if (search) {
    const escapedSearch =
      search
        .replaceAll(
          "\\",
          "\\\\",
        )
        .replaceAll(
          "%",
          "\\%",
        )
        .replaceAll(
          "_",
          "\\_",
        )
        .replaceAll(
          ",",
          " ",
        );

    query =
      query.or(
        [
          `name.ilike.%${escapedSearch}%`,
          `contact_person.ilike.%${escapedSearch}%`,
          `phone.ilike.%${escapedSearch}%`,
          `email.ilike.%${escapedSearch}%`,
        ].join(","),
      );
  }

  const {
    data,
    count,
    error,
  } = await query
    .order(
      "is_active",
      {
        ascending: false,
      },
    )
    .order(
      "name",
      {
        ascending: true,
      },
    )
    .range(
      from,
      to,
    );

  if (error) {
    console.error(
      "Get suppliers failed:",
      error,
    );

    throw new Error(
      "Data supplier gagal diambil.",
    );
  }

  const rows =
    (data ??
      []) as SupplierRow[];

  const totalItems =
    count ??
    0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
        pageSize,
      ),
    );

  return {
    suppliers:
      rows.map(
        mapSupplierRow,
      ),

    totalItems,

    totalPages,

    currentPage:
      page,

    pageSize,
  };
}
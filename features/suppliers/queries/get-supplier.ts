import type {
  Supplier,
} from "@/features/suppliers/types/supplier";

import { createClient } from "@/lib/supabase/server";

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

export async function getSupplier(
  supplierId: number,
): Promise<Supplier | null> {
  if (
    !Number.isInteger(
      supplierId,
    ) ||
    supplierId < 1
  ) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
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
    )
    .eq(
      "id",
      supplierId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Get supplier failed:",
      error,
    );

    throw new Error(
      "Detail supplier gagal diambil.",
    );
  }

  if (!data) {
    return null;
  }

  const row =
    data as SupplierRow;

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
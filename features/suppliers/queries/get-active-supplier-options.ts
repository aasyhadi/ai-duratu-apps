import type {
  SupplierOption,
} from "@/features/suppliers/types/supplier";

import {
  createClient,
} from "@/lib/supabase/server";

type SupplierOptionRow = {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
};

export async function getActiveSupplierOptions(): Promise<
  SupplierOption[]
> {
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
        phone
      `,
    )
    .eq(
      "is_active",
      true,
    )
    .order(
      "name",
      {
        ascending: true,
      },
    );

  if (error) {
    console.error(
      "Get active supplier options failed:",
      error,
    );

    throw new Error(
      "Pilihan supplier gagal diambil.",
    );
  }

  const rows =
    (data ??
      []) as SupplierOptionRow[];

  return rows.map(
    (
      row,
    ): SupplierOption => ({
      id:
        row.id,

      name:
        row.name,

      contactPerson:
        row.contact_person,

      phone:
        row.phone,
    }),
  );
}
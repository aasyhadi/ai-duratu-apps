import { createClient } from "@/lib/supabase/server";

import type {
  InventoryAdjustmentProduct,
} from "@/features/inventory/types/inventory";

import { toSafeNumber } from "@/features/shared/utils/number";

type ProductRow = {
  id: number;
  sku: string | null;
  name: string;
  unit: string;
  stock: number |string;
  minimum_stock: number | string;
  cost_price: number | string;
  is_active: boolean;
  track_stock: boolean;
};

export async function getInventoryAdjustmentProducts(): Promise<
  InventoryAdjustmentProduct[]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        sku,
        name,
        unit,
        stock,
        minimum_stock,
        cost_price,
        is_active,
        track_stock
      `,
    )
    .eq(
      "track_stock",
      true,
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
      "Get inventory adjustment products failed:",
      error,
    );

    throw new Error(
      "Daftar produk untuk penyesuaian stok gagal diambil.",
    );
  }

  const rows =
    (data ?? []) as ProductRow[];

  return rows.map(
    (row): InventoryAdjustmentProduct => ({
      id: row.id,

      sku: row.sku,

      name: row.name,

      unit: row.unit,

      stock: toSafeNumber(
        row.stock,
      ),

      minimumStock:
        toSafeNumber(
          row.minimum_stock,
        ),

      costPrice:
        toSafeNumber(
          row.cost_price,
        ),

      isActive:
        row.is_active,
    }),
  );
}
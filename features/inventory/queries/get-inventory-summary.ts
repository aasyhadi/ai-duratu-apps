import { createClient } from "@/lib/supabase/server";

import type { InventorySummary } from "@/features/inventory/types/inventory";

import { toSafeNumber } from "@/features/shared/utils/number";

type ProductInventorySummaryRow = {
  id: number;
  stock: number | string;
  track_stock: boolean;
  is_active: boolean;
  stock_status:
    | "available"
    | "low_stock"
    | "out_of_stock"
    | "not_tracked";
  inventory_cost_value:
    | number
    | string
    | null;
  inventory_selling_value:
    | number
    | string
    | null;
};

function getStartOfTodayIso(): string {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  return today.toISOString();
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const supabase =
    await createClient();

  const [
    productResult,
    movementResult,
  ] = await Promise.all([
    supabase
      .from(
        "product_inventory_summary",
      )
      .select(
        `
          id,
          stock,
          track_stock,
          is_active,
          stock_status,
          inventory_cost_value,
          inventory_selling_value
        `,
      ),

    supabase
      .from(
        "inventory_movements",
      )
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte(
        "movement_date",
        getStartOfTodayIso(),
      ),
  ]);

  if (productResult.error) {
    console.error(
      "Get inventory summary products failed:",
      productResult.error,
    );

    throw new Error(
      "Ringkasan persediaan gagal diambil.",
    );
  }

  if (movementResult.error) {
    console.error(
      "Count inventory movements today failed:",
      movementResult.error,
    );

    throw new Error(
      "Pergerakan stok hari ini gagal dihitung.",
    );
  }

  const rows =
    (productResult.data ??
      []) as ProductInventorySummaryRow[];

  const trackedRows = rows.filter(
    ({ track_stock }) => track_stock,
  );

  const activeTrackedRows =
    trackedRows.filter(
      ({ is_active }) => is_active,
    );

  const inventoryCostValue =
    trackedRows.reduce(
      (total, row) =>
        total +
        toSafeNumber(
          row.inventory_cost_value,
        ),
      0,
    );

  const inventorySellingValue =
    trackedRows.reduce(
      (total, row) =>
        total +
        toSafeNumber(
          row.inventory_selling_value,
        ),
      0,
    );

  return {
    trackedProducts:
      trackedRows.length,

    activeTrackedProducts:
      activeTrackedRows.length,

    totalStockQuantity:
      activeTrackedRows.reduce(
        (total, row) =>
          total +
          toSafeNumber(
            row.stock,
          ),
        0,
      ),

    inventoryCostValue,

    inventorySellingValue,

    potentialGrossProfit:
      inventorySellingValue -
      inventoryCostValue,

    lowStockProducts:
      activeTrackedRows.filter(
        (row) =>
          row.stock_status ===
          "low_stock",
      ).length,

    outOfStockProducts:
      activeTrackedRows.filter(
        (row) =>
          row.stock_status ===
          "out_of_stock",
      ).length,

    movementsToday:
      movementResult.count ??
      0,
  };
}
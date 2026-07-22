import { DEFAULT_RESTOCK_MULTIPLIER } from "@/features/inventory/constants/restock-constants";

import type {
  InventoryLowStockProduct,
  InventoryLowStockResult,
  InventoryLowStockStatus,
} from "@/features/inventory/types/inventory";

import { createClient } from "@/lib/supabase/server";

import { toSafeNumber } from "@/features/shared/utils/number";

type LowStockProductRow = {
  id: number;
  sku: string | null;
  name: string;
  category_name: string | null;
  unit: string;
  stock: number | string;
  minimum_stock: number | string;
  cost_price: number | string;
  selling_price: number | string;
  stock_status: string;
  track_stock: boolean;
  is_active: boolean;
};

type ValidLowStockProductRow =
  LowStockProductRow & {
    stock_status: InventoryLowStockStatus;
  };

function isLowStockStatus(
  value: string,
): value is InventoryLowStockStatus {
  return (
    value === "low_stock" ||
    value === "out_of_stock"
  );
}

function isValidLowStockProductRow(
  row: LowStockProductRow,
): row is ValidLowStockProductRow {
  return isLowStockStatus(
    row.stock_status,
  );
}

export async function getLowStockProducts(): Promise<InventoryLowStockResult> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "product_inventory_summary",
    )
    .select(
      `
        id,
        sku,
        name,
        category_name,
        unit,
        stock,
        minimum_stock,
        cost_price,
        selling_price,
        stock_status,
        track_stock,
        is_active
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
    .in(
      "stock_status",
      [
        "low_stock",
        "out_of_stock",
      ],
    )
    .order(
      "stock_status",
      {
        ascending: false,
      },
    )
    .order(
      "stock",
      {
        ascending: true,
      },
    )
    .order(
      "name",
      {
        ascending: true,
      },
    );

  if (error) {
    console.error(
      "Get low stock products failed:",
      error,
    );

    throw new Error(
      "Data produk stok rendah gagal diambil.",
    );
  }

  const rows =
    (data ??
      []) as LowStockProductRow[];

  const validRows =
    rows.filter(
      isValidLowStockProductRow,
    );

  const products: InventoryLowStockProduct[] =
    validRows.map(
      (row) => {
        const stock =
          toSafeNumber(
            row.stock,
          );

        const minimumStock =
          toSafeNumber(
            row.minimum_stock,
          );

        const costPrice =
          toSafeNumber(
            row.cost_price,
          );

        const sellingPrice =
          toSafeNumber(
            row.selling_price,
          );

        const shortageQuantity =
          Math.max(
            minimumStock -
              stock,
            0,
          );

        const targetStock =
          Math.max(
            minimumStock *
              DEFAULT_RESTOCK_MULTIPLIER,
            minimumStock,
          );

        const recommendedRestockQuantity =
          Math.max(
            targetStock -
              stock,
            0,
          );

        const estimatedRestockCost =
          recommendedRestockQuantity *
          costPrice;

        return {
          id: row.id,

          sku:
            row.sku,

          name:
            row.name,

          categoryName:
            row.category_name,

          unit:
            row.unit,

          stock,

          minimumStock,

          costPrice,

          sellingPrice,

          stockStatus:
            row.stock_status,

          shortageQuantity,

          recommendedRestockQuantity,

          estimatedRestockCost,
        };
      },
    );

  const estimatedRestockCost =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        product.estimatedRestockCost,
      0,
    );

  const totalRecommendedQuantity =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        product.recommendedRestockQuantity,
      0,
    );

  const lowStockProducts =
    products.filter(
      (product) =>
        product.stockStatus ===
        "low_stock",
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        product.stockStatus ===
        "out_of_stock",
    ).length;

  return {
    products,

    summary: {
      totalProducts:
        products.length,

      lowStockProducts,

      outOfStockProducts,

      totalRecommendedQuantity,

      estimatedRestockCost,
    },
  };
}
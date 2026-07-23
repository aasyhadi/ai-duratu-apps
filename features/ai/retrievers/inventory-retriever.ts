import { getInventorySummary } from "@/features/inventory/queries/get-inventory-summary";
import { createClient } from "@/lib/supabase/server";

import type {
  InventoryKnowledgeContext,
  InventoryKnowledgeProduct,
  InventoryQueryAnalysis,
} from "@/features/ai/types/inventory-knowledge";

import { toSafeNumber } from "@/features/shared/utils/number";

type InventoryProductRow = {
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

function normalizeSearchTerm(
  value: string,
): string {
  return value
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ");
}

function isSupportedStockStatus(
  value: string,
): value is
  | "available"
  | "low_stock"
  | "out_of_stock" {
  return (
    value === "available" ||
    value === "low_stock" ||
    value === "out_of_stock"
  );
}

function mapProductRow(
  row: InventoryProductRow,
): InventoryKnowledgeProduct | null {
  if (
    !isSupportedStockStatus(
      row.stock_status,
    )
  ) {
    return null;
  }

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,

    categoryName:
      row.category_name,

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

    sellingPrice:
      toSafeNumber(
        row.selling_price,
      ),

    stockStatus:
      row.stock_status,
  };
}

export async function retrieveInventoryKnowledge(
  queryAnalysis: InventoryQueryAnalysis,
): Promise<InventoryKnowledgeContext> {
  const supabase =
    await createClient();

  const summaryPromise =
    getInventorySummary();

  let productQuery = supabase
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
    .eq("track_stock", true)
    .eq("is_active", true);

  if (
    queryAnalysis.kind ===
    "low_stock"
  ) {
    productQuery =
      productQuery.in(
        "stock_status",
        [
          "low_stock",
          "out_of_stock",
        ],
      );
  }

  if (
    queryAnalysis.kind ===
    "out_of_stock"
  ) {
    productQuery =
      productQuery.eq(
        "stock_status",
        "out_of_stock",
      );
  }

  if (
    queryAnalysis.kind ===
      "product_stock" &&
    queryAnalysis.searchTerm
  ) {
    const search =
      normalizeSearchTerm(
        queryAnalysis.searchTerm,
      );

    productQuery =
      productQuery.or(
        [
          `name.ilike.%${search}%`,
          `sku.ilike.%${search}%`,
          `category_name.ilike.%${search}%`,
        ].join(","),
      );
  }

  const [
    summary,
    productResult,
  ] = await Promise.all([
    summaryPromise,

    productQuery
      .order("stock", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      })
      .limit(100),
  ]);

  if (productResult.error) {
    console.error(
      "Retrieve AI inventory knowledge failed:",
      productResult.error,
    );

    throw new Error(
      "Data persediaan gagal diambil dari Supabase.",
    );
  }

  const rows =
    (productResult.data ??
      []) as InventoryProductRow[];

  const products = rows
    .map(mapProductRow)
    .filter(
      (
        product,
      ): product is InventoryKnowledgeProduct =>
        product !== null,
    );

  return {
    query: queryAnalysis,

    summary,

    products,

    retrievedAt:
      new Date().toISOString(),
  };
}
import { createClient } from "@/lib/supabase/server";

import type {
  Product,
  ProductListResult,
  ProductStockStatus,
} from "@/features/products/types/product";

import {
  DEFAULT_PRODUCT_PAGE_SIZE,
  MAX_PRODUCT_PAGE_SIZE,
  PRODUCT_STOCK_STATUSES,
} from "@/features/products/constants/product-constants";

export type GetProductsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  stockStatus?: string;
  activeStatus?: string;
};

type ProductSummaryRow = {
  id: number;
  is_active: boolean;
  stock_status: ProductStockStatus;
  inventory_cost_value: number | string | null;
  inventory_selling_value: number | string | null;
};

type ProductViewRow = {
  id: number;
  sku: string | null;
  name: string;
  category_name: string | null;
  unit: string;
  cost_price: number | string;
  selling_price: number | string;
  stock: number | string;
  minimum_stock: number | string;
  track_stock: boolean;
  is_active: boolean;
  inventory_cost_value: number | string | null;
  inventory_selling_value: number | string | null;
  gross_margin_per_unit: number | string | null;
  gross_margin_percentage: number | string | null;
  stock_status: ProductStockStatus;
  created_at: string;
  updated_at: string;
};

type ProductDetailRow = {
  id: number;
  category_id: number | null;
  description: string | null;
};

function toNumber(
  value: number | string | null | undefined,
): number {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function normalizePage(page?: number): number {
  if (
    !page ||
    !Number.isInteger(page) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

function normalizePageSize(
  pageSize?: number,
): number {
  if (
    !pageSize ||
    !Number.isInteger(pageSize) ||
    pageSize < 1
  ) {
    return DEFAULT_PRODUCT_PAGE_SIZE;
  }

  return Math.min(
    pageSize,
    MAX_PRODUCT_PAGE_SIZE,
  );
}

function normalizeSearchTerm(
  value?: string,
): string {
  return (
    value
      ?.trim()
      .replace(/[,%()]/g, " ") ?? ""
  );
}

function isValidStockStatus(
  value: string,
): value is ProductStockStatus {
  return PRODUCT_STOCK_STATUSES.includes(
    value as ProductStockStatus,
  );
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<ProductListResult> {
  const requestedPage =
    normalizePage(options.page);

  const pageSize =
    normalizePageSize(
      options.pageSize,
    );

  const search =
    normalizeSearchTerm(
      options.search,
    );

  const category =
    options.category?.trim() ?? "";

  const stockStatus =
    options.stockStatus?.trim() ?? "";

  const activeStatus =
    options.activeStatus?.trim() ?? "";

  const supabase =
    await createClient();

  let countQuery = supabase
    .from(
      "product_inventory_summary",
    )
    .select("id", {
      count: "exact",
      head: true,
    });

  if (search) {
    countQuery = countQuery.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%`,
    );
  }

  if (
    category &&
    category !== "all"
  ) {
    countQuery = countQuery.eq(
      "category_name",
      category,
    );
  }

  if (
    stockStatus &&
    stockStatus !== "all" &&
    isValidStockStatus(
      stockStatus,
    )
  ) {
    countQuery = countQuery.eq(
      "stock_status",
      stockStatus,
    );
  }

  if (activeStatus === "active") {
    countQuery = countQuery.eq(
      "is_active",
      true,
    );
  }

  if (activeStatus === "inactive") {
    countQuery = countQuery.eq(
      "is_active",
      false,
    );
  }

  const {
    count,
    error: countError,
  } = await countQuery;

  if (countError) {
    console.error(
      "Count products failed:",
      countError,
    );

    throw new Error(
      "Jumlah produk gagal dihitung.",
    );
  }

  const totalItems =
    count ?? 0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
          pageSize,
      ),
    );

  const currentPage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const from =
    (currentPage - 1) *
    pageSize;

  const to =
    from +
    pageSize -
    1;

  let listQuery = supabase
    .from(
      "product_inventory_summary",
    )
    .select("*");

  if (search) {
    listQuery = listQuery.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%`,
    );
  }

  if (
    category &&
    category !== "all"
  ) {
    listQuery = listQuery.eq(
      "category_name",
      category,
    );
  }

  if (
    stockStatus &&
    stockStatus !== "all" &&
    isValidStockStatus(
      stockStatus,
    )
  ) {
    listQuery = listQuery.eq(
      "stock_status",
      stockStatus,
    );
  }

  if (activeStatus === "active") {
    listQuery = listQuery.eq(
      "is_active",
      true,
    );
  }

  if (activeStatus === "inactive") {
    listQuery = listQuery.eq(
      "is_active",
      false,
    );
  }

  const {
    data,
    error,
  } = await listQuery
    .order("is_active", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    })
    .range(from, to);

  if (error) {
    console.error(
      "Get products failed:",
      error,
    );

    throw new Error(
      "Data produk gagal diambil.",
    );
  }

  const rows =
    (data ?? []) as ProductViewRow[];

  const productIds =
    rows.map(
      (row) => row.id,
    );

  const detailMap =
    new Map<
      number,
      ProductDetailRow
    >();

  if (
    productIds.length > 0
  ) {
    const {
      data: detailData,
      error: detailError,
    } = await supabase
      .from("products")
      .select(
        `
          id,
          category_id,
          description
        `,
      )
      .in("id", productIds);

    if (detailError) {
      console.error(
        "Get product details failed:",
        detailError,
      );

      throw new Error(
        "Detail produk gagal diambil.",
      );
    }

    for (
      const detail of
      (detailData ??
        []) as ProductDetailRow[]
    ) {
      detailMap.set(
        detail.id,
        detail,
      );
    }
  }

  const products: Product[] =
    rows.map((row) => {
      const detail =
        detailMap.get(row.id);

      return {
        id: row.id,

        sku: row.sku,

        name: row.name,

        categoryName:
          row.category_name,

        categoryId:
          detail?.category_id ??
          null,

        description:
          detail?.description ??
          null,

        unit: row.unit,

        costPrice:
          toNumber(
            row.cost_price,
          ),

        sellingPrice:
          toNumber(
            row.selling_price,
          ),

        stock:
          toNumber(row.stock),

        minimumStock:
          toNumber(
            row.minimum_stock,
          ),

        trackStock:
          row.track_stock,

        isActive:
          row.is_active,

        inventoryCostValue:
          toNumber(
            row.inventory_cost_value,
          ),

        inventorySellingValue:
          toNumber(
            row.inventory_selling_value,
          ),

        grossMarginPerUnit:
          toNumber(
            row.gross_margin_per_unit,
          ),

        grossMarginPercentage:
          toNumber(
            row.gross_margin_percentage,
          ),

        stockStatus:
          row.stock_status,

        createdAt:
          row.created_at,

        updatedAt:
          row.updated_at,
      };
    });

  const {
    data: summaryData,
    error: summaryError,
  } = await supabase
    .from(
      "product_inventory_summary",
    )
    .select(
      `
        id,
        is_active,
        stock_status,
        inventory_cost_value,
        inventory_selling_value
      `,
    );

  if (summaryError) {
    console.error(
      "Get product summary failed:",
      summaryError,
    );

    throw new Error(
      "Ringkasan produk gagal diambil.",
    );
  }

  const summaryRows =
    (summaryData ??
      []) as ProductSummaryRow[];

  const inventoryCostValue =
    summaryRows.reduce(
      (total, row) =>
        total +
        toNumber(
          row.inventory_cost_value,
        ),
      0,
    );

  const inventorySellingValue =
    summaryRows.reduce(
      (total, row) =>
        total +
        toNumber(
          row.inventory_selling_value,
        ),
      0,
    );

  return {
    products,

    summary: {
      totalProducts:
        summaryRows.length,

      activeProducts:
        summaryRows.filter(
          (row) =>
            row.is_active,
        ).length,

      inactiveProducts:
        summaryRows.filter(
          (row) =>
            !row.is_active,
        ).length,

      lowStockProducts:
        summaryRows.filter(
          (row) =>
            row.is_active &&
            row.stock_status ===
              "low_stock",
        ).length,

      outOfStockProducts:
        summaryRows.filter(
          (row) =>
            row.is_active &&
            row.stock_status ===
              "out_of_stock",
        ).length,

      inventoryCostValue,

      inventorySellingValue,

      potentialGrossProfit:
        inventorySellingValue -
        inventoryCostValue,
    },

    totalItems,
    totalPages,
    currentPage,
    pageSize,
  };
}
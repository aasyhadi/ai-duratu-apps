import {
  DEFAULT_INVENTORY_PAGE_SIZE,
  INVENTORY_MOVEMENT_TYPES,
  MAX_INVENTORY_PAGE_SIZE,
  getInventoryMovementDirection,
} from "@/features/inventory/constants/inventory-constants";

import type {
  InventoryMovement,
  InventoryMovementFilters,
  InventoryMovementListResult,
  InventoryMovementType,
} from "@/features/inventory/types/inventory";

import {
  normalizePageSize,
  normalizePositiveInteger,
  toSafeNumber,
} from "@/features/shared/utils/number";

import { createClient } from "@/lib/supabase/server";

type ProductRelationRow = {
  name: string;
  sku: string | null;
  unit: string;
};

type InventoryMovementRow = {
  id: number;
  product_id: number;
  supplier_id: number | null;
  sale_id: number | null;
  movement_type: string;
  quantity: number | string;
  unit_cost:
    | number
    | string
    | null;
  reference_number:
    | string
    | null;
  notes: string | null;
  movement_date: string;
  created_at: string;
  products:
    | ProductRelationRow
    | ProductRelationRow[]
    | null;
};

type ValidInventoryMovementRow =
  Omit<
    InventoryMovementRow,
    "movement_type"
  > & {
    movement_type: InventoryMovementType;
  };

function normalizeSearch(
  value?: string,
): string {
  return (
    value
      ?.trim()
      .replace(
        /[,%()]/g,
        " ",
      ) ?? ""
  );
}

function isInventoryMovementType(
  value: string,
): value is InventoryMovementType {
  return INVENTORY_MOVEMENT_TYPES.includes(
    value as InventoryMovementType,
  );
}

function isValidInventoryMovementRow(
  row: InventoryMovementRow,
): row is ValidInventoryMovementRow {
  return isInventoryMovementType(
    row.movement_type,
  );
}

function getProductRelation(
  value:
    | ProductRelationRow
    | ProductRelationRow[]
    | null,
): ProductRelationRow | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export async function getInventoryMovements(
  options: InventoryMovementFilters = {},
): Promise<InventoryMovementListResult> {
  const requestedPage =
    normalizePositiveInteger(
      options.page,
      1,
    );

  const pageSize =
    normalizePageSize(
      options.pageSize,
      {
        fallback:
          DEFAULT_INVENTORY_PAGE_SIZE,

        maximum:
          MAX_INVENTORY_PAGE_SIZE,
      },
    );

  const search =
    normalizeSearch(
      options.search,
    );

  const movementType =
    options.movementType?.trim() ??
    "";

  const hasMovementTypeFilter =
    movementType !== "" &&
    movementType !== "all" &&
    isInventoryMovementType(
      movementType,
    );

  const supabase =
    await createClient();

  let countQuery = supabase
    .from(
      "inventory_movements",
    )
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    );

  if (hasMovementTypeFilter) {
    countQuery =
      countQuery.eq(
        "movement_type",
        movementType,
      );
  }

  if (options.dateFrom) {
    countQuery =
      countQuery.gte(
        "movement_date",
        `${options.dateFrom}T00:00:00`,
      );
  }

  if (options.dateTo) {
    countQuery =
      countQuery.lte(
        "movement_date",
        `${options.dateTo}T23:59:59.999`,
      );
  }

  if (search) {
    countQuery =
      countQuery.or(
        `reference_number.ilike.%${search}%,notes.ilike.%${search}%`,
      );
  }

  const {
    count,
    error: countError,
  } = await countQuery;

  if (countError) {
    console.error(
      "Count inventory movements failed:",
      countError,
    );

    throw new Error(
      "Jumlah pergerakan stok gagal dihitung.",
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
      "inventory_movements",
    )
    .select(
      `
        id,
        product_id,
        supplier_id,
        sale_id,
        movement_type,
        quantity,
        unit_cost,
        reference_number,
        notes,
        movement_date,
        created_at,
        products (
          name,
          sku,
          unit
        )
      `,
    );

  if (hasMovementTypeFilter) {
    listQuery =
      listQuery.eq(
        "movement_type",
        movementType,
      );
  }

  if (options.dateFrom) {
    listQuery =
      listQuery.gte(
        "movement_date",
        `${options.dateFrom}T00:00:00`,
      );
  }

  if (options.dateTo) {
    listQuery =
      listQuery.lte(
        "movement_date",
        `${options.dateTo}T23:59:59.999`,
      );
  }

  if (search) {
    listQuery =
      listQuery.or(
        `reference_number.ilike.%${search}%,notes.ilike.%${search}%`,
      );
  }

  const {
    data,
    error,
  } = await listQuery
    .order(
      "movement_date",
      {
        ascending: false,
      },
    )
    .order(
      "id",
      {
        ascending: false,
      },
    )
    .range(
      from,
      to,
    );

  if (error) {
    console.error(
      "Get inventory movements failed:",
      error,
    );

    throw new Error(
      "Riwayat pergerakan stok gagal diambil.",
    );
  }

  const rows =
    (data ?? []) as InventoryMovementRow[];

  const validRows =
    rows.filter(
      isValidInventoryMovementRow,
    );

  const movements: InventoryMovement[] =
    validRows.map(
      (row) => {
        const direction =
          getInventoryMovementDirection(
            row.movement_type,
          );

        const quantity =
          toSafeNumber(
            row.quantity,
          );

        const unitCost =
          row.unit_cost === null
            ? null
            : toSafeNumber(
                row.unit_cost,
              );

        const product =
          getProductRelation(
            row.products,
          );

        return {
          id: row.id,

          productId:
            row.product_id,

          productName:
            product?.name ??
            "Produk tidak ditemukan",

          productSku:
            product?.sku ??
            null,

          productUnit:
            product?.unit ??
            "unit",

          supplierId:
            row.supplier_id,

          saleId:
            row.sale_id,

          movementType:
            row.movement_type,

          direction,

          quantity,

          signedQuantity:
            direction === "in"
              ? quantity
              : -quantity,

          unitCost,

          totalCost:
            unitCost === null
              ? null
              : quantity *
                unitCost,

          referenceNumber:
            row.reference_number,

          notes:
            row.notes,

          movementDate:
            row.movement_date,

          createdAt:
            row.created_at,
        };
      },
    );

  return {
    movements,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
  };
}
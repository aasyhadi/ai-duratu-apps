import {
  DEFAULT_INVENTORY_PAGE_SIZE,
  INVENTORY_MOVEMENT_TYPES,
  MAX_INVENTORY_PAGE_SIZE,
  getInventoryMovementDirection,
} from "@/features/inventory/constants/inventory-constants";

import type {
  InventoryMovementType,
  InventoryStockCardEntry,
  InventoryStockCardResult,
} from "@/features/inventory/types/inventory";

import {
  normalizePageSize,
  normalizePositiveInteger,
  toSafeNumber,
} from "@/features/shared/utils/number";

import { createClient } from "@/lib/supabase/server";

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
  inventory_cost_value:
    | number
    | string
    | null;
  inventory_selling_value:
    | number
    | string
    | null;
};

type InventoryMovementRow = {
  id: number;
  movement_type: string;
  quantity: number | string;
  unit_cost:
    | number
    | string
    | null;
  reference_number: string | null;
  notes: string | null;
  movement_date: string;
};

type ValidInventoryMovementRow =
  Omit<
    InventoryMovementRow,
    "movement_type"
  > & {
    movement_type: InventoryMovementType;
  };

type InventoryMovementBalanceRow = {
  movement_type: string;
  quantity: number | string;
};

type ValidInventoryMovementBalanceRow =
  Omit<
    InventoryMovementBalanceRow,
    "movement_type"
  > & {
    movement_type: InventoryMovementType;
  };

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

function isValidInventoryMovementBalanceRow(
  row: InventoryMovementBalanceRow,
): row is ValidInventoryMovementBalanceRow {
  return isInventoryMovementType(
    row.movement_type,
  );
}

function getSignedQuantity(
  movementType: InventoryMovementType,
  quantity: number,
): number {
  const direction =
    getInventoryMovementDirection(
      movementType,
    );

  return direction === "in"
    ? quantity
    : -quantity;
}

export async function getInventoryStockCard(
  productId: number,
  options: {
    page?: number;
    pageSize?: number;
  } = {},
): Promise<InventoryStockCardResult | null> {
  if (
    !Number.isInteger(productId) ||
    productId < 1
  ) {
    return null;
  }

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

  const supabase =
    await createClient();

  const {
    data: productData,
    error: productError,
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
        cost_price,
        selling_price,
        stock,
        minimum_stock,
        track_stock,
        is_active,
        inventory_cost_value,
        inventory_selling_value
      `,
    )
    .eq(
      "id",
      productId,
    )
    .maybeSingle();

  if (productError) {
    console.error(
      "Get stock card product failed:",
      productError,
    );

    throw new Error(
      "Data produk gagal diambil.",
    );
  }

  if (!productData) {
    return null;
  }

  const productRow =
    productData as ProductViewRow;

  const {
    count,
    error: countError,
  } = await supabase
    .from(
      "inventory_movements",
    )
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .eq(
      "product_id",
      productId,
    );

  if (countError) {
    console.error(
      "Count stock card movements failed:",
      countError,
    );

    throw new Error(
      "Jumlah riwayat stok gagal dihitung.",
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

  const {
    data: movementData,
    error: movementError,
  } = await supabase
    .from(
      "inventory_movements",
    )
    .select(
      `
        id,
        movement_type,
        quantity,
        unit_cost,
        reference_number,
        notes,
        movement_date
      `,
    )
    .eq(
      "product_id",
      productId,
    )
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

  if (movementError) {
    console.error(
      "Get stock card movements failed:",
      movementError,
    );

    throw new Error(
      "Riwayat kartu stok gagal diambil.",
    );
  }

  let newerMovementsSignedTotal =
    0;

  if (from > 0) {
    const {
      data: newerMovementData,
      error: newerMovementError,
    } = await supabase
      .from(
        "inventory_movements",
      )
      .select(
        `
          movement_type,
          quantity
        `,
      )
      .eq(
        "product_id",
        productId,
      )
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
        0,
        from - 1,
      );

    if (newerMovementError) {
      console.error(
        "Get newer stock card movements failed:",
        newerMovementError,
      );

      throw new Error(
        "Saldo awal halaman kartu stok gagal dihitung.",
      );
    }

    const newerRows =
      (
        newerMovementData ??
        []
      ) as InventoryMovementBalanceRow[];

    const validNewerRows =
      newerRows.filter(
        isValidInventoryMovementBalanceRow,
      );

    newerMovementsSignedTotal =
      validNewerRows.reduce(
        (
          total,
          row,
        ) =>
          total +
          getSignedQuantity(
            row.movement_type,
            toSafeNumber(
              row.quantity,
            ),
          ),
        0,
      );
  }

  const rows =
    (
      movementData ??
      []
    ) as InventoryMovementRow[];

  const validRows =
    rows.filter(
      isValidInventoryMovementRow,
    );

  let runningBalance =
    toSafeNumber(
      productRow.stock,
    ) -
    newerMovementsSignedTotal;

  const entries: InventoryStockCardEntry[] =
    [];

  for (
    const row of validRows
  ) {
    const movementType =
      row.movement_type;

    const direction =
      getInventoryMovementDirection(
        movementType,
      );

    const quantity =
      toSafeNumber(
        row.quantity,
      );

    const signedQuantity =
      getSignedQuantity(
        movementType,
        quantity,
      );

    const unitCost =
      row.unit_cost === null
        ? null
        : toSafeNumber(
            row.unit_cost,
          );

    entries.push({
      id: row.id,

      movementType,

      direction,

      quantity,

      signedQuantity,

      balanceAfter:
        runningBalance,

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
    });

    runningBalance -=
      signedQuantity;
  }

  return {
    product: {
      id:
        productRow.id,

      sku:
        productRow.sku,

      name:
        productRow.name,

      categoryName:
        productRow.category_name,

      unit:
        productRow.unit,

      stock:
        toSafeNumber(
          productRow.stock,
        ),

      minimumStock:
        toSafeNumber(
          productRow.minimum_stock,
        ),

      costPrice:
        toSafeNumber(
          productRow.cost_price,
        ),

      sellingPrice:
        toSafeNumber(
          productRow.selling_price,
        ),

      trackStock:
        productRow.track_stock,

      isActive:
        productRow.is_active,

      inventoryCostValue:
        toSafeNumber(
          productRow.inventory_cost_value,
        ),

      inventorySellingValue:
        toSafeNumber(
          productRow.inventory_selling_value,
        ),
    },

    entries,

    totalItems,

    totalPages,

    currentPage,

    pageSize,
  };
}
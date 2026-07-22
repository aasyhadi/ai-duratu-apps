"use server";

import { revalidatePath } from "next/cache";

import { inventoryAdjustmentSchema } from "@/features/inventory/schemas/inventory-schema";
import type { InventoryAdjustmentResult } from "@/features/inventory/types/inventory";
import { createClient } from "@/lib/supabase/server";

export type AdjustProductStockState = {
  success: boolean;
  message: string;
  data?: InventoryAdjustmentResult;
  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
};

type AdjustmentRpcRow = {
  product_id: number;
  previous_stock:
    | number
    | string;
  physical_stock:
    | number
    | string;
  stock_difference:
    | number
    | string;
  movement_id: number;
};

function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number {
  const result =
    Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
}

export async function adjustProductStock(
  values: unknown,
): Promise<AdjustProductStockState> {
  const validationResult =
    inventoryAdjustmentSchema.safeParse(
      values,
    );

  if (
    !validationResult.success
  ) {
    return {
      success: false,
      message:
        "Data penyesuaian stok belum valid.",
      fieldErrors:
        validationResult.error
          .flatten().fieldErrors,
    };
  }

  const {
    productId,
    physicalStock,
    notes,
  } = validationResult.data;

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "adjust_product_stock",
    {
      p_product_id:
        productId,
      p_physical_stock:
        physicalStock,
      p_notes:
        notes,
    },
  );

  if (error) {
    console.error(
      "Adjust product stock failed:",
      error,
    );

    return {
      success: false,
      message:
        error.message ||
        "Penyesuaian stok gagal disimpan.",
    };
  }

  const row =
    (
      data as
        | AdjustmentRpcRow[]
        | null
    )?.[0];

  if (!row) {
    return {
      success: false,
      message:
        "Hasil penyesuaian stok tidak ditemukan.",
    };
  }

  const stockDifference =
    toNumber(
      row.stock_difference,
    );

  revalidatePath(
    "/inventory",
  );

  revalidatePath(
    "/products",
  );

  revalidatePath(
    "/dashboard",
  );

  return {
    success: true,

    message:
      stockDifference > 0
        ? "Stok berhasil ditambahkan."
        : "Stok berhasil dikurangi.",

    data: {
      productId:
        row.product_id,

      previousStock:
        toNumber(
          row.previous_stock,
        ),

      physicalStock:
        toNumber(
          row.physical_stock,
        ),

      stockDifference,

      movementId:
        row.movement_id,
    },
  };
}
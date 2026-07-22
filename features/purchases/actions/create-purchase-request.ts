"use server";

import { revalidatePath } from "next/cache";

import { createPurchaseRequestSchema } from "@/features/purchases/schemas/purchase-request-schema";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "@/features/shared/types/action-state";

import { toSafeNumber } from "@/features/shared/utils/number";

export type CreatePurchaseRequestState =
  ActionState<{
    requestId: number;
    requestNumber: string;
    estimatedTotal: number;
  }>;

type ProductValidationRow = {
  id: number;
  is_active: boolean;
  track_stock: boolean;
};

type CreatePurchaseRequestRpcRow = {
  request_id: number | string;
  request_number: string;
  estimated_total: number | string;
};

export async function createPurchaseRequest(
  values: unknown,
): Promise<CreatePurchaseRequestState> {
  const validationResult =
    createPurchaseRequestSchema.safeParse(
      values,
    );

  if (!validationResult.success) {
    return {
      success: false,
      message:
        "Data draft pembelian belum valid.",
      fieldErrors:
        validationResult.error.flatten()
          .fieldErrors,
    };
  }

  const {
    supplierId,
    requestDate,
    expectedDate,
    notes,
    items,
  } = validationResult.data;

  const supabase =
    await createClient();

  const productIds =
    items.map(
      ({ productId }) =>
        productId,
    );

  const {
    data: productData,
    error: productError,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        is_active,
        track_stock
      `,
    )
    .in(
      "id",
      productIds,
    );

  if (productError) {
    console.error(
      "Validate purchase request products failed:",
      productError,
    );

    return {
      success: false,
      message:
        "Produk draft pembelian gagal divalidasi.",
    };
  }

  const validProductIds =
    new Set(
      (
        (productData ??
          []) as ProductValidationRow[]
      )
        .filter(
          ({
            is_active,
            track_stock,
          }) =>
            is_active &&
            track_stock,
        )
        .map(
          ({ id }) =>
            Number(id),
        ),
    );

  const invalidProduct =
    items.find(
      ({ productId }) =>
        !validProductIds.has(
          productId,
        ),
    );

  if (invalidProduct) {
    return {
      success: false,
      message:
        "Terdapat produk yang tidak aktif, tidak ditemukan, atau tidak melacak stok.",
    };
  }

  const rpcItems =
    items.map(
      ({
        productId,
        quantity,
        unitCost,
        notes,
      }) => ({
        productId,
        quantity,
        unitCost,
        notes,
      }),
    );

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_purchase_request",
    {
      p_supplier_id:
        supplierId,

      p_request_date:
        requestDate,

      p_expected_date:
        expectedDate ??
        null,

      p_notes:
        notes,

      p_items:
        rpcItems,
    },
  );

  if (error) {
    console.error(
      "Create purchase request failed:",
      error,
    );

    return {
      success: false,
      message:
        error.message ||
        "Draft pembelian gagal dibuat.",
    };
  }

  const result =
    (
      data as
        | CreatePurchaseRequestRpcRow[]
        | null
    )?.[0];

  if (!result) {
    return {
      success: false,
      message:
        "Hasil pembuatan draft pembelian tidak ditemukan.",
    };
  }

  revalidatePath(
    "/purchases",
  );

  revalidatePath(
    "/inventory",
  );

  revalidatePath(
    "/dashboard",
  );

  return {
    success: true,

    message:
      "Draft permintaan pembelian berhasil dibuat.",

    data: {
      requestId:
        toSafeNumber(
          result.request_id,
        ),

      requestNumber:
        result.request_number,

      estimatedTotal:
        toSafeNumber(
          result.estimated_total,
        ),
    },
  };
}
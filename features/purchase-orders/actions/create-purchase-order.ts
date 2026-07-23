"use server";

import { revalidatePath } from "next/cache";

import {
  createPurchaseOrderSchema,
} from "@/features/purchase-orders/schemas/create-purchase-order-schema";

import type {
  ActionState,
} from "@/features/shared/types/action-state";

import {
  toSafeNumber,
} from "@/features/shared/utils/number";

import {
  createClient,
} from "@/lib/supabase/server";

export type CreatePurchaseOrderState =
  ActionState<{
    purchaseOrderId: number;
    orderNumber: string;
    purchaseRequestId: number;
    supplierId: number;
    status: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  }>;

type PurchaseRequestValidationRow = {
  id: number;
  request_number: string;
  supplier_id: number | null;
  status: string;
};

type ExistingPurchaseOrderRow = {
  id: number;
  order_number: string;
};

type CreatePurchaseOrderRpcRow = {
  purchase_order_id:
    | number
    | string;

  order_number: string;

  purchase_request_id:
    | number
    | string;

  supplier_id:
    | number
    | string;

  status: string;

  subtotal:
    | number
    | string;

  discount_amount:
    | number
    | string;

  tax_amount:
    | number
    | string;

  total_amount:
    | number
    | string;
};

export async function createPurchaseOrder(
  values: unknown,
): Promise<CreatePurchaseOrderState> {
  const validationResult =
    createPurchaseOrderSchema.safeParse(
      values,
    );

  if (!validationResult.success) {
    return {
      success: false,

      message:
        "Data Purchase Order belum valid.",

      fieldErrors:
        validationResult.error
          .flatten()
          .fieldErrors,
    };
  }

  const {
    purchaseRequestId,
    orderDate,
    expectedDate,
    notes,
    discountAmount,
    taxAmount,
  } = validationResult.data;

  const supabase =
    await createClient();

  /*
   * Validasi awal ini berguna untuk
   * menghasilkan pesan yang lebih jelas
   * sebelum RPC dijalankan.
   *
   * RPC tetap menjadi sumber validasi utama
   * dan tetap melakukan locking transaksi
   * pada database.
   */
  const {
    data: purchaseRequestData,
    error: purchaseRequestError,
  } = await supabase
    .from(
      "purchase_requests",
    )
    .select(
      `
        id,
        request_number,
        supplier_id,
        status
      `,
    )
    .eq(
      "id",
      purchaseRequestId,
    )
    .maybeSingle();

  if (purchaseRequestError) {
    console.error(
      "Validate purchase request before creating purchase order failed:",
      purchaseRequestError,
    );

    return {
      success: false,

      message:
        "Permintaan pembelian gagal divalidasi.",
    };
  }

  if (!purchaseRequestData) {
    return {
      success: false,

      message:
        "Permintaan pembelian tidak ditemukan.",
    };
  }

  const purchaseRequest =
    purchaseRequestData as PurchaseRequestValidationRow;

  if (
    purchaseRequest.status !==
    "approved"
  ) {
    return {
      success: false,

      message:
        `Permintaan pembelian ${purchaseRequest.request_number} tidak dapat dikonversi karena statusnya adalah ${purchaseRequest.status}.`,
    };
  }

  if (
    purchaseRequest.supplier_id ===
    null
  ) {
    return {
      success: false,

      message:
        "Supplier pada permintaan pembelian wajib dipilih sebelum membuat Purchase Order.",
    };
  }

  const {
    data: supplierData,
    error: supplierError,
  } = await supabase
    .from(
      "suppliers",
    )
    .select(
      `
        id,
        is_active
      `,
    )
    .eq(
      "id",
      purchaseRequest.supplier_id,
    )
    .eq(
      "is_active",
      true,
    )
    .maybeSingle();

  if (supplierError) {
    console.error(
      "Validate supplier before creating purchase order failed:",
      supplierError,
    );

    return {
      success: false,

      message:
        "Supplier Purchase Order gagal divalidasi.",
    };
  }

  if (!supplierData) {
    return {
      success: false,

      message:
        "Supplier tidak ditemukan atau sudah tidak aktif.",
    };
  }

  const {
    data: existingOrderData,
    error: existingOrderError,
  } = await supabase
    .from(
      "purchase_orders",
    )
    .select(
      `
        id,
        order_number
      `,
    )
    .eq(
      "purchase_request_id",
      purchaseRequestId,
    )
    .maybeSingle();

  if (existingOrderError) {
    console.error(
      "Check existing purchase order failed:",
      existingOrderError,
    );

    return {
      success: false,

      message:
        "Riwayat konversi Purchase Order gagal diperiksa.",
    };
  }

  if (existingOrderData) {
    const existingOrder =
      existingOrderData as ExistingPurchaseOrderRow;

    return {
      success: false,

      message:
        `Permintaan pembelian ${purchaseRequest.request_number} sudah dikonversi menjadi ${existingOrder.order_number}.`,
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_purchase_order_from_request",
    {
      p_purchase_request_id:
        purchaseRequestId,

      p_order_date:
        orderDate,

      p_expected_date:
        expectedDate ||
        null,

      p_notes:
        notes ||
        null,

      p_discount_amount:
        discountAmount,

      p_tax_amount:
        taxAmount,
    },
  );

  if (error) {
    console.error(
      "Create purchase order from request failed:",
      error,
    );

    return {
      success: false,

      message:
        error.message ||
        "Purchase Order gagal dibuat.",
    };
  }

  const result =
    (
      data as
        | CreatePurchaseOrderRpcRow[]
        | null
    )?.[0];

  if (!result) {
    return {
      success: false,

      message:
        "Hasil pembuatan Purchase Order tidak ditemukan.",
    };
  }

  const purchaseOrderId =
    toSafeNumber(
      result.purchase_order_id,
    );

  revalidatePath(
    "/purchases",
  );

  revalidatePath(
    `/purchases/${purchaseRequestId}`,
  );

  revalidatePath(
    "/purchase-orders",
  );

  revalidatePath(
    `/purchase-orders/${purchaseOrderId}`,
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
      `Purchase Order ${result.order_number} berhasil dibuat.`,

    data: {
      purchaseOrderId,

      orderNumber:
        result.order_number,

      purchaseRequestId:
        toSafeNumber(
          result.purchase_request_id,
        ),

      supplierId:
        toSafeNumber(
          result.supplier_id,
        ),

      status:
        result.status,

      subtotal:
        toSafeNumber(
          result.subtotal,
        ),

      discountAmount:
        toSafeNumber(
          result.discount_amount,
        ),

      taxAmount:
        toSafeNumber(
          result.tax_amount,
        ),

      totalAmount:
        toSafeNumber(
          result.total_amount,
        ),
    },
  };
}
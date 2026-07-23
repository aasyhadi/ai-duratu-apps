"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createGoodsReceiptSchema,
} from "@/features/goods-receipts/schemas/create-goods-receipt-schema";

import type {
  GoodsReceiptCreateResult,
} from "@/features/goods-receipts/types/goods-receipt";

import type {
  ActionState,
} from "@/features/shared/types/action-state";

import {
  toSafeNumber,
} from "@/features/shared/utils/number";

import {
  createClient,
} from "@/lib/supabase/server";

export type CreateGoodsReceiptState =
  ActionState<GoodsReceiptCreateResult>;

type PurchaseOrderValidationRow = {
  id: number;
  order_number: string;
  status: string;
  supplier_id: number;
};

type PurchaseOrderItemValidationRow = {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number | string;
  received_quantity: number | string;
  unit_cost: number | string;
};

type CreateGoodsReceiptRpcRow = {
  goods_receipt_id:
    | number
    | string;

  receipt_number: string;

  purchase_order_id:
    | number
    | string;

  purchase_order_status: string;

  total_items:
    | number
    | string;

  total_quantity_received:
    | number
    | string;

  total_amount:
    | number
    | string;
};

export async function createGoodsReceipt(
  values: unknown,
): Promise<CreateGoodsReceiptState> {
  const validationResult =
    createGoodsReceiptSchema.safeParse(
      values,
    );

  if (!validationResult.success) {
    return {
      success: false,

      message:
        "Data penerimaan barang belum valid.",

      fieldErrors:
        validationResult.error
          .flatten()
          .fieldErrors,
    };
  }

  const {
    purchaseOrderId,
    receiptDate,
    referenceNumber,
    notes,
    items,
  } = validationResult.data;

  const supabase =
    await createClient();

  const {
    data: purchaseOrderData,
    error: purchaseOrderError,
  } = await supabase
    .from(
      "purchase_orders",
    )
    .select(
      `
        id,
        order_number,
        status,
        supplier_id
      `,
    )
    .eq(
      "id",
      purchaseOrderId,
    )
    .maybeSingle();

  if (purchaseOrderError) {
    console.error(
      "Validate purchase order before goods receipt failed:",
      purchaseOrderError,
    );

    return {
      success: false,

      message:
        "Purchase Order gagal divalidasi.",
    };
  }

  if (!purchaseOrderData) {
    return {
      success: false,

      message:
        "Purchase Order tidak ditemukan.",
    };
  }

  const purchaseOrder =
    purchaseOrderData as PurchaseOrderValidationRow;

  const allowedStatuses =
    [
      "sent",
      "confirmed",
      "partial_received",
    ];

  if (
    !allowedStatuses.includes(
      purchaseOrder.status,
    )
  ) {
    return {
      success: false,

      message:
        `Purchase Order ${purchaseOrder.order_number} dengan status ${purchaseOrder.status} tidak dapat menerima barang.`,
    };
  }

  const purchaseOrderItemIds =
    items.map(
      (item) =>
        item.purchaseOrderItemId,
    );

  const uniquePurchaseOrderItemIds =
    new Set(
      purchaseOrderItemIds,
    );

  if (
    uniquePurchaseOrderItemIds.size !==
    purchaseOrderItemIds.length
  ) {
    return {
      success: false,

      message:
        "Item Purchase Order tidak boleh dikirim lebih dari satu kali dalam penerimaan yang sama.",
    };
  }

  const {
    data: purchaseOrderItemsData,
    error: purchaseOrderItemsError,
  } = await supabase
    .from(
      "purchase_order_items",
    )
    .select(
      `
        id,
        purchase_order_id,
        product_id,
        quantity,
        received_quantity,
        unit_cost
      `,
    )
    .eq(
      "purchase_order_id",
      purchaseOrderId,
    )
    .in(
      "id",
      purchaseOrderItemIds,
    );

  if (purchaseOrderItemsError) {
    console.error(
      "Validate purchase order items before goods receipt failed:",
      purchaseOrderItemsError,
    );

    return {
      success: false,

      message:
        "Item Purchase Order gagal divalidasi.",
    };
  }

  const purchaseOrderItems =
    (
      purchaseOrderItemsData ??
      []
    ) as PurchaseOrderItemValidationRow[];

  if (
    purchaseOrderItems.length !==
    purchaseOrderItemIds.length
  ) {
    return {
      success: false,

      message:
        "Satu atau lebih item Purchase Order tidak ditemukan.",
    };
  }

  const itemMap =
    new Map(
      purchaseOrderItems.map(
        (item) => [
          item.id,
          item,
        ],
      ),
    );

  for (
    const inputItem
    of items
  ) {
    const purchaseOrderItem =
      itemMap.get(
        inputItem.purchaseOrderItemId,
      );

    if (!purchaseOrderItem) {
      return {
        success: false,

        message:
          `Item Purchase Order ${inputItem.purchaseOrderItemId} tidak ditemukan.`,
      };
    }

    const orderedQuantity =
      toSafeNumber(
        purchaseOrderItem.quantity,
      );

    const receivedQuantity =
      toSafeNumber(
        purchaseOrderItem.received_quantity,
      );

    const remainingQuantity =
      Math.max(
        0,
        orderedQuantity -
          receivedQuantity,
      );

    if (
      inputItem.quantityReceived >
      remainingQuantity
    ) {
      return {
        success: false,

        message:
          `Jumlah penerimaan untuk item ${inputItem.purchaseOrderItemId} melebihi sisa pesanan. Sisa yang dapat diterima adalah ${remainingQuantity}.`,
      };
    }
  }

  const rpcItems =
    items.map(
      (item) => ({
        purchaseOrderItemId:
          item.purchaseOrderItemId,

        quantityReceived:
          item.quantityReceived,

        unitCost:
          item.unitCost,

        notes:
          item.notes,
      }),
    );

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_goods_receipt",
    {
      p_purchase_order_id:
        purchaseOrderId,

      p_receipt_date:
        receiptDate,

      p_reference_number:
        referenceNumber ||
        null,

      p_notes:
        notes ||
        null,

      p_items:
        rpcItems,
    },
  );

  if (error) {
    console.error(
      "Create goods receipt failed:",
      error,
    );

    return {
      success: false,

      message:
        error.message ||
        "Penerimaan barang gagal disimpan.",
    };
  }

  const result =
    (
      data as
        | CreateGoodsReceiptRpcRow[]
        | null
    )?.[0];

  if (!result) {
    return {
      success: false,

      message:
        "Hasil penerimaan barang tidak ditemukan.",
    };
  }

  const goodsReceiptId =
    toSafeNumber(
      result.goods_receipt_id,
    );

  const resultPurchaseOrderId =
    toSafeNumber(
      result.purchase_order_id,
    );

  revalidatePath(
    "/goods-receipts",
  );

  revalidatePath(
    `/goods-receipts/${goodsReceiptId}`,
  );

  revalidatePath(
    "/purchase-orders",
  );

  revalidatePath(
    `/purchase-orders/${resultPurchaseOrderId}`,
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
      `Penerimaan barang ${result.receipt_number} berhasil disimpan.`,

    data: {
      goodsReceiptId,

      receiptNumber:
        result.receipt_number,

      purchaseOrderId:
        resultPurchaseOrderId,

      purchaseOrderStatus:
        result.purchase_order_status ===
        "completed"
          ? "completed"
          : "partial_received",

      totalQuantityReceived:
        toSafeNumber(
          result.total_quantity_received,
        ),

      totalAmount:
        toSafeNumber(
          result.total_amount,
        ),
    },
  };
}
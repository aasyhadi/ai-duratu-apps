import type {
  GoodsReceiptDetail,
  GoodsReceiptItem,
  GoodsReceiptStatus,
} from "@/features/goods-receipts/types/goods-receipt";

import {
  toSafeNumber,
} from "@/features/shared/utils/number";

import {
  createClient,
} from "@/lib/supabase/server";

type GoodsReceiptDetailRow = {
  id: number | string;
  receipt_number: string;

  purchase_order_id:
    | number
    | string;

  supplier_id:
    | number
    | string;

  status: GoodsReceiptStatus;

  receipt_date: string;

  reference_number:
    | string
    | null;

  notes:
    | string
    | null;

  total_items:
    | number
    | string;

  total_quantity:
    | number
    | string;

  total_amount:
    | number
    | string;

  posted_at:
    | string
    | null;

  cancelled_at:
    | string
    | null;

  cancellation_reason:
    | string
    | null;

  created_at: string;
  updated_at: string;

  purchase_orders:
    | {
        order_number:
          | string
          | null;
      }
    | {
        order_number:
          | string
          | null;
      }[]
    | null;

  suppliers:
    | {
        name:
          | string
          | null;
      }
    | {
        name:
          | string
          | null;
      }[]
    | null;
};

type GoodsReceiptItemRow = {
  id: number | string;

  goods_receipt_id:
    | number
    | string;

  purchase_order_item_id:
    | number
    | string;

  product_id:
    | number
    | string;

  quantity_received:
    | number
    | string;

  unit_cost:
    | number
    | string;

  subtotal:
    | number
    | string;

  notes:
    | string
    | null;

  products:
    | {
        name:
          | string
          | null;

        sku:
          | string
          | null;

        unit:
          | string
          | null;
      }
    | {
        name:
          | string
          | null;

        sku:
          | string
          | null;

        unit:
          | string
          | null;
      }[]
    | null;
};

function getFirstRelation<T>(
  value:
    | T
    | T[]
    | null,
): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value)
    ? value[0] ?? null
    : value;
}

function mapGoodsReceiptItem(
  row: GoodsReceiptItemRow,
): GoodsReceiptItem {
  const product =
    getFirstRelation(
      row.products,
    );

  return {
    id:
      toSafeNumber(
        row.id,
      ),

    goodsReceiptId:
      toSafeNumber(
        row.goods_receipt_id,
      ),

    purchaseOrderItemId:
      toSafeNumber(
        row.purchase_order_item_id,
      ),

    productId:
      toSafeNumber(
        row.product_id,
      ),

    productName:
      product?.name ??
      "-",

    productSku:
      product?.sku ??
      null,

    productUnit:
      product?.unit ??
      "unit",

    quantityReceived:
      toSafeNumber(
        row.quantity_received,
      ),

    unitCost:
      toSafeNumber(
        row.unit_cost,
      ),

    totalCost:
      toSafeNumber(
        row.subtotal,
      ),

    notes:
      row.notes,
  };
}

export async function getGoodsReceipt(
  goodsReceiptId: number,
): Promise<GoodsReceiptDetail | null> {
  if (
    !Number.isInteger(
      goodsReceiptId,
    ) ||
    goodsReceiptId < 1
  ) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data: receiptData,
    error: receiptError,
  } = await supabase
    .from(
      "goods_receipts",
    )
    .select(
      `
        id,
        receipt_number,
        purchase_order_id,
        supplier_id,
        status,
        receipt_date,
        reference_number,
        notes,
        total_items,
        total_quantity,
        total_amount,
        posted_at,
        cancelled_at,
        cancellation_reason,
        created_at,
        updated_at,
        purchase_orders (
          order_number
        ),
        suppliers (
          name
        )
      `,
    )
    .eq(
      "id",
      goodsReceiptId,
    )
    .maybeSingle();

  if (receiptError) {
    console.error(
      "Get goods receipt failed:",
      receiptError,
    );

    throw new Error(
      "Detail penerimaan barang gagal dimuat.",
    );
  }

  if (!receiptData) {
    return null;
  }

  const {
    data: itemsData,
    error: itemsError,
  } = await supabase
    .from(
      "goods_receipt_items",
    )
    .select(
      `
        id,
        goods_receipt_id,
        purchase_order_item_id,
        product_id,
        quantity_received,
        unit_cost,
        subtotal,
        notes,
        products (
          name,
          sku,
          unit
        )
      `,
    )
    .eq(
      "goods_receipt_id",
      goodsReceiptId,
    )
    .order(
      "id",
      {
        ascending: true,
      },
    );

  if (itemsError) {
    console.error(
      "Get goods receipt items failed:",
      itemsError,
    );

    throw new Error(
      "Item penerimaan barang gagal dimuat.",
    );
  }

  const receiptRow =
    receiptData as GoodsReceiptDetailRow;

  const purchaseOrder =
    getFirstRelation(
      receiptRow.purchase_orders,
    );

  const supplier =
    getFirstRelation(
      receiptRow.suppliers,
    );

  return {
    receipt: {
      id:
        toSafeNumber(
          receiptRow.id,
        ),

      receiptNumber:
        receiptRow.receipt_number,

      purchaseOrderId:
        toSafeNumber(
          receiptRow.purchase_order_id,
        ),

      purchaseOrderNumber:
        purchaseOrder
          ?.order_number ??
        "-",

      supplierId:
        toSafeNumber(
          receiptRow.supplier_id,
        ),

      supplierName:
        supplier?.name ??
        "-",

      status:
        receiptRow.status,

      receiptDate:
        receiptRow.receipt_date,

      referenceNumber:
        receiptRow.reference_number,

      notes:
        receiptRow.notes,

      totalItems:
        toSafeNumber(
          receiptRow.total_items,
        ),

      totalQuantity:
        toSafeNumber(
          receiptRow.total_quantity,
        ),

      totalAmount:
        toSafeNumber(
          receiptRow.total_amount,
        ),

      postedAt:
        receiptRow.posted_at,

      cancelledAt:
        receiptRow.cancelled_at,

      cancellationReason:
        receiptRow.cancellation_reason,

      createdAt:
        receiptRow.created_at,

      updatedAt:
        receiptRow.updated_at,
    },

    items:
      (
        itemsData ??
        []
      ).map(
        (row) =>
          mapGoodsReceiptItem(
            row as GoodsReceiptItemRow,
          ),
      ),
  };
}
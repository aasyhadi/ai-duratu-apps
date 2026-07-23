import {
  normalizePageSize,
  toSafeNumber,
} from "@/features/shared/utils/number";

import type {
  GoodsReceipt,
  GoodsReceiptListResult,
  GoodsReceiptStatus,
} from "@/features/goods-receipts/types/goods-receipt";

import {
  createClient,
} from "@/lib/supabase/server";

type GetGoodsReceiptsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: GoodsReceiptStatus;
};

type GoodsReceiptRow = {
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

function mapGoodsReceipt(
  row: GoodsReceiptRow,
): GoodsReceipt {
  const purchaseOrder =
    getFirstRelation(
      row.purchase_orders,
    );

  const supplier =
    getFirstRelation(
      row.suppliers,
    );

  return {
    id:
      toSafeNumber(
        row.id,
      ),

    receiptNumber:
      row.receipt_number,

    purchaseOrderId:
      toSafeNumber(
        row.purchase_order_id,
      ),

    purchaseOrderNumber:
      purchaseOrder
        ?.order_number ??
      "-",

    supplierId:
      toSafeNumber(
        row.supplier_id,
      ),

    supplierName:
      supplier?.name ??
      "-",

    status:
      row.status,

    receiptDate:
      row.receipt_date,

    referenceNumber:
      row.reference_number,

    notes:
      row.notes,

    totalItems:
      toSafeNumber(
        row.total_items,
      ),

    totalQuantity:
      toSafeNumber(
        row.total_quantity,
      ),

    totalAmount:
      toSafeNumber(
        row.total_amount,
      ),

    postedAt:
      row.posted_at,

    cancelledAt:
      row.cancelled_at,

    cancellationReason:
      row.cancellation_reason,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

export async function getGoodsReceipts({
  page = 1,
  pageSize = 10,
  search = "",
  status,
}: GetGoodsReceiptsParams = {}): Promise<GoodsReceiptListResult> {
  const normalizedPage =
    Number.isInteger(page) &&
    page > 0
      ? page
      : 1;

  const normalizedPageSize =
    normalizePageSize(
      pageSize,
      {
        fallback: 10,
        maximum: 100,
      },
    );

  const from =
    (
      normalizedPage -
      1
    ) *
    normalizedPageSize;

  const to =
    from +
    normalizedPageSize -
    1;

  const supabase =
    await createClient();

  let query =
    supabase
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
        {
          count: "exact",
        },
      )
      .order(
        "receipt_date",
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

  if (status) {
    query =
      query.eq(
        "status",
        status,
      );
  }

  const normalizedSearch =
    search.trim();

  if (normalizedSearch) {
    query =
      query.or(
        [
          `receipt_number.ilike.%${normalizedSearch}%`,
          `reference_number.ilike.%${normalizedSearch}%`,
        ].join(","),
      );
  }

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    console.error(
      "Get goods receipts failed:",
      error,
    );

    throw new Error(
      "Daftar penerimaan barang gagal dimuat.",
    );
  }

  const receipts =
    (
      data ??
      []
    ).map(
      (row) =>
        mapGoodsReceipt(
          row as GoodsReceiptRow,
        ),
    );

  const totalItems =
    count ??
    0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
          normalizedPageSize,
      ),
    );

  return {
    receipts,
    totalItems,
    totalPages,
    currentPage:
      normalizedPage,
    pageSize:
      normalizedPageSize,
  };
}
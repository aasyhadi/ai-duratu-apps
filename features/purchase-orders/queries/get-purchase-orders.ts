import type {
  PurchaseOrder,
  PurchaseOrderListResult,
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import type {
  PurchaseRequestStatus,
} from "@/features/purchases/types/purchase-request";

import {
  normalizePageSize,
  normalizePositiveInteger,
  toSafeNumber,
} from "@/features/shared/utils/number";

import {
  createClient,
} from "@/lib/supabase/server";

const DEFAULT_PAGE_SIZE =
  10;

const MAX_PAGE_SIZE =
  100;

export type GetPurchaseOrdersOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  supplierId?: number;
};

type SupplierRelationRow = {
  name: string;
};

type PurchaseRequestRelationRow = {
  request_number: string;
  status: PurchaseRequestStatus;
};

type PurchaseOrderRow = {
  id: number;
  order_number: string;

  purchase_request_id:
    number | null;

  supplier_id: number;
  status: PurchaseOrderStatus;

  order_date: string;

  expected_date:
    string | null;

  notes:
    string | null;

  subtotal:
    number | string;

  discount_amount:
    number | string;

  tax_amount:
    number | string;

  total_amount:
    number | string;

  sent_at:
    string | null;

  confirmed_at:
    string | null;

  completed_at:
    string | null;

  cancelled_at:
    string | null;

  cancellation_reason:
    string | null;

  created_at: string;
  updated_at: string;

  suppliers:
    | SupplierRelationRow
    | SupplierRelationRow[]
    | null;

  purchase_requests:
    | PurchaseRequestRelationRow
    | PurchaseRequestRelationRow[]
    | null;
};

type PurchaseOrderItemSummaryRow = {
  purchase_order_id: number;

  quantity:
    number | string;

  received_quantity:
    number | string;
};

function getRelation<T>(
  value:
    | T
    | T[]
    | null,
): T | null {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      null
    );
  }

  return value;
}

export async function getPurchaseOrders(
  options: GetPurchaseOrdersOptions = {},
): Promise<PurchaseOrderListResult> {
  const page =
    normalizePositiveInteger(
      options.page,
      1,
    );

  const pageSize =
    normalizePageSize(
      options.pageSize,
      {
        fallback:
          DEFAULT_PAGE_SIZE,

        maximum:
          MAX_PAGE_SIZE,
      },
    );

  const search =
    options.search?.trim() ??
    "";

  const from =
    (page - 1) *
    pageSize;

  const to =
    from +
    pageSize -
    1;

  const supabase =
    await createClient();

  let query =
    supabase
      .from(
        "purchase_orders",
      )
      .select(
        `
          id,
          order_number,
          purchase_request_id,
          supplier_id,
          status,
          order_date,
          expected_date,
          notes,
          subtotal,
          discount_amount,
          tax_amount,
          total_amount,
          sent_at,
          confirmed_at,
          completed_at,
          cancelled_at,
          cancellation_reason,
          created_at,
          updated_at,
          suppliers (
            name
          ),
          purchase_requests (
            request_number,
            status
          )
        `,
        {
          count: "exact",
        },
      );

  if (options.status) {
    query =
      query.eq(
        "status",
        options.status,
      );
  }

  if (
    options.supplierId &&
    Number.isInteger(
      options.supplierId,
    ) &&
    options.supplierId >
      0
  ) {
    query =
      query.eq(
        "supplier_id",
        options.supplierId,
      );
  }

  if (search) {
    const normalizedSearch =
      search.replaceAll(
        ",",
        " ",
      );

    query =
      query.or(
        [
          `order_number.ilike.%${normalizedSearch}%`,
          `notes.ilike.%${normalizedSearch}%`,
        ].join(","),
      );
  }

  const {
    data,
    count,
    error,
  } = await query
    .order(
      "created_at",
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
      "Get purchase orders failed:",
      error,
    );

    throw new Error(
      "Daftar Purchase Order gagal diambil.",
    );
  }

  const orderRows =
    (
      data ??
      []
    ) as PurchaseOrderRow[];

  const purchaseOrderIds =
    orderRows.map(
      ({
        id,
      }) => id,
    );

  let itemSummaryRows:
    PurchaseOrderItemSummaryRow[] =
      [];

  if (
    purchaseOrderIds.length >
    0
  ) {
    const {
      data: itemSummaryData,
      error:
        itemSummaryError,
    } = await supabase
      .from(
        "purchase_order_items",
      )
      .select(
        `
          purchase_order_id,
          quantity,
          received_quantity
        `,
      )
      .in(
        "purchase_order_id",
        purchaseOrderIds,
      );

    if (itemSummaryError) {
      console.error(
        "Get purchase order item summaries failed:",
        itemSummaryError,
      );

      throw new Error(
        "Ringkasan item Purchase Order gagal diambil.",
      );
    }

    itemSummaryRows =
      (
        itemSummaryData ??
        []
      ) as PurchaseOrderItemSummaryRow[];
  }

  const summaryByOrderId =
    new Map<
      number,
      {
        totalItems: number;
        totalOrderedQuantity: number;
        totalReceivedQuantity: number;
      }
    >();

  for (
    const row
    of itemSummaryRows
  ) {
    const current =
      summaryByOrderId.get(
        row.purchase_order_id,
      ) ?? {
        totalItems: 0,
        totalOrderedQuantity: 0,
        totalReceivedQuantity: 0,
      };

    current.totalItems +=
      1;

    current.totalOrderedQuantity +=
      toSafeNumber(
        row.quantity,
      );

    current.totalReceivedQuantity +=
      toSafeNumber(
        row.received_quantity,
      );

    summaryByOrderId.set(
      row.purchase_order_id,
      current,
    );
  }

  const orders =
    orderRows.map(
      (
        row,
      ): PurchaseOrder => {
        const supplier =
          getRelation(
            row.suppliers,
          );

        const purchaseRequest =
          getRelation(
            row.purchase_requests,
          );

        const summary =
          summaryByOrderId.get(
            row.id,
          ) ?? {
            totalItems: 0,
            totalOrderedQuantity: 0,
            totalReceivedQuantity: 0,
          };

        return {
          id:
            row.id,

          orderNumber:
            row.order_number,

          purchaseRequestId:
            row.purchase_request_id,

          purchaseRequestNumber:
            purchaseRequest?.request_number ??
            null,

          purchaseRequestStatus:
            purchaseRequest?.status ??
            null,

          supplierId:
            row.supplier_id,

          supplierName:
            supplier?.name ??
            "Supplier tidak ditemukan",

          status:
            row.status,

          orderDate:
            row.order_date,

          expectedDate:
            row.expected_date,

          notes:
            row.notes,

          subtotal:
            toSafeNumber(
              row.subtotal,
            ),

          discountAmount:
            toSafeNumber(
              row.discount_amount,
            ),

          taxAmount:
            toSafeNumber(
              row.tax_amount,
            ),

          totalAmount:
            toSafeNumber(
              row.total_amount,
            ),

          totalItems:
            summary.totalItems,

          totalOrderedQuantity:
            summary.totalOrderedQuantity,

          totalReceivedQuantity:
            summary.totalReceivedQuantity,

          sentAt:
            row.sent_at,

          confirmedAt:
            row.confirmed_at,

          completedAt:
            row.completed_at,

          cancelledAt:
            row.cancelled_at,

          cancellationReason:
            row.cancellation_reason,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,
        };
      },
    );

  const totalItems =
    count ??
    0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
        pageSize,
      ),
    );

  return {
    orders,
    totalItems,
    totalPages,
    currentPage:
      page,
    pageSize,
  };
}
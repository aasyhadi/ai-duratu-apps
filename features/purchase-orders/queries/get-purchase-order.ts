import type {
  PurchaseOrderDetail,
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import type {
  PurchaseRequestStatus,
} from "@/features/purchases/types/purchase-request";

import {
  toSafeNumber,
} from "@/features/shared/utils/number";

import {
  createClient,
} from "@/lib/supabase/server";

type SupplierRelationRow = {
  name: string;
};

type PurchaseRequestRelationRow = {
  request_number: string;
  status: PurchaseRequestStatus;
};

type ProductRelationRow = {
  name: string;
  sku: string | null;
  unit: string;
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

type PurchaseOrderItemRow = {
  id: number;
  purchase_order_id: number;
  product_id: number;

  quantity:
    number | string;

  received_quantity:
    number | string;

  unit_cost:
    number | string;

  subtotal:
    number | string;

  notes:
    string | null;

  products:
    | ProductRelationRow
    | ProductRelationRow[]
    | null;
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

export async function getPurchaseOrder(
  purchaseOrderId: number,
): Promise<PurchaseOrderDetail | null> {
  if (
    !Number.isInteger(
      purchaseOrderId,
    ) ||
    purchaseOrderId < 1
  ) {
    return null;
  }

  const supabase =
    await createClient();

  const [
    orderResult,
    itemResult,
  ] = await Promise.all([
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
      )
      .eq(
        "id",
        purchaseOrderId,
      )
      .maybeSingle(),

    supabase
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
        "purchase_order_id",
        purchaseOrderId,
      )
      .order(
        "id",
        {
          ascending: true,
        },
      ),
  ]);

  if (orderResult.error) {
    console.error(
      "Get purchase order failed:",
      orderResult.error,
    );

    throw new Error(
      "Purchase Order gagal diambil.",
    );
  }

  if (itemResult.error) {
    console.error(
      "Get purchase order items failed:",
      itemResult.error,
    );

    throw new Error(
      "Item Purchase Order gagal diambil.",
    );
  }

  if (!orderResult.data) {
    return null;
  }

  const orderRow =
    orderResult.data as PurchaseOrderRow;

  const itemRows =
    (
      itemResult.data ??
      []
    ) as PurchaseOrderItemRow[];

  const supplier =
    getRelation(
      orderRow.suppliers,
    );

  const purchaseRequest =
    getRelation(
      orderRow.purchase_requests,
    );

  const items =
    itemRows.map(
      (
        row,
      ): PurchaseOrderDetail["items"][number] => {
        const product =
          getRelation(
            row.products,
          );

        const quantity =
          toSafeNumber(
            row.quantity,
          );

        const receivedQuantity =
          toSafeNumber(
            row.received_quantity,
          );

        return {
          id:
            row.id,

          purchaseOrderId:
            row.purchase_order_id,

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

          quantity,

          receivedQuantity,

          remainingQuantity:
            Math.max(
              0,
              quantity -
                receivedQuantity,
            ),

          unitCost:
            toSafeNumber(
              row.unit_cost,
            ),

          subtotal:
            toSafeNumber(
              row.subtotal,
            ),

          notes:
            row.notes,
        };
      },
    );

  return {
    order: {
      id:
        orderRow.id,

      orderNumber:
        orderRow.order_number,

      purchaseRequestId:
        orderRow.purchase_request_id,

      purchaseRequestNumber:
        purchaseRequest?.request_number ??
        null,

      purchaseRequestStatus:
        purchaseRequest?.status ??
        null,

      supplierId:
        orderRow.supplier_id,

      supplierName:
        supplier?.name ??
        "Supplier tidak ditemukan",

      status:
        orderRow.status,

      orderDate:
        orderRow.order_date,

      expectedDate:
        orderRow.expected_date,

      notes:
        orderRow.notes,

      subtotal:
        toSafeNumber(
          orderRow.subtotal,
        ),

      discountAmount:
        toSafeNumber(
          orderRow.discount_amount,
        ),

      taxAmount:
        toSafeNumber(
          orderRow.tax_amount,
        ),

      totalAmount:
        toSafeNumber(
          orderRow.total_amount,
        ),

      totalItems:
        items.length,

      totalOrderedQuantity:
        items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity,
          0,
        ),

      totalReceivedQuantity:
        items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.receivedQuantity,
          0,
        ),

      sentAt:
        orderRow.sent_at,

      confirmedAt:
        orderRow.confirmed_at,

      completedAt:
        orderRow.completed_at,

      cancelledAt:
        orderRow.cancelled_at,

      cancellationReason:
        orderRow.cancellation_reason,

      createdAt:
        orderRow.created_at,

      updatedAt:
        orderRow.updated_at,
    },

    items,
  };
}
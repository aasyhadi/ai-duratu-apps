import { createClient } from "@/lib/supabase/server";

import type {
  PurchaseRequestDetail,
  PurchaseRequestStatus,
} from "@/features/purchases/types/purchase-request";

import { toSafeNumber } from "@/features/shared/utils/number";

type SupplierRelationRow = {
  name: string;
};

type ProductRelationRow = {
  name: string;
  sku: string | null;
  unit: string;
};

type PurchaseRequestRow = {
  id: number;
  request_number: string;
  supplier_id: number | null;
  status: PurchaseRequestStatus;
  request_date: string;
  expected_date: string | null;
  notes: string | null;
  estimated_total: number | string;
  rejection_reason: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  suppliers:
    | SupplierRelationRow
    | SupplierRelationRow[]
    | null;
};

type PurchaseRequestItemRow = {
  id: number;
  product_id: number;
  quantity: number | string;
  unit_cost: number | string;
  subtotal: number | string;
  notes: string | null;
  products:
    | ProductRelationRow
    | ProductRelationRow[]
    | null;
};

function getRelation<T>(
  value: T | T[] | null,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export async function getPurchaseRequest(
  requestId: number,
): Promise<PurchaseRequestDetail | null> {
  if (
    !Number.isInteger(requestId) ||
    requestId < 1
  ) {
    return null;
  }

  const supabase =
    await createClient();

  const [
    requestResult,
    itemResult,
  ] = await Promise.all([
    supabase
      .from("purchase_requests")
      .select(
        `
          id,
          request_number,
          supplier_id,
          status,
          request_date,
          expected_date,
          notes,
          estimated_total,
          rejection_reason,
          rejected_at,
          created_at,
          updated_at,
          suppliers (
            name
          )
        `,
      )
      .eq(
        "id",
        requestId,
      )
      .maybeSingle(),

    supabase
      .from(
        "purchase_request_items",
      )
      .select(
        `
          id,
          product_id,
          quantity,
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
        "purchase_request_id",
        requestId,
      )
      .order(
        "id",
        {
          ascending: true,
        },
      ),
  ]);

  if (requestResult.error) {
    console.error(
      "Get purchase request failed:",
      requestResult.error,
    );

    throw new Error(
      "Draft pembelian gagal diambil.",
    );
  }

  if (itemResult.error) {
    console.error(
      "Get purchase request items failed:",
      itemResult.error,
    );

    throw new Error(
      "Item draft pembelian gagal diambil.",
    );
  }

  if (!requestResult.data) {
    return null;
  }

  const requestRow =
    requestResult.data as PurchaseRequestRow;

  const supplier =
    getRelation(
      requestRow.suppliers,
    );

  const itemRows =
    (itemResult.data ??
      []) as PurchaseRequestItemRow[];

  return {
    request: {
      id:
        requestRow.id,

      requestNumber:
        requestRow.request_number,

      supplierId:
        requestRow.supplier_id,

      supplierName:
        supplier?.name ??
        null,

      status:
        requestRow.status,

      requestDate:
        requestRow.request_date,

      expectedDate:
        requestRow.expected_date,

      notes:
        requestRow.notes,

      estimatedTotal:
        toSafeNumber(
          requestRow.estimated_total,
        ),

      totalItems:
        itemRows.length,

      rejectionReason:
        requestRow.rejection_reason,

      rejectedAt:
        requestRow.rejected_at,

      createdAt:
        requestRow.created_at,

      updatedAt:
        requestRow.updated_at,
    },

    items:
      itemRows.map(
        (
          row,
        ): PurchaseRequestDetail["items"][number] => {
          const product =
            getRelation(
              row.products,
            );

          return {
            id:
              row.id,

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

            quantity:
              toSafeNumber(
                row.quantity,
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
      ),
  };
}
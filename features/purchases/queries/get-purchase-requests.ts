import { createClient } from "@/lib/supabase/server";

import type {
  PurchaseRequest,
  PurchaseRequestListResult,
  PurchaseRequestStatus,
} from "@/features/purchases/types/purchase-request";

import {
  normalizePageSize,
  normalizePositiveInteger,
  toSafeNumber,
} from "@/features/shared/utils/number";

const DEFAULT_PURCHASE_REQUEST_PAGE_SIZE =
  10;

const MAX_PURCHASE_REQUEST_PAGE_SIZE =
  100;

type SupplierRelationRow = {
  name: string;
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
  created_at: string;
  updated_at: string;
  suppliers:
    | SupplierRelationRow
    | SupplierRelationRow[]
    | null;
  rejection_reason: string | null;
  rejected_at: string | null;
};

type PurchaseRequestItemCountRow = {
  purchase_request_id: number;
};

export type GetPurchaseRequestsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PurchaseRequestStatus | null;
  supplierId?: number | null;
};

function getRelation<T>(
  value: T | T[] | null,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeSearch(
  value: string | undefined,
): string {
  return value?.trim() ?? "";
}

function sanitizeSearchTerm(
  value: string,
): string {
  return value
    .replaceAll(",", " ")
    .replaceAll("%", "")
    .replaceAll("_", "")
    .trim();
}

export async function getPurchaseRequests(
  options: GetPurchaseRequestsOptions = {},
): Promise<PurchaseRequestListResult> {
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
          DEFAULT_PURCHASE_REQUEST_PAGE_SIZE,

        maximum:
          MAX_PURCHASE_REQUEST_PAGE_SIZE,
      },
    );

  const search =
    sanitizeSearchTerm(
      normalizeSearch(
        options.search,
      ),
    );

  const status =
    options.status ?? null;

  const supplierId =
    options.supplierId ?? null;

  const supabase =
    await createClient();

  let countQuery =
    supabase
      .from("purchase_requests")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      );

  if (search) {
    countQuery =
      countQuery.or(
        [
          `request_number.ilike.%${search}%`,
          `notes.ilike.%${search}%`,
        ].join(","),
      );
  }

  if (status) {
    countQuery =
      countQuery.eq(
        "status",
        status,
      );
  }

  if (
    supplierId !== null
  ) {
    countQuery =
      countQuery.eq(
        "supplier_id",
        supplierId,
      );
  }

  const {
    count,
    error: countError,
  } = await countQuery;

  if (countError) {
    console.error(
      "Count purchase requests failed:",
      countError,
    );

    throw new Error(
      "Jumlah draft pembelian gagal dihitung.",
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

  let requestQuery =
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
          created_at,
          updated_at,
          suppliers (
            name
          ),
          rejection_reason,
          rejected_at
        `,
      );

  if (search) {
    requestQuery =
      requestQuery.or(
        [
          `request_number.ilike.%${search}%`,
          `notes.ilike.%${search}%`,
        ].join(","),
      );
  }

  if (status) {
    requestQuery =
      requestQuery.eq(
        "status",
        status,
      );
  }

  if (
    supplierId !== null
  ) {
    requestQuery =
      requestQuery.eq(
        "supplier_id",
        supplierId,
      );
  }

  const {
    data: requestData,
    error: requestError,
  } = await requestQuery
    .order(
      "request_date",
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

  if (requestError) {
    console.error(
      "Get purchase requests failed:",
      requestError,
    );

    throw new Error(
      "Daftar draft pembelian gagal diambil.",
    );
  }

  const requestRows =
    (requestData ??
      []) as PurchaseRequestRow[];

  if (
    requestRows.length === 0
  ) {
    return {
      requests: [],
      totalItems,
      totalPages,
      currentPage,
      pageSize,
    };
  }

  const requestIds =
    requestRows.map(
      (row) => row.id,
    );

  const {
    data: itemData,
    error: itemError,
  } = await supabase
    .from(
      "purchase_request_items",
    )
    .select(
      "purchase_request_id",
    )
    .in(
      "purchase_request_id",
      requestIds,
    );

  if (itemError) {
    console.error(
      "Get purchase request item counts failed:",
      itemError,
    );

    throw new Error(
      "Jumlah item draft pembelian gagal diambil.",
    );
  }

  const itemRows =
    (itemData ??
      []) as PurchaseRequestItemCountRow[];

  const itemCountByRequestId =
    new Map<number, number>();

  for (
    const itemRow of itemRows
  ) {
    const requestId =
      itemRow.purchase_request_id;

    itemCountByRequestId.set(
      requestId,
      (
        itemCountByRequestId.get(
          requestId,
        ) ?? 0
      ) + 1,
    );
  }

  const requests =
    requestRows.map(
      (
        row,
      ): PurchaseRequest => {
        const supplier =
          getRelation(
            row.suppliers,
          );

        return {
          id: row.id,

          requestNumber:
            row.request_number,

          supplierId:
            row.supplier_id,

          supplierName:
            supplier?.name ??
            null,

          status:
            row.status,

          requestDate:
            row.request_date,

          expectedDate:
            row.expected_date,

          notes:
            row.notes,

          estimatedTotal:
            toSafeNumber(
              row.estimated_total,
            ),

          totalItems:
            itemCountByRequestId.get(
              row.id,
            ) ?? 0,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,

          rejectionReason:
            row.rejection_reason,

          rejectedAt:
            row.rejected_at,
        };
      },
    );

  return {
    requests,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
  };
}
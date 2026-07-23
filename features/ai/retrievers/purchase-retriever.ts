import {
  getPurchaseOrders,
} from "@/features/purchase-orders/queries/get-purchase-orders";

import type {
  PurchaseOrder,
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import type {
  PurchaseKnowledgeContext,
  PurchaseKnowledgeOrder,
  PurchaseQueryAnalysis,
} from "@/features/ai/types/purchase-knowledge";

const PAGE_SIZE =
  100;

const OPEN_STATUSES:
  PurchaseOrderStatus[] = [
    "draft",
    "sent",
    "confirmed",
    "partial_received",
  ];

function mapOrder(
  order: PurchaseOrder,
): PurchaseKnowledgeOrder {
  return {
    id:
      order.id,

    orderNumber:
      order.orderNumber,

    supplierId:
      order.supplierId,

    supplierName:
      order.supplierName,

    status:
      order.status,

    orderDate:
      order.orderDate,

    expectedDate:
      order.expectedDate,

    totalAmount:
      order.totalAmount,

    totalItems:
      order.totalItems,

    totalOrderedQuantity:
      order.totalOrderedQuantity,

    totalReceivedQuantity:
      order.totalReceivedQuantity,
  };
}

function countStatus(
  orders: PurchaseOrder[],
  status: PurchaseOrderStatus,
): number {
  return orders.filter(
    (order) =>
      order.status ===
      status,
  ).length;
}

function isOpenStatus(
  status: PurchaseOrderStatus,
): boolean {
  return OPEN_STATUSES.includes(
    status,
  );
}

function normalizeSearch(
  value: string,
): string {
  return value
    .toLocaleLowerCase(
      "id-ID",
    )
    .normalize("NFKD")
    .trim();
}

export async function retrievePurchaseKnowledge(
  queryAnalysis: PurchaseQueryAnalysis,
): Promise<PurchaseKnowledgeContext> {
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Purchase AI query:",
      {
        kind:
          queryAnalysis.kind,

        status:
          queryAnalysis.status,

        searchTerm:
          queryAnalysis.searchTerm,

        matchedKeywords:
          queryAnalysis.matchedKeywords,
      },
    );
  }

  /**
   * Untuk tahap awal AI Purchase
   * kita menggunakan query bisnis
   * yang sudah tersedia.
   *
   * Maksimum 100 PO.
   *
   * Nanti jika data sudah besar,
   * agregasi dapat dipindahkan
   * langsung ke database.
   */
  const allResult =
    await getPurchaseOrders({
      page:
        1,

      pageSize:
        PAGE_SIZE,
    });

  const allOrders =
    allResult.orders;

  const summary = {
    totalOrders:
      allResult.totalItems,

    draftOrders:
      countStatus(
        allOrders,
        "draft",
      ),

    sentOrders:
      countStatus(
        allOrders,
        "sent",
      ),

    confirmedOrders:
      countStatus(
        allOrders,
        "confirmed",
      ),

    partialReceivedOrders:
      countStatus(
        allOrders,
        "partial_received",
      ),

    completedOrders:
      countStatus(
        allOrders,
        "completed",
      ),

    cancelledOrders:
      countStatus(
        allOrders,
        "cancelled",
      ),

    totalOrderValue:
      allOrders.reduce(
        (
          total,
          order,
        ) =>
          total +
          order.totalAmount,
        0,
      ),
  };

  let selectedOrders =
    [...allOrders];

  /**
   * PO yang masih berjalan.
   *
   * Tidak termasuk:
   * completed
   * cancelled
   */
  if (
    queryAnalysis.kind ===
    "open"
  ) {
    selectedOrders =
      selectedOrders.filter(
        (order) =>
          isOpenStatus(
            order.status,
          ),
      );
  }

  /**
   * Filter satu status tertentu.
   */
  if (
    queryAnalysis.kind ===
      "status" &&
    queryAnalysis.status
  ) {
    selectedOrders =
      selectedOrders.filter(
        (order) =>
          order.status ===
          queryAnalysis.status,
      );
  }

  /**
   * PO terbaru.
   */
  if (
    queryAnalysis.kind ===
    "latest"
  ) {
    selectedOrders =
      selectedOrders
        .sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.createdAt,
            ).getTime() -
            new Date(
              first.createdAt,
            ).getTime(),
        )
        .slice(
          0,
          5,
        );
  }

  /**
   * PO berdasarkan nilai terbesar.
   */
  if (
    queryAnalysis.kind ===
    "largest"
  ) {
    selectedOrders =
      selectedOrders
        .sort(
          (
            first,
            second,
          ) =>
            second.totalAmount -
            first.totalAmount,
        )
        .slice(
          0,
          5,
        );
  }

  /**
   * Cari PO tertentu berdasarkan
   * nomor PO.
   */
  if (
    queryAnalysis.kind ===
      "order_detail" &&
    queryAnalysis.searchTerm
  ) {
    const search =
      normalizeSearch(
        queryAnalysis.searchTerm,
      );

    selectedOrders =
      selectedOrders.filter(
        (order) =>
          normalizeSearch(
            order.orderNumber,
          ).includes(
            search,
          ),
      );
  }

  /**
   * Summary cukup membawa beberapa
   * PO terbaru supaya context tidak
   * terlalu besar.
   */
  if (
    queryAnalysis.kind ===
    "summary"
  ) {
    selectedOrders =
      selectedOrders
        .sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.createdAt,
            ).getTime() -
            new Date(
              first.createdAt,
            ).getTime(),
        )
        .slice(
          0,
          10,
        );
  }

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Purchase AI result:",
      {
        totalOrders:
          summary.totalOrders,

        selectedCount:
          selectedOrders.length,

        kind:
          queryAnalysis.kind,

        orders:
          selectedOrders.map(
            (order) => ({
              orderNumber:
                order.orderNumber,

              supplier:
                order.supplierName,

              status:
                order.status,

              totalAmount:
                order.totalAmount,
            }),
          ),
      },
    );
  }

  return {
    query:
      queryAnalysis,

    summary,

    orders:
      selectedOrders.map(
        mapOrder,
      ),

    retrievedAt:
      new Date().toISOString(),
  };
}
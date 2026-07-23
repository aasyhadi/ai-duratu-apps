import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

export type PurchaseQueryKind =
  | "summary"
  | "latest"
  | "largest"
  | "open"
  | "status"
  | "order_detail";

export type PurchaseQueryAnalysis = {
  kind: PurchaseQueryKind;

  status: PurchaseOrderStatus | null;

  searchTerm: string | null;

  matchedKeywords: string[];
};

export type PurchaseKnowledgeOrder = {
  id: number;

  orderNumber: string;

  supplierId: number;

  supplierName: string;

  status: PurchaseOrderStatus;

  orderDate: string;

  expectedDate: string | null;

  totalAmount: number;

  totalItems: number;

  totalOrderedQuantity: number;

  totalReceivedQuantity: number;
};

export type PurchaseKnowledgeSummary = {
  totalOrders: number;

  draftOrders: number;

  sentOrders: number;

  confirmedOrders: number;

  partialReceivedOrders: number;

  completedOrders: number;

  cancelledOrders: number;

  totalOrderValue: number;
};

export type PurchaseKnowledgeContext = {
  query: PurchaseQueryAnalysis;

  summary: PurchaseKnowledgeSummary;

  orders: PurchaseKnowledgeOrder[];

  retrievedAt: string;
};
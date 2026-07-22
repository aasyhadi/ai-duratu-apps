import type {
  PurchaseRequestStatus,
} from "@/features/purchases/types/purchase-request";

export type PurchaseOrderStatus =
  | "draft"
  | "sent"
  | "confirmed"
  | "partial_received"
  | "completed"
  | "cancelled";

export type PurchaseOrderItemInput = {
  productId: number;
  quantity: number;
  unitCost: number;
  notes: string;
};

export type PurchaseOrderDraftInput = {
  purchaseRequestId: number | null;
  supplierId: number;
  orderDate: string;
  expectedDate: string;
  notes: string;
  items: PurchaseOrderItemInput[];
};

export type PurchaseOrderItem = {
  id: number;
  purchaseOrderId: number;

  productId: number;
  productName: string;
  productSku: string | null;
  productUnit: string;

  quantity: number;
  receivedQuantity: number;
  remainingQuantity: number;

  unitCost: number;
  subtotal: number;

  notes: string | null;
};

export type PurchaseOrder = {
  id: number;
  orderNumber: string;

  purchaseRequestId: number | null;
  purchaseRequestNumber: string | null;
  purchaseRequestStatus: PurchaseRequestStatus | null;

  supplierId: number;
  supplierName: string;

  status: PurchaseOrderStatus;

  orderDate: string;
  expectedDate: string | null;

  notes: string | null;

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  totalItems: number;
  totalOrderedQuantity: number;
  totalReceivedQuantity: number;

  sentAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;

  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrderDetail = {
  order: PurchaseOrder;
  items: PurchaseOrderItem[];
};

export type PurchaseOrderListResult = {
  orders: PurchaseOrder[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type PurchaseOrderSummary = {
  totalOrders: number;
  draftOrders: number;
  sentOrders: number;
  confirmedOrders: number;
  partialReceivedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalOrderValue: number;
  totalOutstandingValue: number;
};

export type PurchaseOrderOption = {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  status: PurchaseOrderStatus;
  expectedDate: string | null;
  totalAmount: number;
  remainingItemCount: number;
};

export type PurchaseOrderReceiptItem = {
  purchaseOrderItemId: number;
  productId: number;
  productName: string;
  productSku: string | null;
  productUnit: string;

  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;

  receiveQuantity: number;
  unitCost: number;
};

export type PurchaseOrderReceiptDraft = {
  purchaseOrderId: number;
  orderNumber: string;

  supplierId: number;
  supplierName: string;

  receiptDate: string;
  referenceNumber: string;
  notes: string;

  items: PurchaseOrderReceiptItem[];
};
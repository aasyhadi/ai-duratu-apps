export type GoodsReceiptStatus =
  | "draft"
  | "posted"
  | "cancelled";

export type GoodsReceiptItemInput = {
  purchaseOrderItemId: number;
  productId: number;
  quantityReceived: number;
  unitCost: number;
  notes: string;
};

export type GoodsReceiptDraftInput = {
  purchaseOrderId: number;
  receiptDate: string;
  referenceNumber: string;
  notes: string;
  items: GoodsReceiptItemInput[];
};

export type GoodsReceiptItem = {
  id: number;
  goodsReceiptId: number;

  purchaseOrderItemId: number;
  productId: number;

  productName: string;
  productSku: string | null;
  productUnit: string;

  quantityReceived: number;
  unitCost: number;
  totalCost: number;

  notes: string | null;
};

export type GoodsReceipt = {
  id: number;
  receiptNumber: string;

  purchaseOrderId: number;
  purchaseOrderNumber: string;

  supplierId: number;
  supplierName: string;

  status: GoodsReceiptStatus;

  receiptDate: string;
  referenceNumber: string | null;
  notes: string | null;

  totalItems: number;
  totalQuantity: number;
  totalAmount: number;

  postedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;

  createdAt: string;
  updatedAt: string;
};

export type GoodsReceiptDetail = {
  receipt: GoodsReceipt;
  items: GoodsReceiptItem[];
};

export type GoodsReceiptListResult = {
  receipts: GoodsReceipt[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type GoodsReceiptCreateResult = {
  goodsReceiptId: number;
  receiptNumber: string;
  purchaseOrderId: number;
  purchaseOrderStatus:
    | "partial_received"
    | "completed";
  totalQuantityReceived: number;
  totalAmount: number;
};
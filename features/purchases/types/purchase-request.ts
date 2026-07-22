export type PurchaseRequestStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "converted"
  | "cancelled";

export type PurchaseRequestItemInput = {
  productId: number;
  quantity: number;
  unitCost: number;
  notes: string;
};

export type PurchaseRequestDraftInput = {
  supplierId: number | null;
  requestDate: string;
  expectedDate: string;
  notes: string;
  items: PurchaseRequestItemInput[];
};

export type PurchaseRequestItem = {
  id: number;
  productId: number;
  productName: string;
  productSku: string | null;
  productUnit: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  notes: string | null;
};

export type PurchaseRequest = {
  id: number;
  requestNumber: string;
  supplierId: number | null;
  supplierName: string | null;
  status: PurchaseRequestStatus;
  requestDate: string;
  expectedDate: string | null;
  notes: string | null;
  estimatedTotal: number;
  totalItems: number;
  rejectionReason: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseRequestDetail = {
  request: PurchaseRequest;
  items: PurchaseRequestItem[];
};

export type PurchaseRequestListResult = {
  requests: PurchaseRequest[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type RestockDraftProduct = {
  id: number;
  sku: string | null;
  name: string;
  unit: string;
  stock: number;
  minimumStock: number;
  costPrice: number;
  recommendedRestockQuantity: number;
};
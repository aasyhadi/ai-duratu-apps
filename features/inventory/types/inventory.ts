export type InventoryMovementType =
  | "initial_stock"
  | "purchase"
  | "sale"
  | "adjustment_in"
  | "adjustment_out"
  | "return_in"
  | "return_out"
  | "damaged"
  | "expired";

export type InventoryMovementDirection =
  | "in"
  | "out";

export type InventoryMovement = {
  id: number;
  productId: number;
  productName: string;
  productSku: string | null;
  productUnit: string;
  supplierId: number | null;
  saleId: number | null;
  movementType: InventoryMovementType;
  direction: InventoryMovementDirection;
  quantity: number;
  signedQuantity: number;
  unitCost: number | null;
  totalCost: number | null;
  referenceNumber: string | null;
  notes: string | null;
  movementDate: string;
  createdAt: string;
};

export type InventorySummary = {
  trackedProducts: number;
  activeTrackedProducts: number;
  totalStockQuantity: number;
  inventoryCostValue: number;
  inventorySellingValue: number;
  potentialGrossProfit: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  movementsToday: number;
};

export type InventoryMovementListResult = {
  movements: InventoryMovement[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type InventoryMovementFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  movementType?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type InventoryAdjustmentProduct = {
  id: number;
  sku: string | null;
  name: string;
  unit: string;
  stock: number;
  minimumStock: number;
  costPrice: number;
  isActive: boolean;
};

export type InventoryAdjustmentResult = {
  productId: number;
  previousStock: number;
  physicalStock: number;
  stockDifference: number;
  movementId: number;
};

export type InventoryStockCardProduct = {
  id: number;
  sku: string | null;
  name: string;
  categoryName: string | null;
  unit: string;
  stock: number;
  minimumStock: number;
  costPrice: number;
  sellingPrice: number;
  trackStock: boolean;
  isActive: boolean;
  inventoryCostValue: number;
  inventorySellingValue: number;
};

export type InventoryStockCardEntry = {
  id: number;
  movementType: InventoryMovementType;
  direction: InventoryMovementDirection;
  quantity: number;
  signedQuantity: number;
  balanceAfter: number;
  unitCost: number | null;
  totalCost: number | null;
  referenceNumber: string | null;
  notes: string | null;
  movementDate: string;
};

export type InventoryStockCardResult = {
  product: InventoryStockCardProduct;
  entries: InventoryStockCardEntry[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type InventoryLowStockStatus =
  | "low_stock"
  | "out_of_stock";

export type InventoryLowStockProduct = {
  id: number;
  sku: string | null;
  name: string;
  categoryName: string | null;
  unit: string;
  stock: number;
  minimumStock: number;
  costPrice: number;
  sellingPrice: number;
  stockStatus: InventoryLowStockStatus;
  shortageQuantity: number;
  recommendedRestockQuantity: number;
  estimatedRestockCost: number;
};

export type InventoryLowStockSummary = {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalRecommendedQuantity: number;
  estimatedRestockCost: number;
};

export type InventoryLowStockResult = {
  products: InventoryLowStockProduct[];
  summary: InventoryLowStockSummary;
};
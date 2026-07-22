export type ProductStockStatus =
  | "available"
  | "low_stock"
  | "out_of_stock"
  | "not_tracked";

export type ProductCategory = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  sku: string | null;
  name: string;
  categoryName: string | null;
  categoryId: number | null;
  description: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  trackStock: boolean;
  isActive: boolean;
  inventoryCostValue: number;
  inventorySellingValue: number;
  grossMarginPerUnit: number;
  grossMarginPercentage: number;
  stockStatus: ProductStockStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductSummary = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryCostValue: number;
  inventorySellingValue: number;
  potentialGrossProfit: number;
};

export type ProductListResult = {
  products: Product[];
  summary: ProductSummary;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};
export type InventoryQueryKind =
  | "summary"
  | "low_stock"
  | "out_of_stock"
  | "product_stock";

export type InventoryQueryAnalysis = {
  kind: InventoryQueryKind;
  searchTerm: string | null;
  matchedKeywords: string[];
};

export type InventoryKnowledgeProduct = {
  id: number;
  sku: string | null;
  name: string;
  categoryName: string | null;
  unit: string;
  stock: number;
  minimumStock: number;
  costPrice: number;
  sellingPrice: number;
  stockStatus:
    | "available"
    | "low_stock"
    | "out_of_stock";
};

export type InventoryKnowledgeSummary = {
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

export type InventoryKnowledgeContext = {
  query: InventoryQueryAnalysis;

  summary: InventoryKnowledgeSummary;

  products: InventoryKnowledgeProduct[];

  retrievedAt: string;
};
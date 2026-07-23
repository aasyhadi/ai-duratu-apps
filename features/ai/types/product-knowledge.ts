export type ProductQueryKind =
  | "summary"
  | "active"
  | "inactive"
  | "product_detail"
  | "category";

export type ProductQueryAnalysis = {
  kind: ProductQueryKind;

  searchTerm: string | null;

  categoryTerm: string | null;

  matchedKeywords: string[];
};

export type ProductKnowledgeItem = {
  id: number;

  sku: string | null;

  name: string;

  categoryName: string | null;

  description: string | null;

  unit: string;

  costPrice: number;

  sellingPrice: number;

  grossMarginPerUnit: number;

  grossMarginPercentage: number;

  isActive: boolean;
};

export type ProductKnowledgeSummary = {
  totalProducts: number;

  activeProducts: number;

  inactiveProducts: number;
};

export type ProductKnowledgeContext = {
  query: ProductQueryAnalysis;

  summary: ProductKnowledgeSummary;

  products: ProductKnowledgeItem[];

  retrievedAt: string;
};
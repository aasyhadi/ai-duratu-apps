export type SupplierQueryKind =
  | "summary"
  | "active"
  | "inactive"
  | "supplier_detail";

export type SupplierQueryAnalysis = {
  kind: SupplierQueryKind;

  searchTerm: string | null;

  matchedKeywords: string[];
};

export type SupplierKnowledgeItem = {
  id: number;

  name: string;

  contactPerson: string | null;

  phone: string | null;

  email: string | null;

  address: string | null;

  isActive: boolean;
};

export type SupplierKnowledgeSummary = {
  totalSuppliers: number;

  activeSuppliers: number;

  inactiveSuppliers: number;
};

export type SupplierKnowledgeContext = {
  query: SupplierQueryAnalysis;

  summary: SupplierKnowledgeSummary;

  suppliers: SupplierKnowledgeItem[];

  retrievedAt: string;
};
export type Supplier = {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupplierFormInput = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  isActive: boolean;
};

export type SupplierListResult = {
  suppliers: Supplier[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type SupplierOption = {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
};
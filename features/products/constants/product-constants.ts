import type { ProductStockStatus } from "@/features/products/types/product";

export const DEFAULT_PRODUCT_PAGE_SIZE = 10;

export const MAX_PRODUCT_PAGE_SIZE = 50;

export const PRODUCT_STOCK_STATUSES: ProductStockStatus[] =
  [
    "available",
    "low_stock",
    "out_of_stock",
    "not_tracked",
  ];

export const PRODUCT_STOCK_STATUS_OPTIONS: Array<{
  value: ProductStockStatus;
  label: string;
}> = [
  {
    value: "available",
    label: "Tersedia",
  },
  {
    value: "low_stock",
    label: "Stok Menipis",
  },
  {
    value: "out_of_stock",
    label: "Stok Habis",
  },
  {
    value: "not_tracked",
    label: "Tidak Dilacak",
  },
];

export const PRODUCT_ACTIVE_STATUS_OPTIONS = [
  {
    value: "active",
    label: "Produk Aktif",
  },
  {
    value: "inactive",
    label: "Produk Nonaktif",
  },
] as const;

export const PRODUCT_DEFAULT_VALUES = {
  categoryId: 0,
  sku: "",
  name: "",
  description: "",
  unit: "pcs",
  costPrice: 0,
  sellingPrice: 0,
  stock: 0,
  minimumStock: 0,
  trackStock: true,
  isActive: true,
};
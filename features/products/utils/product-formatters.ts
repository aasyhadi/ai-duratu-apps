import type { ProductStockStatus } from "@/features/products/types/product";

export function formatProductCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(value);
}

export function formatProductQuantity(
  value: number,
): string {
  return value.toLocaleString(
    "id-ID",
    {
      maximumFractionDigits: 3,
    },
  );
}

export function formatProductPercentage(
  value: number,
): string {
  return `${value.toLocaleString(
    "id-ID",
    {
      maximumFractionDigits: 2,
    },
  )}%`;
}

export function getProductStockStatusLabel(
  status: ProductStockStatus,
): string {
  switch (status) {
    case "out_of_stock":
      return "Stok Habis";

    case "low_stock":
      return "Stok Menipis";

    case "not_tracked":
      return "Tidak Dilacak";

    case "available":
    default:
      return "Tersedia";
  }
}

export function getProductStockStatusClassName(
  status: ProductStockStatus,
): string {
  switch (status) {
    case "out_of_stock":
      return [
        "border-destructive/30",
        "bg-destructive/5",
        "text-destructive",
      ].join(" ");

    case "low_stock":
      return [
        "border-orange-300",
        "bg-orange-50",
        "text-orange-700",
        "dark:border-orange-800",
        "dark:bg-orange-950/30",
        "dark:text-orange-300",
      ].join(" ");

    case "not_tracked":
      return [
        "border-muted-foreground/30",
        "bg-muted",
        "text-muted-foreground",
      ].join(" ");

    case "available":
    default:
      return [
        "border-green-300",
        "bg-green-50",
        "text-green-700",
        "dark:border-green-800",
        "dark:bg-green-950/30",
        "dark:text-green-300",
      ].join(" ");
  }
}
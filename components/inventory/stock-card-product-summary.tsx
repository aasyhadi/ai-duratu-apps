import {
  CircleDollarSign,
  Package,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import type { InventoryStockCardProduct } from "@/features/inventory/types/inventory";

import {
  formatInventoryCurrency,
  formatInventoryQuantity,
} from "@/features/inventory/utils/inventory-formatters";

type StockCardProductSummaryProps = {
  product: InventoryStockCardProduct;
};

type SummaryItemProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

function SummaryItem({
  label,
  value,
  description,
  icon,
}: SummaryItemProps) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-2.5">
          {icon}
        </div>
      </div>
    </article>
  );
}

export function StockCardProductSummary({
  product,
}: StockCardProductSummaryProps) {
  const isLowStock =
    product.trackStock &&
    product.stock > 0 &&
    product.stock <=
      product.minimumStock;

  const isOutOfStock =
    product.trackStock &&
    product.stock <= 0;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryItem
        label="Stok Saat Ini"
        value={formatInventoryQuantity(
          product.stock,
          product.unit,
        )}
        description={
          product.trackStock
            ? "Stok produk yang tercatat di sistem"
            : "Pelacakan stok tidak aktif"
        }
        icon={
          <Package className="size-5" />
        }
      />

      <SummaryItem
        label="Stok Minimum"
        value={formatInventoryQuantity(
          product.minimumStock,
          product.unit,
        )}
        description={
          isOutOfStock
            ? "Produk sedang kehabisan stok"
            : isLowStock
              ? "Stok sudah mencapai batas minimum"
              : "Batas peringatan stok rendah"
        }
        icon={
          <TriangleAlert className="size-5" />
        }
      />

      <SummaryItem
        label="Nilai Persediaan"
        value={formatInventoryCurrency(
          product.inventoryCostValue,
        )}
        description={`Harga modal ${formatInventoryCurrency(
          product.costPrice,
        )} per ${product.unit}`}
        icon={
          <CircleDollarSign className="size-5" />
        }
      />

      <SummaryItem
        label="Nilai Jual"
        value={formatInventoryCurrency(
          product.inventorySellingValue,
        )}
        description={`Harga jual ${formatInventoryCurrency(
          product.sellingPrice,
        )} per ${product.unit}`}
        icon={
          <TrendingUp className="size-5" />
        }
      />
    </section>
  );
}
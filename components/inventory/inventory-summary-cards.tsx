import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  PackageX,
  TrendingUp,
} from "lucide-react";

import type { InventorySummary } from "@/features/inventory/types/inventory";

import {
  formatInventoryCurrency,
  formatInventoryQuantity,
} from "@/features/inventory/utils/inventory-formatters";

type InventorySummaryCardsProps = {
  summary: InventorySummary;
};

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

function SummaryCard({
  title,
  value,
  description,
  icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
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

export function InventorySummaryCards({
  summary,
}: InventorySummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Nilai Persediaan"
        value={formatInventoryCurrency(
          summary.inventoryCostValue,
        )}
        description={`${summary.activeTrackedProducts} produk aktif dilacak`}
        icon={
          <CircleDollarSign className="size-5" />
        }
      />

      <SummaryCard
        title="Total Stok"
        value={formatInventoryQuantity(
          summary.totalStockQuantity,
        )}
        description={`${summary.movementsToday} pergerakan hari ini`}
        icon={
          <Boxes className="size-5" />
        }
      />

      <SummaryCard
        title="Stok Rendah"
        value={String(
          summary.lowStockProducts,
        )}
        description={
          summary.lowStockProducts > 0
            ? "Perlu segera direncanakan untuk restock"
            : "Tidak ada produk di bawah batas minimum"
        }
        icon={
          <AlertTriangle className="size-5" />
        }
      />

      <SummaryCard
        title="Stok Habis"
        value={String(
          summary.outOfStockProducts,
        )}
        description={
          summary.outOfStockProducts > 0
            ? "Produk tidak dapat dijual sebelum restock"
            : "Tidak ada produk aktif tanpa stok"
        }
        icon={
          <PackageX className="size-5" />
        }
      />

      <article className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm sm:col-span-2 xl:col-span-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Potensi Laba Kotor Persediaan
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight">
              {formatInventoryCurrency(
                summary.potentialGrossProfit,
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
            <TrendingUp className="size-4" />

            <span>
              Nilai jual persediaan{" "}
              <strong>
                {formatInventoryCurrency(
                  summary.inventorySellingValue,
                )}
              </strong>
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}
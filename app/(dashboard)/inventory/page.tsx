import type { Metadata } from "next";

import { InventoryFilters } from "@/components/inventory/inventory-filters";
import { InventoryMovementTable } from "@/components/inventory/inventory-movement-table";
import { DataPagination } from "@/features/shared/components/data-pagination";
import { InventorySummaryCards } from "@/components/inventory/inventory-summary-cards";

import { getInventoryMovements } from "@/features/inventory/queries/get-inventory-movements";
import { getInventorySummary } from "@/features/inventory/queries/get-inventory-summary";

import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog";
import { getInventoryAdjustmentProducts } from "@/features/inventory/queries/get-inventory-adjustment-products";

import { LowStockCenter } from "@/components/inventory/low-stock-center";
import { getLowStockProducts } from "@/features/inventory/queries/get-low-stock-products";

export const metadata: Metadata = {
  title:
    "Inventory | Duratu Kafe",
  description:
    "Kelola stok dan riwayat persediaan Duratu Kafe.",
};

export const dynamic =
  "force-dynamic";

type InventoryPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const params =
    await searchParams;

  const page =
    parsePositiveInteger(
      params.page,
      1,
    );

  const search =
    params.search?.trim() ?? "";

  const movementType =
    params.movementType?.trim() ??
    "all";

  const dateFrom =
    params.dateFrom?.trim() ?? "";

  const dateTo =
    params.dateTo?.trim() ?? "";

  const [
  summary,
  movementResult,
  adjustmentProducts,
  lowStockResult,
] = await Promise.all([
  getInventorySummary(),

  getInventoryMovements({
    page,
    pageSize: 20,
    search,
    movementType,
    dateFrom,
    dateTo,
  }),

  getInventoryAdjustmentProducts(),

  getLowStockProducts(),
]);

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Inventory
          </h1>

          <p className="text-sm text-muted-foreground sm:text-base">
            Pantau nilai persediaan,
            kondisi stok, dan seluruh
            pergerakan barang Duratu Kafe.
          </p>
        </div>

        <StockAdjustmentDialog
          products={
            adjustmentProducts
          }
        />
      </header>

      <InventorySummaryCards
        summary={summary}
      />

      <LowStockCenter
        products={
          lowStockResult.products
        }
        summary={
          lowStockResult.summary
        }
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Riwayat Pergerakan Stok
          </h2>

          <p className="text-sm text-muted-foreground">
            Cari dan filter riwayat
            stok berdasarkan jenis
            serta periode pergerakan.
          </p>
        </div>

        <InventoryFilters
          key={[
            search,
            movementType,
            dateFrom,
            dateTo,
          ].join("|")}
          defaultSearch={search}
          defaultMovementType={
            movementType
          }
          defaultDateFrom={
            dateFrom
          }
          defaultDateTo={
            dateTo
          }
        />

        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            {
              movementResult
                .movements.length
            }{" "}
            dari{" "}
            {
              movementResult.totalItems
            }{" "}
            pergerakan.
          </p>

          <p className="text-sm text-muted-foreground">
            Halaman{" "}
            {
              movementResult.currentPage
            }{" "}
            dari{" "}
            {
              movementResult.totalPages
            }
          </p>
        </div>

        <InventoryMovementTable
          movements={
            movementResult.movements
          }
        />

        <DataPagination
          currentPage={
            movementResult.currentPage
          }
          totalPages={
            movementResult.totalPages
          }
          totalItems={
            movementResult.totalItems
          }
          pageSize={
            movementResult.pageSize
          }
          itemLabel="pergerakan"
        />
      </section>
    </main>
  );
}
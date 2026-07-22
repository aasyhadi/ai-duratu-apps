import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  PencilLine,
} from "lucide-react";
import { notFound } from "next/navigation";

import { DataPagination } from "@/features/shared/components/data-pagination";
import { StockCardProductSummary } from "@/components/inventory/stock-card-product-summary";
import { StockCardTable } from "@/components/inventory/stock-card-table";

import {
  buttonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getInventoryStockCard } from "@/features/inventory/queries/get-inventory-stock-card";

type InventoryStockCardPageProps = {
  params: Promise<{
    productId: string;
  }>;

  searchParams: Promise<{
    page?: string;
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

export async function generateMetadata({
  params,
}: InventoryStockCardPageProps): Promise<Metadata> {
  const resolvedParams =
    await params;

  const productId =
    Number(
      resolvedParams.productId,
    );

  if (
    !Number.isInteger(productId) ||
    productId < 1
  ) {
    return {
      title:
        "Kartu Stok | Duratu Kafe",
    };
  }

  const result =
    await getInventoryStockCard(
      productId,
      {
        page: 1,
        pageSize: 1,
      },
    );

  if (!result) {
    return {
      title:
        "Produk Tidak Ditemukan | Duratu Kafe",
    };
  }

  return {
    title: `Kartu Stok ${result.product.name} | Duratu Kafe`,

    description: `Riwayat pergerakan stok produk ${result.product.name}.`,
  };
}

export const dynamic =
  "force-dynamic";

export default async function InventoryStockCardPage({
  params,
  searchParams,
}: InventoryStockCardPageProps) {
  const [
    resolvedParams,
    resolvedSearchParams,
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const productId =
    Number(
      resolvedParams.productId,
    );

  if (
    !Number.isInteger(productId) ||
    productId < 1
  ) {
    notFound();
  }

  const page =
    parsePositiveInteger(
      resolvedSearchParams.page,
      1,
    );

  const result =
    await getInventoryStockCard(
      productId,
      {
        page,
        pageSize: 20,
      },
    );

  if (!result) {
    notFound();
  }

  const { product } =
    result;

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-3">
          <Link
            href="/inventory"
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "sm",
              }),
              "w-fit",
            )}
          >
            <ArrowLeft className="mr-2 size-4" />

            Kembali ke Inventory
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Kartu Stok
              </h1>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  product.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {product.isActive
                  ? "Aktif"
                  : "Tidak Aktif"}
              </span>
            </div>

            <p className="mt-2 text-lg font-semibold">
              {product.name}
            </p>

            <p className="text-sm text-muted-foreground">
              {product.sku ??
                "Tanpa SKU"}
              {" · "}
              {product.categoryName ??
                "Tanpa kategori"}
              {" · "}
              Satuan {product.unit}
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
            "w-fit",
          )}
        >
          <PencilLine className="mr-2 size-4" />

          Kelola Produk
        </Link>
      </header>

      <StockCardProductSummary
        product={product}
      />

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold">
              Riwayat Kartu Stok
            </h2>

            <p className="text-sm text-muted-foreground">
              Urutan terbaru ke
              terlama dengan saldo
              stok setelah setiap
              pergerakan.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            {result.entries.length}{" "}
            dari{" "}
            {result.totalItems}{" "}
            pergerakan
          </p>
        </div>

        <StockCardTable
          entries={
            result.entries
          }
          unit={
            product.unit
          }
        />

        <DataPagination
          currentPage={
            result.currentPage
          }
          totalPages={
            result.totalPages
          }
          totalItems={
            result.totalItems
          }
          pageSize={
            result.pageSize
          }
          itemLabel="pergerakan stok"
        />
      </section>
    </main>
  );
}
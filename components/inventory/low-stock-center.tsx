import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  PackageX,
  ShoppingCart,
} from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";

import type {
  InventoryLowStockProduct,
  InventoryLowStockSummary,
} from "@/features/inventory/types/inventory";

import {
  formatInventoryCurrency,
  formatInventoryQuantity,
} from "@/features/inventory/utils/inventory-formatters";

import { cn } from "@/lib/utils";
import { CreateRestockDraftDialog } from "@/components/purchases/create-restock-draft-dialog";

type LowStockCenterProps = {
  products: InventoryLowStockProduct[];
  summary: InventoryLowStockSummary;
};

function getStockStatusLabel(
  status:
    InventoryLowStockProduct["stockStatus"],
): string {
  return status ===
    "out_of_stock"
    ? "Stok Habis"
    : "Stok Rendah";
}

function getStockStatusClassName(
  status:
    InventoryLowStockProduct["stockStatus"],
): string {
  return status ===
    "out_of_stock"
    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
}

export function LowStockCenter({
  products,
  summary,
}: LowStockCenterProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-xl font-semibold">
            Pusat Stok Rendah
          </h2>

          <p className="text-sm text-muted-foreground">
            Rekomendasi pembelian
            berdasarkan dua kali batas
            stok minimum.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border px-3 py-1">
              Rendah:{" "}
              <strong>
                {
                  summary.lowStockProducts
                }
              </strong>
            </span>

            <span className="rounded-full border px-3 py-1">
              Habis:{" "}
              <strong>
                {
                  summary.outOfStockProducts
                }
              </strong>
            </span>
          </div>

          <CreateRestockDraftDialog
            products={products.map(
              (product) => ({
                id: product.id,
                sku: product.sku,
                name: product.name,
                unit: product.unit,
                stock: product.stock,
                minimumStock:
                  product.minimumStock,
                costPrice:
                  product.costPrice,
                recommendedRestockQuantity:
                  product.recommendedRestockQuantity,
              }),
            )}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <ShoppingCart className="size-5" />
          </div>

          <p className="mt-4 font-medium">
            Kondisi stok aman
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Tidak ada produk aktif
            yang kehabisan stok atau
            berada di bawah batas
            minimum.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Produk Perlu Restock
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  summary.totalProducts
                }
              </p>
            </article>

            <article className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Total Rekomendasi
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatInventoryQuantity(
                  summary.totalRecommendedQuantity,
                )}
              </p>
            </article>

            <article className="rounded-xl border bg-card p-4 shadow-sm sm:col-span-2">
              <p className="text-sm text-muted-foreground">
                Estimasi Dana Restock
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatInventoryCurrency(
                  summary.estimatedRestockCost,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Berdasarkan harga modal
                produk saat ini.
              </p>
            </article>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">
                      Produk
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Stok
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Minimum
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Kekurangan
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Rekomendasi
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Estimasi Biaya
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {products.map(
                    (product) => (
                      <tr
                        key={
                          product.id
                        }
                        className="hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/inventory/${product.id}`}
                            className="font-medium hover:underline"
                          >
                            {
                              product.name
                            }
                          </Link>

                          <p className="text-xs text-muted-foreground">
                            {product.sku ??
                              "Tanpa SKU"}
                            {" · "}
                            {product.categoryName ??
                              "Tanpa kategori"}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStockStatusClassName(
                              product.stockStatus,
                            )}`}
                          >
                            {product.stockStatus ===
                            "out_of_stock" ? (
                              <PackageX className="size-3.5" />
                            ) : (
                              <AlertTriangle className="size-3.5" />
                            )}

                            {getStockStatusLabel(
                              product.stockStatus,
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                          {formatInventoryQuantity(
                            product.stock,
                            product.unit,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {formatInventoryQuantity(
                            product.minimumStock,
                            product.unit,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right text-rose-600">
                          {formatInventoryQuantity(
                            product.shortageQuantity,
                            product.unit,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-600">
                          {formatInventoryQuantity(
                            product.recommendedRestockQuantity,
                            product.unit,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {formatInventoryCurrency(
                            product.estimatedRestockCost,
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/inventory/${product.id}`}
                            aria-label={`Lihat kartu stok ${product.name}`}
                            className={cn(
                              buttonVariants({
                                variant:
                                  "ghost",
                                size:
                                  "icon",
                              }),
                            )}
                          >
                            <ClipboardList className="size-4" />
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
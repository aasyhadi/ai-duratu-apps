import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Truck,
} from "lucide-react";
import {
  notFound,
} from "next/navigation";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  CreatePurchaseOrderButton,
} from "@/features/purchase-orders/components/create-purchase-order-button";

import { getPurchaseRequest } from "@/features/purchases/queries/get-purchase-request";
import {
  formatPurchaseCurrency,
  formatPurchaseDate,
  formatPurchaseDateTime,
  formatPurchaseQuantity,
  getPurchaseRequestStatusClassName,
  getPurchaseRequestStatusLabel,
} from "@/features/purchases/utils/purchase-formatters";

import { cn } from "@/lib/utils";

type PurchaseRequestDetailPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export const metadata: Metadata =
  {
    title:
      "Detail Draft Pembelian | Duratu Kafe",

    description:
      "Detail permintaan pembelian Duratu Kafe.",
  };

export const dynamic =
  "force-dynamic";

export default async function PurchaseRequestDetailPage({
  params,
}: PurchaseRequestDetailPageProps) {
  const resolvedParams =
    await params;

  const requestId =
    Number(
      resolvedParams.requestId,
    );

  if (
    !Number.isInteger(
      requestId,
    ) ||
    requestId < 1
  ) {
    notFound();
  }

  const result =
    await getPurchaseRequest(
      requestId,
    );

  if (!result) {
    notFound();
  }

  const {
    request,
    items,
  } = result;

  return (
    <main className="space-y-6">
      <header className="space-y-4">
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

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Draft Pembelian
              </h1>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPurchaseRequestStatusClassName(
                  request.status,
                )}`}
              >
                {getPurchaseRequestStatusLabel(
                  request.status,
                )}
              </span>
            </div>

            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {
                request.requestNumber
              }
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border bg-card px-5 py-4 text-right shadow-sm">
              <p className="text-sm text-muted-foreground">
                Estimasi Total
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatPurchaseCurrency(
                  request.estimatedTotal,
                )}
              </p>
            </div>

            {request.status ===
            "approved" ? (
              <CreatePurchaseOrderButton
                purchaseRequestId={
                  request.id
                }
                expectedDate={
                  request.expectedDate
                }
                notes={
                  request.notes
                }
                disabled={
                  request.supplierId ===
                  null
                }
              />
            ) : null}

            {request.status ===
              "approved" &&
            request.supplierId ===
              null ? (
              <p className="max-w-sm text-sm text-amber-700 dark:text-amber-300">
                Pilih supplier terlebih
                dahulu sebelum membuat
                Purchase Order.
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <CalendarDays className="size-5" />

          <p className="mt-3 text-sm text-muted-foreground">
            Tanggal Permintaan
          </p>

          <p className="mt-1 font-semibold">
            {formatPurchaseDate(
              request.requestDate,
            )}
          </p>
        </article>

        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <Truck className="size-5" />

          <p className="mt-3 text-sm text-muted-foreground">
            Tanggal Kebutuhan
          </p>

          <p className="mt-1 font-semibold">
            {formatPurchaseDate(
              request.expectedDate,
            )}
          </p>
        </article>

        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <ClipboardList className="size-5" />

          <p className="mt-3 text-sm text-muted-foreground">
            Jumlah Produk
          </p>

          <p className="mt-1 font-semibold">
            {
              request.totalItems
            }{" "}
            produk
          </p>
        </article>

        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supplier
          </p>

          <p className="mt-3 font-semibold">
            {request.supplierName ??
              "Belum ditentukan"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Dibuat{" "}
            {formatPurchaseDateTime(
              request.createdAt,
            )}
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Daftar Produk
          </h2>

          <p className="text-sm text-muted-foreground">
            Produk dan estimasi biaya
            dalam draft permintaan
            pembelian.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="border-b bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">
                    Produk
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Jumlah
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Harga Satuan
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Subtotal
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Catatan
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {items.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {
                            item.productName
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {item.productSku ??
                            "Tanpa SKU"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                        {formatPurchaseQuantity(
                          item.quantity,
                          item.productUnit,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {formatPurchaseCurrency(
                          item.unitCost,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                        {formatPurchaseCurrency(
                          item.subtotal,
                        )}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {item.notes ??
                          "-"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>

              <tfoot className="border-t bg-muted/30">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-4 text-right font-semibold"
                  >
                    Total
                  </td>

                  <td className="px-4 py-4 text-right text-lg font-bold">
                    {formatPurchaseCurrency(
                      request.estimatedTotal,
                    )}
                  </td>

                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {request.notes ? (
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">
            Catatan Permintaan
          </h2>

          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {request.notes}
          </p>
        </section>
      ) : null}
    </main>
  );
}
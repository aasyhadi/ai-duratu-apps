import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  getPurchaseOrder,
} from "@/features/purchase-orders/queries/get-purchase-order";

import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import {
  formatCurrency,
} from "@/features/shared/utils/currency";

import {
  formatDate,
  formatDateTime,
} from "@/features/shared/utils/date";

import {
  cn,
} from "@/lib/utils";

import {
  PurchaseOrderStatusActions,
} from "@/features/purchase-orders/components/purchase-order-status-actions";

type PurchaseOrderDetailPageProps = {
  params: Promise<{
    purchaseOrderId: string;
  }>;
};

export const metadata: Metadata = {
  title:
    "Detail Purchase Order | Duratu Kafe",

  description:
    "Detail Purchase Order dan penerimaan barang Duratu Kafe.",
};

export const dynamic =
  "force-dynamic";

function getStatusLabel(
  status: PurchaseOrderStatus,
): string {
  const labels: Record<
    PurchaseOrderStatus,
    string
  > = {
    draft: "Draft",
    sent: "Terkirim",
    confirmed: "Dikonfirmasi",
    partial_received:
      "Diterima Sebagian",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return labels[status];
}

function getStatusClassName(
  status: PurchaseOrderStatus,
): string {
  const classes: Record<
    PurchaseOrderStatus,
    string
  > = {
    draft:
      "border-muted-foreground/30 bg-muted text-muted-foreground",

    sent:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",

    confirmed:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",

    partial_received:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",

    completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",

    cancelled:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  };

  return classes[status];
}

function formatQuantity(
  value: number,
  unit: string,
): string {
  return `${new Intl.NumberFormat(
    "id-ID",
    {
      maximumFractionDigits: 2,
    },
  ).format(value)} ${unit}`;
}

export default async function PurchaseOrderDetailPage({
  params,
}: PurchaseOrderDetailPageProps) {
  const resolvedParams =
    await params;

  const purchaseOrderId =
    Number(
      resolvedParams.purchaseOrderId,
    );

  if (
    !Number.isInteger(
      purchaseOrderId,
    ) ||
    purchaseOrderId < 1
  ) {
    notFound();
  }

  const result =
    await getPurchaseOrder(
      purchaseOrderId,
    );

  if (!result) {
    notFound();
  }

  const {
    order,
    items,
  } = result;

  const remainingQuantity =
    Math.max(
      0,
      order.totalOrderedQuantity -
        order.totalReceivedQuantity,
    );

  const receivingProgress =
    order.totalOrderedQuantity > 0
      ? Math.min(
          100,
          Math.round(
            (
              order.totalReceivedQuantity /
              order.totalOrderedQuantity
            ) * 100,
          ),
        )
      : 0;
    
  const canReceiveGoods =
    [
      "sent",
      "confirmed",
      "partial_received",
    ].includes(order.status) &&
    items.some(
      (item) =>
        item.remainingQuantity > 0,
    );

  return (
    <main className="space-y-6">
      <header className="space-y-4">
        <Link
          href="/purchase-orders"
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
            "w-fit",
          )}
        >
          <ArrowLeft className="size-4" />

          Kembali ke Purchase Order
        </Link>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Detail Purchase Order
              </h1>

              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                  order.status,
                )}`}
              >
                {getStatusLabel(
                  order.status,
                )}
              </span>
            </div>

            <p className="font-mono text-sm text-muted-foreground">
              {order.orderNumber}
            </p>

            {order.purchaseRequestId &&
            order.purchaseRequestNumber ? (
              <p className="text-sm text-muted-foreground">
                Dibuat dari{" "}
                <Link
                  href={`/purchases/${order.purchaseRequestId}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {
                    order.purchaseRequestNumber
                  }
                </Link>
              </p>
            ) : null}
          </div>

          <div className="space-y-3 lg:min-w-64">
            <div className="rounded-xl border bg-card px-5 py-4 text-left shadow-sm lg:text-right">
              <p className="text-sm text-muted-foreground">
                Total Purchase Order
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(
                  order.totalAmount,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {order.totalItems} jenis produk
              </p>
            </div>

            {canReceiveGoods ? (
              <Link
                href={`/purchase-orders/${order.id}/receive`}
                className={cn(
                  buttonVariants(),
                  "w-full",
                )}
              >
                <PackageCheck className="size-4" />

                Receive Goods
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className={cn(
                  buttonVariants(),
                  "w-full",
                )}
              >
                <PackageCheck className="size-4" />

                {order.status ===
                "completed"
                  ? "Penerimaan Selesai"
                  : "Receive Goods"}
              </button>
            )}
          </div>

          <PurchaseOrderStatusActions
            purchaseOrderId={order.id}
            status={order.status}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <CalendarDays className="size-5" />

          <p className="mt-3 text-sm text-muted-foreground">
            Tanggal Pemesanan
          </p>

          <p className="mt-1 font-semibold">
            {formatDate(
              order.orderDate,
            )}
          </p>
        </article>

        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <Truck className="size-5" />

          <p className="mt-3 text-sm text-muted-foreground">
            Perkiraan Kedatangan
          </p>

          <p className="mt-1 font-semibold">
            {formatDate(
              order.expectedDate,
            )}
          </p>
        </article>

        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <ClipboardList className="size-5" />

          <p className="mt-3 text-sm text-muted-foreground">
            Supplier
          </p>

          <p className="mt-1 font-semibold">
            {order.supplierName}
          </p>
        </article>

        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <PackageCheck className="size-5" />

          <p className="mt-3 text-sm text-muted-foreground">
            Progres Penerimaan
          </p>

          <p className="mt-1 font-semibold">
            {receivingProgress}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {
              order.totalReceivedQuantity
            }{" "}
            dari{" "}
            {
              order.totalOrderedQuantity
            }{" "}
            unit
          </p>
        </article>
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Progres Penerimaan Barang
            </h2>

            <p className="text-sm text-muted-foreground">
              Jumlah barang yang sudah
              diterima dibandingkan dengan
              jumlah pemesanan.
            </p>
          </div>

          <p className="text-sm font-medium">
            Sisa{" "}
            {remainingQuantity} unit
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width:
                `${receivingProgress}%`,
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Daftar Barang
          </h2>

          <p className="text-sm text-muted-foreground">
            Rincian produk, jumlah
            pemesanan, dan jumlah barang
            yang telah diterima.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="border-b bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">
                    Produk
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Dipesan
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Diterima
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Sisa
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
                      key={item.id}
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

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {formatQuantity(
                          item.quantity,
                          item.productUnit,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        {formatQuantity(
                          item.receivedQuantity,
                          item.productUnit,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {formatQuantity(
                          item.remainingQuantity,
                          item.productUnit,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {formatCurrency(
                          item.unitCost,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                        {formatCurrency(
                          item.subtotal,
                        )}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {item.notes ?? "-"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>

              <tfoot className="border-t bg-muted/30">
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-right font-medium"
                  >
                    Subtotal
                  </td>

                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(
                      order.subtotal,
                    )}
                  </td>

                  <td />
                </tr>

                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-right font-medium"
                  >
                    Diskon
                  </td>

                  <td className="px-4 py-3 text-right">
                    {formatCurrency(
                      order.discountAmount,
                    )}
                  </td>

                  <td />
                </tr>

                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-right font-medium"
                  >
                    Pajak
                  </td>

                  <td className="px-4 py-3 text-right">
                    {formatCurrency(
                      order.taxAmount,
                    )}
                  </td>

                  <td />
                </tr>

                <tr className="border-t">
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-right text-base font-semibold"
                  >
                    Total
                  </td>

                  <td className="px-4 py-4 text-right text-lg font-bold">
                    {formatCurrency(
                      order.totalAmount,
                    )}
                  </td>

                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="size-5" />

            <h2 className="font-semibold">
              Riwayat Status
            </h2>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Dibuat
              </dt>

              <dd className="text-right font-medium">
                {formatDateTime(
                  order.createdAt,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Dikirim
              </dt>

              <dd className="text-right font-medium">
                {formatDateTime(
                  order.sentAt,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Dikonfirmasi
              </dt>

              <dd className="text-right font-medium">
                {formatDateTime(
                  order.confirmedAt,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Selesai
              </dt>

              <dd className="text-right font-medium">
                {formatDateTime(
                  order.completedAt,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Diperbarui
              </dt>

              <dd className="text-right font-medium">
                {formatDateTime(
                  order.updatedAt,
                )}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5" />

            <h2 className="font-semibold">
              Informasi Tambahan
            </h2>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                Catatan Purchase Order
              </p>

              <p className="mt-1 whitespace-pre-wrap">
                {order.notes ?? "-"}
              </p>
            </div>

            {order.status ===
            "cancelled" ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                <p className="font-medium text-red-700 dark:text-red-300">
                  Alasan Pembatalan
                </p>

                <p className="mt-1 whitespace-pre-wrap text-red-700 dark:text-red-300">
                  {
                    order.cancellationReason ??
                    "Tidak ada alasan pembatalan."
                  }
                </p>

                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Dibatalkan{" "}
                  {formatDateTime(
                    order.cancelledAt,
                  )}
                </p>
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
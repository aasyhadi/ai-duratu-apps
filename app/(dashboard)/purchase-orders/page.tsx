import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ClipboardList,
  PackageCheck,
  PackageOpen,
  ShoppingCart,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  getPurchaseOrders,
} from "@/features/purchase-orders/queries/get-purchase-orders";

import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import {
  DataPagination,
} from "@/features/shared/components/data-pagination";

import {
  formatCurrency,
} from "@/features/shared/utils/currency";

export const metadata: Metadata = {
  title:
    "Purchase Order | Duratu Kafe",

  description:
    "Kelola Purchase Order dan pemesanan barang Duratu Kafe.",
};

export const dynamic =
  "force-dynamic";

type PurchaseOrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

const STATUS_OPTIONS:
  PurchaseOrderStatus[] = [
    "draft",
    "sent",
    "confirmed",
    "partial_received",
    "completed",
    "cancelled",
  ];

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

function parseStatus(
  value: string | undefined,
): PurchaseOrderStatus | undefined {
  if (!value) {
    return undefined;
  }

  return STATUS_OPTIONS.includes(
    value as PurchaseOrderStatus,
  )
    ? (
        value as
          PurchaseOrderStatus
      )
    : undefined;
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

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
      "bg-muted text-muted-foreground",

    sent:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",

    confirmed:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",

    partial_received:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",

    completed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",

    cancelled:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  return classes[status];
}

export default async function PurchaseOrdersPage({
  searchParams,
}: PurchaseOrdersPageProps) {
  const params =
    await searchParams;

  const page =
    parsePositiveInteger(
      params.page,
      1,
    );

  const status =
    parseStatus(
      params.status,
    );

  const search =
    params.search?.trim() ??
    "";

  const result =
    await getPurchaseOrders({
      page,
      pageSize: 10,
      search,
      status,
    });

  const draftCount =
    result.orders.filter(
      (order) =>
        order.status ===
        "draft",
    ).length;

  const activeCount =
    result.orders.filter(
      (order) =>
        order.status ===
          "sent" ||
        order.status ===
          "confirmed" ||
        order.status ===
          "partial_received",
    ).length;

  const completedCount =
    result.orders.filter(
      (order) =>
        order.status ===
        "completed",
    ).length;

  const currentPageValue =
    result.orders.reduce(
      (
        total,
        order,
      ) =>
        total +
        order.totalAmount,
      0,
    );

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Purchase Order
          </h1>

          <p className="text-sm text-muted-foreground sm:text-base">
            Kelola pemesanan barang
            kepada supplier Duratu
            Kafe.
          </p>
        </div>

        <Link
          href="/purchases"
          className={buttonVariants()}
        >
          <ShoppingCart className="size-4" />

          Lihat Purchase Request
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total PO
            </CardTitle>

            <ClipboardList className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {result.totalItems}
            </div>

            <p className="text-xs text-muted-foreground">
              Seluruh Purchase Order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft
            </CardTitle>

            <PackageOpen className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {draftCount}
            </div>

            <p className="text-xs text-muted-foreground">
              Pada halaman ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sedang Diproses
            </CardTitle>

            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {activeCount}
            </div>

            <p className="text-xs text-muted-foreground">
              Dikirim atau diterima
              sebagian
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Halaman
            </CardTitle>

            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                currentPageValue,
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {completedCount} PO
              selesai pada halaman ini
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Purchase Order
          </CardTitle>

          <CardDescription>
            Menampilkan Purchase Order
            terbaru beserta status
            penerimaan barang.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {result.orders.length ===
          0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
              <ClipboardList className="size-10 text-muted-foreground" />

              <div className="space-y-1">
                <p className="font-medium">
                  Purchase Order belum
                  tersedia
                </p>

                <p className="text-sm text-muted-foreground">
                  Purchase Order dibuat
                  dari Purchase Request
                  yang sudah disetujui.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">
                      Nomor PO
                    </th>

                    <th className="p-3">
                      Purchase Request
                    </th>

                    <th className="p-3">
                      Supplier
                    </th>

                    <th className="p-3">
                      Tanggal
                    </th>

                    <th className="p-3">
                      Perkiraan Tiba
                    </th>

                    <th className="p-3 text-right">
                      Item
                    </th>

                    <th className="p-3 text-right">
                      Penerimaan
                    </th>

                    <th className="p-3 text-right">
                      Total
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {result.orders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="border-b last:border-0"
                      >
                        <td className="p-3">
                          <div className="font-medium">
                            {
                              order.orderNumber
                            }
                          </div>
                        </td>

                        <td className="p-3">
                          {order.purchaseRequestNumber ??
                            "-"}
                        </td>

                        <td className="p-3">
                          {
                            order.supplierName
                          }
                        </td>

                        <td className="p-3">
                          {formatDate(
                            order.orderDate,
                          )}
                        </td>

                        <td className="p-3">
                          {formatDate(
                            order.expectedDate,
                          )}
                        </td>

                        <td className="p-3 text-right">
                          {
                            order.totalItems
                          }
                        </td>

                        <td className="p-3 text-right">
                          {
                            order.totalReceivedQuantity
                          }
                          {" / "}
                          {
                            order.totalOrderedQuantity
                          }
                        </td>

                        <td className="p-3 text-right font-medium">
                          {formatCurrency(
                            order.totalAmount,
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                              order.status,
                            )}`}
                          >
                            {getStatusLabel(
                              order.status,
                            )}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <Link
                            href={`/purchase-orders/${order.id}`}
                            className={buttonVariants({
                              size: "sm",
                              variant: "outline",
                            })}
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

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
            itemLabel="Purchase Order"
          />
        </CardContent>
      </Card>
    </main>
  );
}
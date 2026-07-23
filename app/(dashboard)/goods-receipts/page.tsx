import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck,
  PackageCheck,
  ReceiptText,
  Truck,
} from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  getGoodsReceipts,
} from "@/features/goods-receipts/queries/get-goods-receipts";

import type {
  GoodsReceiptStatus,
} from "@/features/goods-receipts/types/goods-receipt";

import {
  DataPagination,
} from "@/features/shared/components/data-pagination";

import {
  formatCurrency,
} from "@/features/shared/utils/currency";

export const metadata: Metadata = {
  title:
    "Goods Receipt | Duratu Kafe",
  description:
    "Kelola penerimaan barang dari Purchase Order Duratu Kafe.",
};

export const dynamic =
  "force-dynamic";

type GoodsReceiptsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

const STATUS_OPTIONS:
  GoodsReceiptStatus[] = [
    "draft",
    "posted",
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
): GoodsReceiptStatus | undefined {
  if (!value) {
    return undefined;
  }

  return STATUS_OPTIONS.includes(
    value as GoodsReceiptStatus,
  )
    ? (
        value as
          GoodsReceiptStatus
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
  status: GoodsReceiptStatus,
): string {
  const labels: Record<
    GoodsReceiptStatus,
    string
  > = {
    draft: "Draft",
    posted: "Diposting",
    cancelled: "Dibatalkan",
  };

  return labels[status];
}

function getStatusClassName(
  status: GoodsReceiptStatus,
): string {
  const classes: Record<
    GoodsReceiptStatus,
    string
  > = {
    draft:
      "bg-muted text-muted-foreground",

    posted:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",

    cancelled:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  return classes[status];
}

export default async function GoodsReceiptsPage({
  searchParams,
}: GoodsReceiptsPageProps) {
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
    await getGoodsReceipts({
      page,
      pageSize: 10,
      search,
      status,
    });

  const postedCount =
    result.receipts.filter(
      (receipt) =>
        receipt.status ===
        "posted",
    ).length;

  const draftCount =
    result.receipts.filter(
      (receipt) =>
        receipt.status ===
        "draft",
    ).length;

  const totalQuantity =
    result.receipts.reduce(
      (
        total,
        receipt,
      ) =>
        total +
        receipt.totalQuantity,
      0,
    );

  const totalAmount =
    result.receipts.reduce(
      (
        total,
        receipt,
      ) =>
        total +
        receipt.totalAmount,
      0,
    );

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Goods Receipt
          </h1>

          <p className="text-sm text-muted-foreground sm:text-base">
            Kelola penerimaan barang dari
            Purchase Order dan pembaruan
            stok.
          </p>
        </div>

        <Link
          href="/purchase-orders"
          className={buttonVariants()}
        >
          <Truck className="size-4" />

          Lihat Purchase Order
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penerimaan
            </CardTitle>

            <ReceiptText className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {result.totalItems}
            </div>

            <p className="text-xs text-muted-foreground">
              Seluruh Goods Receipt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Diposting
            </CardTitle>

            <ClipboardCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {postedCount}
            </div>

            <p className="text-xs text-muted-foreground">
              Pada halaman ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Kuantitas
            </CardTitle>

            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat(
                "id-ID",
                {
                  maximumFractionDigits: 2,
                },
              ).format(
                totalQuantity,
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {draftCount} draft pada
              halaman ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Penerimaan
            </CardTitle>

            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                totalAmount,
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Pada halaman ini
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Goods Receipt
          </CardTitle>

          <CardDescription>
            Menampilkan riwayat
            penerimaan barang dari
            supplier.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {result.receipts.length ===
          0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
              <ReceiptText className="size-10 text-muted-foreground" />

              <div className="space-y-1">
                <p className="font-medium">
                  Goods Receipt belum
                  tersedia
                </p>

                <p className="text-sm text-muted-foreground">
                  Penerimaan barang dibuat
                  dari Purchase Order yang
                  sedang diproses.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">
                      Nomor GR
                    </th>

                    <th className="p-3">
                      Nomor PO
                    </th>

                    <th className="p-3">
                      Supplier
                    </th>

                    <th className="p-3">
                      Tanggal Terima
                    </th>

                    <th className="p-3">
                      Referensi
                    </th>

                    <th className="p-3 text-right">
                      Item
                    </th>

                    <th className="p-3 text-right">
                      Kuantitas
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
                  {result.receipts.map(
                    (receipt) => (
                      <tr
                        key={receipt.id}
                        className="border-b last:border-0"
                      >
                        <td className="p-3">
                          <div className="font-medium">
                            {
                              receipt.receiptNumber
                            }
                          </div>
                        </td>

                        <td className="p-3">
                          <Link
                            href={`/purchase-orders/${receipt.purchaseOrderId}`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {
                              receipt.purchaseOrderNumber
                            }
                          </Link>
                        </td>

                        <td className="p-3">
                          {
                            receipt.supplierName
                          }
                        </td>

                        <td className="p-3">
                          {formatDate(
                            receipt.receiptDate,
                          )}
                        </td>

                        <td className="p-3">
                          {receipt.referenceNumber ??
                            "-"}
                        </td>

                        <td className="p-3 text-right">
                          {
                            receipt.totalItems
                          }
                        </td>

                        <td className="p-3 text-right">
                          {new Intl.NumberFormat(
                            "id-ID",
                            {
                              maximumFractionDigits: 2,
                            },
                          ).format(
                            receipt.totalQuantity,
                          )}
                        </td>

                        <td className="p-3 text-right font-medium">
                          {formatCurrency(
                            receipt.totalAmount,
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                              receipt.status,
                            )}`}
                          >
                            {getStatusLabel(
                              receipt.status,
                            )}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <Link
                            href={`/goods-receipts/${receipt.id}`}
                            className={buttonVariants({
                              size: "sm",
                              variant:
                                "outline",
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
            itemLabel="Goods Receipt"
          />
        </CardContent>
      </Card>
    </main>
  );
}
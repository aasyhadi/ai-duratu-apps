import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FileText,
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
  getGoodsReceipt,
} from "@/features/goods-receipts/queries/get-goods-receipt";

import type {
  GoodsReceiptStatus,
} from "@/features/goods-receipts/types/goods-receipt";

import {
  formatCurrency,
} from "@/features/shared/utils/currency";

export const dynamic = "force-dynamic";

type GoodsReceiptDetailPageProps = {
  params: Promise<{
    goodsReceiptId: string;
  }>;
};

export async function generateMetadata({
  params,
}: GoodsReceiptDetailPageProps): Promise<Metadata> {
  const resolvedParams =
    await params;

  const goodsReceiptId =
    Number(
      resolvedParams.goodsReceiptId,
    );

  if (
    !Number.isInteger(
      goodsReceiptId,
    ) ||
    goodsReceiptId < 1
  ) {
    return {
      title:
        "Goods Receipt Tidak Ditemukan | Duratu Kafe",
    };
  }

  const detail =
    await getGoodsReceipt(
      goodsReceiptId,
    );

  if (!detail) {
    return {
      title:
        "Goods Receipt Tidak Ditemukan | Duratu Kafe",
    };
  }

  return {
    title:
      `${detail.receipt.receiptNumber} | Duratu Kafe`,

    description:
      `Detail penerimaan barang ${detail.receipt.receiptNumber}.`,
  };
}

function formatDisplayDate(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function formatDisplayDateTime(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatQuantity(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
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

export default async function GoodsReceiptDetailPage({
  params,
}: GoodsReceiptDetailPageProps) {
  const resolvedParams =
    await params;

  const goodsReceiptId =
    Number(
      resolvedParams.goodsReceiptId,
    );

  if (
    !Number.isInteger(
      goodsReceiptId,
    ) ||
    goodsReceiptId < 1
  ) {
    notFound();
  }

  const detail =
    await getGoodsReceipt(
      goodsReceiptId,
    );

  if (!detail) {
    notFound();
  }

  const {
    receipt,
    items,
  } = detail;

  const calculatedTotalQuantity =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantityReceived,
      0,
    );

  const calculatedTotalAmount =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.totalCost,
      0,
    );

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/goods-receipts"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className:
                "-ml-3 w-fit",
            })}
          >
            <ArrowLeft className="size-4" />

            Kembali ke Goods Receipt
          </Link>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {
                  receipt.receiptNumber
                }
              </h1>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClassName(
                  receipt.status,
                )}`}
              >
                {getStatusLabel(
                  receipt.status,
                )}
              </span>
            </div>

            <p className="text-sm text-muted-foreground sm:text-base">
              Detail penerimaan barang
              dari Purchase Order{" "}
              {
                receipt.purchaseOrderNumber
              }.
            </p>
          </div>
        </div>

        <Link
          href={`/purchase-orders/${receipt.purchaseOrderId}`}
          className={buttonVariants({
            variant: "outline",
          })}
        >
          <Truck className="size-4" />

          Lihat Purchase Order
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Item
            </CardTitle>

            <ReceiptText className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {receipt.totalItems}
            </div>

            <p className="text-xs text-muted-foreground">
              Jenis produk diterima
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
              {formatQuantity(
                receipt.totalQuantity ||
                  calculatedTotalQuantity,
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Seluruh barang diterima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Penerimaan
            </CardTitle>

            <ClipboardCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                receipt.totalAmount ||
                  calculatedTotalAmount,
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Berdasarkan biaya barang
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tanggal Terima
            </CardTitle>

            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-base font-bold">
              {formatDisplayDate(
                receipt.receiptDate,
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Tanggal barang diterima
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>
              Item Penerimaan
            </CardTitle>

            <CardDescription>
              Daftar produk yang diterima
              dan masuk ke persediaan.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {items.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
                <PackageCheck className="size-10 text-muted-foreground" />

                <div className="space-y-1">
                  <p className="font-medium">
                    Item penerimaan belum
                    tersedia
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Data item Goods
                    Receipt tidak
                    ditemukan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3">
                        Produk
                      </th>

                      <th className="p-3">
                        SKU
                      </th>

                      <th className="p-3 text-right">
                        Kuantitas
                      </th>

                      <th className="p-3">
                        Satuan
                      </th>

                      <th className="p-3 text-right">
                        Biaya Satuan
                      </th>

                      <th className="p-3 text-right">
                        Subtotal
                      </th>

                      <th className="p-3">
                        Catatan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-0"
                        >
                          <td className="p-3">
                            <Link
                              href={`/inventory/${item.productId}`}
                              className="font-medium underline-offset-4 hover:underline"
                            >
                              {
                                item.productName
                              }
                            </Link>
                          </td>

                          <td className="p-3 text-muted-foreground">
                            {item.productSku ??
                              "-"}
                          </td>

                          <td className="p-3 text-right font-medium">
                            {formatQuantity(
                              item.quantityReceived,
                            )}
                          </td>

                          <td className="p-3">
                            {
                              item.productUnit
                            }
                          </td>

                          <td className="p-3 text-right">
                            {formatCurrency(
                              item.unitCost,
                            )}
                          </td>

                          <td className="p-3 text-right font-medium">
                            {formatCurrency(
                              item.totalCost,
                            )}
                          </td>

                          <td className="max-w-64 p-3 text-muted-foreground">
                            {item.notes ??
                              "-"}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>

                  <tfoot>
                    <tr className="border-t">
                      <td
                        colSpan={2}
                        className="p-3 font-semibold"
                      >
                        Total
                      </td>

                      <td className="p-3 text-right font-semibold">
                        {formatQuantity(
                          receipt.totalQuantity ||
                            calculatedTotalQuantity,
                        )}
                      </td>

                      <td />

                      <td />

                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(
                          receipt.totalAmount ||
                            calculatedTotalAmount,
                        )}
                      </td>

                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-5" />

                Informasi Pembelian
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Purchase Order
                </p>

                <Link
                  href={`/purchase-orders/${receipt.purchaseOrderId}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {
                    receipt.purchaseOrderNumber
                  }
                </Link>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Supplier
                </p>

                <p className="font-medium">
                  {
                    receipt.supplierName
                  }
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Referensi Supplier
                </p>

                <p className="font-medium">
                  {receipt.referenceNumber ??
                    "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />

                Informasi Dokumen
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Status
                </p>

                <p className="font-medium">
                  {getStatusLabel(
                    receipt.status,
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Tanggal Penerimaan
                </p>

                <p className="font-medium">
                  {formatDisplayDate(
                    receipt.receiptDate,
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Diposting Pada
                </p>

                <p className="font-medium">
                  {formatDisplayDateTime(
                    receipt.postedAt,
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Dibuat Pada
                </p>

                <p className="font-medium">
                  {formatDisplayDateTime(
                    receipt.createdAt,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Catatan
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {receipt.notes ||
                  "Tidak ada catatan penerimaan barang."}
              </p>
            </CardContent>
          </Card>

          {receipt.status ===
            "cancelled" && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300">
                  Informasi Pembatalan
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    Dibatalkan Pada
                  </p>

                  <p className="font-medium">
                    {formatDisplayDateTime(
                      receipt.cancelledAt,
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    Alasan
                  </p>

                  <p className="whitespace-pre-wrap font-medium">
                    {receipt.cancellationReason ??
                      "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
import type {
  Metadata,
} from "next";

import {
  ArrowLeft,
  PackageCheck,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  ReceiveGoodsPageForm,
} from "@/features/goods-receipts/components/receive-goods-page-form";

import {
  getPurchaseOrder,
} from "@/features/purchase-orders/queries/get-purchase-order";

import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import {
  cn,
} from "@/lib/utils";

type ReceiveGoodsPageProps = {
  params: Promise<{
    purchaseOrderId: string;
  }>;
};

export const metadata: Metadata = {
  title:
    "Receive Goods | Duratu Kafe",

  description:
    "Catat penerimaan barang dari Purchase Order Duratu Kafe.",
};

export const dynamic =
  "force-dynamic";

const RECEIVABLE_STATUSES: PurchaseOrderStatus[] =
  [
    "sent",
    "confirmed",
    "partial_received",
  ];

export default async function ReceiveGoodsPage({
  params,
}: ReceiveGoodsPageProps) {
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

  const remainingItems =
    items.filter(
      (item) =>
        item.remainingQuantity > 0,
    );

  const statusCanReceive =
    RECEIVABLE_STATUSES.includes(
      order.status,
    );

  if (
    !statusCanReceive ||
    remainingItems.length === 0
  ) {
    return (
      <main className="space-y-6">
        <Link
          href={`/purchase-orders/${order.id}`}
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

        <section className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center">
          <PackageCheck className="size-12 text-muted-foreground" />

          <h1 className="mt-4 text-xl font-semibold">
            Barang Tidak Dapat Diterima
          </h1>

          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            {!statusCanReceive
              ? `Purchase Order ${order.orderNumber} memiliki status ${order.status} dan belum dapat digunakan untuk penerimaan barang.`
              : `Seluruh barang pada Purchase Order ${order.orderNumber} sudah diterima.`}
          </p>

          <Link
            href={`/purchase-orders/${order.id}`}
            className={cn(
              buttonVariants(),
              "mt-6",
            )}
          >
            Lihat Purchase Order
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <header className="space-y-4">
        <Link
          href={`/purchase-orders/${order.id}`}
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

        <div>
          <div className="flex items-center gap-3">
            <PackageCheck className="size-7" />

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Receive Goods
            </h1>
          </div>

          <p className="mt-2 text-muted-foreground">
            Catat barang yang diterima
            untuk Purchase Order{" "}
            <span className="font-medium text-foreground">
              {order.orderNumber}
            </span>
            .
          </p>
        </div>
      </header>

      <ReceiveGoodsPageForm
        purchaseOrderId={
          order.id
        }
        orderNumber={
          order.orderNumber
        }
        supplierName={
          order.supplierName
        }
        initialItems={remainingItems.map(
          (item) => ({
            purchaseOrderItemId:
              item.id,

            productId:
              item.productId,

            productName:
              item.productName,

            productSku:
              item.productSku,

            productUnit:
              item.productUnit,

            orderedQuantity:
              item.quantity,

            previouslyReceivedQuantity:
              item.receivedQuantity,

            remainingQuantity:
              item.remainingQuantity,

            quantityReceived: 0,

            unitCost:
              item.unitCost,

            notes: "",
          }),
        )}
      />
    </main>
  );
}
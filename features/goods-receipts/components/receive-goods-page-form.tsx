"use client";

import type {
  FormEvent,
} from "react";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  ArrowLeft,
  Loader2,
  PackageCheck,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  createGoodsReceipt,
} from "@/features/goods-receipts/actions/create-goods-receipt";

import {
  ReceiveGoodsItemCard,
} from "@/features/goods-receipts/components/receive-goods-item-card";

import type {
  ReceiveGoodsFormItem,
} from "@/features/goods-receipts/components/receive-goods-item-card";

import {
  formatCurrency,
} from "@/features/shared/utils/currency";

import {
  cn,
} from "@/lib/utils";

type ReceiveGoodsPageFormProps = {
  purchaseOrderId: number;
  orderNumber: string;
  supplierName: string;

  initialItems: ReceiveGoodsFormItem[];
};

function getCurrentDate(): string {
  const date =
    new Date();

  const timezoneOffset =
    date.getTimezoneOffset() *
    60 *
    1000;

  return new Date(
    date.getTime() -
      timezoneOffset,
  )
    .toISOString()
    .slice(0, 10);
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

export function ReceiveGoodsPageForm({
  purchaseOrderId,
  orderNumber,
  supplierName,
  initialItems,
}: ReceiveGoodsPageFormProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    receiptDate,
    setReceiptDate,
  ] = useState(
    getCurrentDate(),
  );

  const [
    referenceNumber,
    setReferenceNumber,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    items,
    setItems,
  ] = useState<
    ReceiveGoodsFormItem[]
  >(
    initialItems.map(
      (item) => ({
        ...item,
        quantityReceived: 0,
        notes: "",
      }),
    ),
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<
    string | null
  >(null);

  const selectedItems =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.quantityReceived >
            0,
        ),
      [items],
    );

  const totalQuantity =
    useMemo(
      () =>
        selectedItems.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantityReceived,
          0,
        ),
      [selectedItems],
    );

  const totalAmount =
    useMemo(
      () =>
        selectedItems.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantityReceived *
              item.unitCost,
          0,
        ),
      [selectedItems],
    );

  function updateItem(
    updatedItem: ReceiveGoodsFormItem,
  ) {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.purchaseOrderItemId ===
            updatedItem.purchaseOrderItemId
              ? updatedItem
              : item,
        ),
    );
  }

  function receiveAllItems() {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) => ({
            ...item,

            quantityReceived:
              item.remainingQuantity,
          }),
        ),
    );
  }

  function clearAllItems() {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) => ({
            ...item,
            quantityReceived: 0,
          }),
        ),
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage(null);

    if (!receiptDate) {
      setErrorMessage(
        "Tanggal penerimaan wajib diisi.",
      );

      return;
    }

    if (
      selectedItems.length === 0
    ) {
      setErrorMessage(
        "Pilih minimal satu barang yang diterima.",
      );

      return;
    }

    const invalidItem =
      selectedItems.find(
        (item) =>
          item.quantityReceived <= 0 ||
          item.quantityReceived >
            item.remainingQuantity,
      );

    if (invalidItem) {
      setErrorMessage(
        `Jumlah penerimaan ${invalidItem.productName} tidak valid.`,
      );

      return;
    }

    startTransition(
      async () => {
        const result =
          await createGoodsReceipt({
            purchaseOrderId,

            receiptDate,

            referenceNumber:
              referenceNumber.trim(),

            notes:
              notes.trim(),

            items:
              selectedItems.map(
                (item) => ({
                  purchaseOrderItemId:
                    item.purchaseOrderItemId,

                  quantityReceived:
                    item.quantityReceived,

                  unitCost:
                    item.unitCost,

                  notes:
                    item.notes.trim(),
                }),
              ),
          });

        if (!result.success) {
          setErrorMessage(
            result.message,
          );

          return;
        }

        if (
          !result.data ||
          result.data.goodsReceiptId <
            1
        ) {
          setErrorMessage(
            "Goods Receipt berhasil dibuat, tetapi ID dokumen tidak ditemukan.",
          );

          return;
        }

        router.push(
          `/goods-receipts/${result.data.goodsReceiptId}`,
        );

        router.refresh();
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Purchase Order
            </p>

            <p className="mt-1 font-semibold">
              {orderNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Supplier
            </p>

            <p className="mt-1 font-semibold">
              {supplierName}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">
            Informasi Penerimaan
          </h2>

          <p className="text-sm text-muted-foreground">
            Isi tanggal penerimaan dan
            referensi dokumen dari
            supplier.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="receipt-date">
              Tanggal penerimaan
            </Label>

            <Input
              id="receipt-date"
              type="date"
              value={receiptDate}
              disabled={isPending}
              onChange={(event) => {
                setReceiptDate(
                  event.target.value,
                );
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference-number">
              Nomor surat jalan
            </Label>

            <Input
              id="reference-number"
              value={referenceNumber}
              disabled={isPending}
              placeholder="Contoh: SJ-001/2026"
              onChange={(event) => {
                setReferenceNumber(
                  event.target.value,
                );
              }}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="receipt-notes">
            Catatan penerimaan
          </Label>

          <Textarea
            id="receipt-notes"
            value={notes}
            disabled={isPending}
            rows={3}
            placeholder="Catatan kondisi barang atau dokumen supplier."
            onChange={(event) => {
              setNotes(
                event.target.value,
              );
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Barang yang Diterima
            </h2>

            <p className="text-sm text-muted-foreground">
              Isi jumlah aktual yang
              diterima dari supplier.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={
                receiveAllItems
              }
            >
              Terima Semua
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={
                clearAllItems
              }
            >
              Kosongkan
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map(
            (item) => (
              <ReceiveGoodsItemCard
                key={
                  item.purchaseOrderItemId
                }
                item={item}
                disabled={isPending}
                onChange={updateItem}
              />
            ),
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">
          Ringkasan Penerimaan
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Jenis produk
            </p>

            <p className="mt-1 text-2xl font-bold">
              {selectedItems.length}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Total kuantitas
            </p>

            <p className="mt-1 text-2xl font-bold">
              {formatQuantity(
                totalQuantity,
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Total nilai
            </p>

            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(
                totalAmount,
              )}
            </p>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      <footer className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/purchase-orders/${purchaseOrderId}`}
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
          )}
        >
          <ArrowLeft className="size-4" />

          Batal
        </Link>

        <Button
          type="submit"
          disabled={
            isPending ||
            selectedItems.length === 0
          }
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />

              Menyimpan...
            </>
          ) : (
            <>
              <PackageCheck className="size-4" />

              Simpan Penerimaan
            </>
          )}
        </Button>
      </footer>
    </form>
  );
}
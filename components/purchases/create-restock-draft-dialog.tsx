"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  ClipboardPlus,
  Minus,
  Plus,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createPurchaseRequest } from "@/features/purchases/actions/create-purchase-request";
import type { RestockDraftProduct } from "@/features/purchases/types/purchase-request";
import {
  formatPurchaseCurrency,
  formatPurchaseQuantity,
} from "@/features/purchases/utils/purchase-formatters";

type CreateRestockDraftDialogProps = {
  products: RestockDraftProduct[];
};

type DraftItemState = {
  productId: number;
  selected: boolean;
  quantity: number;
  unitCost: number;
};

function getTodayValue(): string {
  return new Date()
    .toISOString()
    .slice(
      0,
      10,
    );
}

function getDefaultExpectedDate(): string {
  const date =
    new Date();

  date.setDate(
    date.getDate() +
      3,
  );

  return date
    .toISOString()
    .slice(
      0,
      10,
    );
}

function createDefaultItems(
  products: RestockDraftProduct[],
): DraftItemState[] {
  return products.map(
    (product) => ({
      productId:
        product.id,

      selected:
        true,

      quantity:
        product.recommendedRestockQuantity,

      unitCost:
        product.costPrice,
    }),
  );
}

export function CreateRestockDraftDialog({
  products,
}: CreateRestockDraftDialogProps) {
  const router =
    useRouter();

  const [open, setOpen] =
    useState(false);

  const [
    requestDate,
    setRequestDate,
  ] = useState(
    getTodayValue,
  );

  const [
    expectedDate,
    setExpectedDate,
  ] = useState(
    getDefaultExpectedDate,
  );

  const [notes, setNotes] =
    useState(
      "Draft restock dari pusat stok rendah.",
    );

  const [items, setItems] =
    useState<
      DraftItemState[]
    >(() =>
      createDefaultItems(
        products,
      ),
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    serverMessage,
    setServerMessage,
  ] = useState("");

  const selectedItems =
    items.filter(
      (item) =>
        item.selected &&
        item.quantity > 0,
    );

  const totalEstimatedCost =
    selectedItems.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity *
          item.unitCost,
      0,
    );

  const productMap =
    useMemo(
      () =>
        new Map(
          products.map(
            (product) => [
              product.id,
              product,
            ],
          ),
        ),
      [products],
    );

  function resetDialog() {
    setRequestDate(
      getTodayValue(),
    );

    setExpectedDate(
      getDefaultExpectedDate(),
    );

    setNotes(
      "Draft restock dari pusat stok rendah.",
    );

    setItems(
      createDefaultItems(
        products,
      ),
    );

    setServerMessage("");
  }

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (isSubmitting) {
      return;
    }

    setOpen(nextOpen);

    if (nextOpen) {
      resetDialog();
    } else {
      setServerMessage("");
    }
  }

  function updateItem(
    productId: number,
    changes: Partial<DraftItemState>,
  ) {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.productId ===
            productId
              ? {
                  ...item,
                  ...changes,
                }
              : item,
        ),
    );
  }

  async function handleSubmit() {
    setServerMessage("");

    if (
      selectedItems.length ===
      0
    ) {
      setServerMessage(
        "Minimal satu produk wajib dipilih.",
      );
      return;
    }

    if (!requestDate) {
      setServerMessage(
        "Tanggal permintaan wajib diisi.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result =
        await createPurchaseRequest(
          {
            supplierId:
              null,

            requestDate,

            expectedDate,

            notes,

            items:
              selectedItems.map(
                (item) => ({
                  productId:
                    item.productId,

                  quantity:
                    item.quantity,

                  unitCost:
                    item.unitCost,

                  notes:
                    "Rekomendasi restock dari Inventory.",
                }),
              ),
          },
        );

      if (!result.success) {
        setServerMessage(
          result.message,
        );
        return;
      }

      setOpen(false);

      router.push(
        `/purchases/${result.data?.requestId}`,
      );

      router.refresh();
    } catch {
      setServerMessage(
        "Terjadi kesalahan saat membuat draft pembelian.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (
    products.length === 0
  ) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogTrigger
        render={
          <Button type="button">
            <ClipboardPlus className="mr-2 size-4" />

            Buat Draft Pembelian
          </Button>
        }
      />

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Draft Permintaan Pembelian
          </DialogTitle>

          <DialogDescription>
            Pilih produk dan sesuaikan
            jumlah pembelian berdasarkan
            rekomendasi restock.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="request-date">
              Tanggal Permintaan
            </Label>

            <Input
              id="request-date"
              type="date"
              value={
                requestDate
              }
              disabled={
                isSubmitting
              }
              onChange={(
                event,
              ) =>
                setRequestDate(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected-date">
              Tanggal Kebutuhan
            </Label>

            <Input
              id="expected-date"
              type="date"
              value={
                expectedDate
              }
              disabled={
                isSubmitting
              }
              onChange={(
                event,
              ) =>
                setExpectedDate(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">
              Estimasi Total
            </p>

            <p className="mt-1 text-xl font-bold">
              {formatPurchaseCurrency(
                totalEstimatedCost,
              )}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {
                selectedItems.length
              }{" "}
              produk dipilih
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="border-b bg-muted/50">
                <tr className="text-left">
                  <th className="w-14 px-4 py-3">
                    Pilih
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Produk
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Stok
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Rekomendasi
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Jumlah Beli
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Harga Satuan
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {items.map(
                  (item) => {
                    const product =
                      productMap.get(
                        item.productId,
                      );

                    if (!product) {
                      return null;
                    }

                    return (
                      <tr
                        key={
                          item.productId
                        }
                        className={
                          item.selected
                            ? ""
                            : "opacity-50"
                        }
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={
                              item.selected
                            }
                            disabled={
                              isSubmitting
                            }
                            aria-label={`Pilih ${product.name}`}
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.productId,
                                {
                                  selected:
                                    event
                                      .target
                                      .checked,
                                },
                              )
                            }
                          />
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {
                              product.name
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {product.sku ??
                              "Tanpa SKU"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {formatPurchaseQuantity(
                            product.stock,
                            product.unit,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-600">
                          {formatPurchaseQuantity(
                            product.recommendedRestockQuantity,
                            product.unit,
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="ml-auto flex w-fit items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={
                                isSubmitting ||
                                !item.selected ||
                                item.quantity <=
                                  0.001
                              }
                              onClick={() =>
                                updateItem(
                                  item.productId,
                                  {
                                    quantity:
                                      Math.max(
                                        0.001,
                                        item.quantity -
                                          1,
                                      ),
                                  },
                                )
                              }
                            >
                              <Minus className="size-4" />
                            </Button>

                            <Input
                              type="number"
                              min="0.001"
                              step="0.001"
                              value={
                                item.quantity
                              }
                              disabled={
                                isSubmitting ||
                                !item.selected
                              }
                              className="w-24 text-right"
                              aria-label={`Jumlah beli ${product.name}`}
                              onChange={(
                                event,
                              ) =>
                                updateItem(
                                  item.productId,
                                  {
                                    quantity:
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                  },
                                )
                              }
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={
                                isSubmitting ||
                                !item.selected
                              }
                              onClick={() =>
                                updateItem(
                                  item.productId,
                                  {
                                    quantity:
                                      item.quantity +
                                      1,
                                  },
                                )
                              }
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              item.unitCost
                            }
                            disabled={
                              isSubmitting ||
                              !item.selected
                            }
                            className="ml-auto w-32 text-right"
                            aria-label={`Harga satuan ${product.name}`}
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.productId,
                                {
                                  unitCost:
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                },
                              )
                            }
                          />
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                          {formatPurchaseCurrency(
                            item.quantity *
                              item.unitCost,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase-request-notes">
            Catatan
          </Label>

          <textarea
            id="purchase-request-notes"
            rows={3}
            value={notes}
            disabled={
              isSubmitting
            }
            maxLength={500}
            onChange={(
              event,
            ) =>
              setNotes(
                event.target
                  .value,
              )
            }
            className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {serverMessage ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              {serverMessage}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={
              isSubmitting
            }
            onClick={() =>
              handleOpenChange(
                false,
              )
            }
          >
            Batal
          </Button>

          <Button
            type="button"
            disabled={
              isSubmitting ||
              selectedItems.length ===
                0
            }
            onClick={
              handleSubmit
            }
          >
            {isSubmitting
              ? "Menyimpan..."
              : "Simpan Draft Pembelian"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
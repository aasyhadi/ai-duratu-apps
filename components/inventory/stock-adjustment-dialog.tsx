"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  ClipboardCheck,
} from "lucide-react";
import {
  useForm,
  useWatch,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { adjustProductStock } from "@/features/inventory/actions/adjust-product-stock";
import {
  inventoryAdjustmentSchema,
  type InventoryAdjustmentInput,
  type InventoryAdjustmentValues,
} from "@/features/inventory/schemas/inventory-schema";
import type { InventoryAdjustmentProduct } from "@/features/inventory/types/inventory";
import {
  formatInventoryCurrency,
  formatInventoryQuantity,
} from "@/features/inventory/utils/inventory-formatters";

type StockAdjustmentDialogProps = {
  products: InventoryAdjustmentProduct[];
};

const DEFAULT_VALUES: InventoryAdjustmentInput =
  {
    productId: 0,
    physicalStock: 0,
    notes: "",
  };

export function StockAdjustmentDialog({
  products,
}: StockAdjustmentDialogProps) {
  const router =
    useRouter();

  const [open, setOpen] =
    useState(false);

  const [
    serverMessage,
    setServerMessage,
  ] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    InventoryAdjustmentInput,
    unknown,
    InventoryAdjustmentValues
  >({
    resolver:
      zodResolver(
        inventoryAdjustmentSchema,
      ),

    defaultValues:
      DEFAULT_VALUES,
  });

  const selectedProductId =
    useWatch({
      control,
      name: "productId",
    });

  const physicalStock =
    useWatch({
      control,
      name: "physicalStock",
    });

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (product) =>
            product.id ===
            Number(
              selectedProductId,
            ),
        ) ?? null,
      [
        products,
        selectedProductId,
      ],
    );

  const normalizedPhysicalStock =
    Number(
      physicalStock ?? 0,
    );

  const stockDifference =
    selectedProduct
      ? normalizedPhysicalStock -
        selectedProduct.stock
      : 0;

  async function onSubmit(
    values: InventoryAdjustmentValues,
  ) {
    setServerMessage("");

    const result =
      await adjustProductStock(
        values,
      );

    if (!result.success) {
      setServerMessage(
        result.message,
      );

      return;
    }

    reset(
      DEFAULT_VALUES,
    );

    setOpen(false);
    router.refresh();
  }

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setServerMessage("");

      reset(
        DEFAULT_VALUES,
      );
    }
  }

  function handleProductChange(
    value: string | null,
  ) {
    const productId =
      Number(value ?? 0);

    const product =
      products.find(
        (item) =>
          item.id ===
          productId,
      );

    setValue(
      "productId",
      productId,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );

    setValue(
      "physicalStock",
      product?.stock ?? 0,
      {
        shouldDirty: false,
        shouldValidate: true,
      },
    );
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
            <ClipboardCheck className="mr-2 size-4" />

            Penyesuaian Stok
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Penyesuaian Stok
          </DialogTitle>

          <DialogDescription>
            Cocokkan stok sistem
            dengan hasil pemeriksaan
            fisik.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit(
              onSubmit,
            )
          }
          className="space-y-5"
          noValidate
        >
          <div className="space-y-2">
            <Label>
              Produk
            </Label>

            <Select
              value={
                selectedProductId
                  ? String(
                      selectedProductId,
                    )
                  : ""
              }
              disabled={
                isSubmitting
              }
              onValueChange={
                handleProductChange
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>

              <SelectContent>
                {products.map(
                  (product) => (
                    <SelectItem
                      key={
                        product.id
                      }
                      value={String(
                        product.id,
                      )}
                    >
                      {product.name}
                      {product.sku
                        ? ` — ${product.sku}`
                        : ""}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {errors.productId ? (
              <p className="text-sm text-destructive">
                {
                  errors.productId
                    .message
                }
              </p>
            ) : null}
          </div>

          {selectedProduct ? (
            <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Stok Sistem
                </p>

                <p className="mt-1 font-semibold">
                  {formatInventoryQuantity(
                    selectedProduct.stock,
                    selectedProduct.unit,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Stok Minimum
                </p>

                <p className="mt-1 font-semibold">
                  {formatInventoryQuantity(
                    selectedProduct.minimumStock,
                    selectedProduct.unit,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Harga Modal
                </p>

                <p className="mt-1 font-semibold">
                  {formatInventoryCurrency(
                    selectedProduct.costPrice,
                  )}
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="physicalStock">
              Stok Fisik
            </Label>

            <Input
              id="physicalStock"
              type="number"
              min="0"
              step="0.001"
              disabled={
                isSubmitting ||
                !selectedProduct
              }
              {...register(
                "physicalStock",
              )}
            />

            {errors.physicalStock ? (
              <p className="text-sm text-destructive">
                {
                  errors
                    .physicalStock
                    .message
                }
              </p>
            ) : null}
          </div>

          {selectedProduct ? (
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">
                Selisih Stok
              </p>

              <p
                className={`mt-1 text-xl font-bold ${
                  stockDifference > 0
                    ? "text-emerald-600"
                    : stockDifference < 0
                      ? "text-rose-600"
                      : "text-muted-foreground"
                }`}
              >
                {stockDifference > 0
                  ? "+"
                  : ""}
                {formatInventoryQuantity(
                  stockDifference,
                  selectedProduct.unit,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {stockDifference > 0
                  ? "Akan dicatat sebagai penyesuaian masuk."
                  : stockDifference < 0
                    ? "Akan dicatat sebagai penyesuaian keluar."
                    : "Belum ada perbedaan stok."}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="adjustmentNotes">
              Alasan Penyesuaian
            </Label>

            <textarea
              id="adjustmentNotes"
              rows={4}
              placeholder="Contoh: hasil stok opname harian berbeda dengan stok sistem."
              disabled={
                isSubmitting
              }
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              {...register(
                "notes",
              )}
            />

            {errors.notes ? (
              <p className="text-sm text-destructive">
                {
                  errors.notes
                    .message
                }
              </p>
            ) : null}
          </div>

          {serverMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">
                {serverMessage}
              </p>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
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
              type="submit"
              disabled={
                isSubmitting ||
                !selectedProduct ||
                stockDifference ===
                  0
              }
            >
              {isSubmitting
                ? "Menyimpan..."
                : "Simpan Penyesuaian"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useWatch,
} from "react-hook-form";
import { useRouter } from "next/navigation";

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
import { createProduct }
from "@/features/products/actions/create-product";

import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
}
from "@/features/products/schemas/product-schema";

import {
  PRODUCT_DEFAULT_VALUES,
}
from "@/features/products/constants/product-constants";

import type {
  ProductCategory,
}
from "@/features/products/types/product";

type CreateProductDialogProps = {
  categories: ProductCategory[];
};

export function CreateProductDialog({
  categories,
}: CreateProductDialogProps) {
  const router = useRouter();

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
    ProductFormInput,
    unknown,
    ProductFormValues
  >({
    resolver: zodResolver(
      productSchema,
    ),

    defaultValues:
      PRODUCT_DEFAULT_VALUES,
  });

  const selectedCategoryId =
    useWatch({
      control,
      name: "categoryId",
    });

  const trackStock =
    useWatch({
      control,
      name: "trackStock",
    });

  const isActive =
    useWatch({
      control,
      name: "isActive",
    });

  async function onSubmit(
    values: ProductFormValues,
  ) {
    setServerMessage("");

    const result =
      await createProduct(
        values,
      );

    if (!result.success) {
      setServerMessage(
        result.message,
      );

      return;
    }

    reset(
      PRODUCT_DEFAULT_VALUES,
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
        PRODUCT_DEFAULT_VALUES,
      );
    }
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
            <Plus className="mr-2 size-4" />

            Tambah Produk
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Tambah Produk
          </DialogTitle>

          <DialogDescription>
            Tambahkan produk baru
            beserta harga dan stoknya.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Kategori
              </Label>

              <Select
                value={
                  selectedCategoryId
                    ? String(
                        selectedCategoryId,
                      )
                    : ""
                }
                disabled={
                  isSubmitting
                }
                onValueChange={(
                  value,
                ) => {
                  setValue(
                    "categoryId",
                    Number(
                      value ?? 0,
                    ),
                    {
                      shouldValidate:
                        true,
                      shouldDirty:
                        true,
                      shouldTouch:
                        true,
                    },
                  );
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map(
                    (
                      category,
                    ) => (
                      <SelectItem
                        key={
                          category.id
                        }
                        value={String(
                          category.id,
                        )}
                      >
                        {
                          category.name
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {errors.categoryId ? (
                <p className="text-sm text-destructive">
                  {
                    errors
                      .categoryId
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU
              </Label>

              <Input
                id="sku"
                placeholder="KOPI-003"
                disabled={
                  isSubmitting
                }
                {...register(
                  "sku",
                )}
              />

              {errors.sku ? (
                <p className="text-sm text-destructive">
                  {
                    errors.sku
                      .message
                  }
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Produk
            </Label>

            <Input
              id="name"
              placeholder="Contoh: Cappuccino"
              disabled={
                isSubmitting
              }
              {...register(
                "name",
              )}
            />

            {errors.name ? (
              <p className="text-sm text-destructive">
                {
                  errors.name
                    .message
                }
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi
            </Label>

            <Input
              id="description"
              placeholder="Deskripsi singkat produk"
              disabled={
                isSubmitting
              }
              {...register(
                "description",
              )}
            />

            {errors.description ? (
              <p className="text-sm text-destructive">
                {
                  errors
                    .description
                    .message
                }
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="unit">
                Satuan
              </Label>

              <Input
                id="unit"
                placeholder="cup"
                disabled={
                  isSubmitting
                }
                {...register(
                  "unit",
                )}
              />

              {errors.unit ? (
                <p className="text-sm text-destructive">
                  {
                    errors.unit
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">
                Harga Modal
              </Label>

              <Input
                id="costPrice"
                type="number"
                min="0"
                step="1"
                disabled={
                  isSubmitting
                }
                {...register(
                  "costPrice",
                )}
              />

              {errors.costPrice ? (
                <p className="text-sm text-destructive">
                  {
                    errors
                      .costPrice
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">
                Harga Jual
              </Label>

              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="1"
                disabled={
                  isSubmitting
                }
                {...register(
                  "sellingPrice",
                )}
              />

              {errors.sellingPrice ? (
                <p className="text-sm text-destructive">
                  {
                    errors
                      .sellingPrice
                      .message
                  }
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock">
                Stok
              </Label>

              <Input
                id="stock"
                type="number"
                min="0"
                step="0.001"
                disabled={
                  isSubmitting ||
                  !trackStock
                }
                {...register(
                  "stock",
                )}
              />

              {errors.stock ? (
                <p className="text-sm text-destructive">
                  {
                    errors.stock
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumStock">
                Stok Minimum
              </Label>

              <Input
                id="minimumStock"
                type="number"
                min="0"
                step="0.001"
                disabled={
                  isSubmitting ||
                  !trackStock
                }
                {...register(
                  "minimumStock",
                )}
              />

              {errors.minimumStock ? (
                <p className="text-sm text-destructive">
                  {
                    errors
                      .minimumStock
                      .message
                  }
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
              <input
                type="checkbox"
                checked={
                  Boolean(
                    trackStock,
                  )
                }
                disabled={
                  isSubmitting
                }
                onChange={(
                  event,
                ) => {
                  const checked =
                    event.target
                      .checked;

                  setValue(
                    "trackStock",
                    checked,
                    {
                      shouldDirty:
                        true,
                      shouldValidate:
                        true,
                    },
                  );

                  if (!checked) {
                    setValue(
                      "stock",
                      0,
                      {
                        shouldDirty:
                          true,
                        shouldValidate:
                          true,
                      },
                    );

                    setValue(
                      "minimumStock",
                      0,
                      {
                        shouldDirty:
                          true,
                        shouldValidate:
                          true,
                      },
                    );
                  }
                }}
              />

              <span className="text-sm">
                Lacak stok produk
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
              <input
                type="checkbox"
                checked={
                  Boolean(
                    isActive,
                  )
                }
                disabled={
                  isSubmitting
                }
                onChange={(
                  event,
                ) => {
                  setValue(
                    "isActive",
                    event.target
                      .checked,
                    {
                      shouldDirty:
                        true,
                      shouldValidate:
                        true,
                    },
                  );
                }}
              />

              <span className="text-sm">
                Produk aktif
              </span>
            </label>
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
              onClick={() => {
                handleOpenChange(
                  false,
                );
              }}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? "Menyimpan..."
                : "Simpan Produk"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { createTransaction } from "@/features/transactions/actions/create-transaction";
import {
  transactionSchema,
  type TransactionFormInput,
  type TransactionFormValues,
} from "@/features/transactions/schemas/transaction-schema";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateTransactionDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [serverMessage, setServerMessage] =
    useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<
    TransactionFormInput,
    unknown,
    TransactionFormValues
  >({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
      transactionDate: getTodayDate(),
    },
  });

  const selectedCategory = useWatch({
    control,
    name: "category",
  });

  async function onSubmit(
    values: TransactionFormValues,
  ) {
    setServerMessage("");

    const result = await createTransaction(values);

    if (!result.success) {
      setServerMessage(result.message);
      return;
    }

    reset({
      description: "",
      amount: 0,
      category: "",
      transactionDate: getTodayDate(),
    });

    setOpen(false);
    router.refresh();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setServerMessage("");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger
        render={
          <Button type="button">
            <Plus className="mr-2 size-4" />
            Tambah Transaksi
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Tambah Transaksi
          </DialogTitle>

          <DialogDescription>
            Isi data transaksi, kemudian simpan ke
            Supabase.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi
            </Label>

            <Input
              id="description"
              placeholder="Contoh: Penjualan kopi susu"
              disabled={isSubmitting}
              {...register("description")}
            />

            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Nominal
            </Label>

            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="18000"
              disabled={isSubmitting}
              {...register("amount")}
            />

            {errors.amount ? (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>

            <Select
              value={selectedCategory ?? ""}
              disabled={isSubmitting}
              onValueChange={(value) => {
                setValue("category", value ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Penjualan">
                  Penjualan
                </SelectItem>

                <SelectItem value="Bahan Baku">
                  Bahan Baku
                </SelectItem>

                <SelectItem value="Operasional">
                  Operasional
                </SelectItem>

                <SelectItem value="Perlengkapan">
                  Perlengkapan
                </SelectItem>
              </SelectContent>
            </Select>

            {errors.category ? (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionDate">
              Tanggal transaksi
            </Label>

            <Input
              id="transactionDate"
              type="date"
              disabled={isSubmitting}
              {...register("transactionDate")}
            />

            {errors.transactionDate ? (
              <p className="text-sm text-destructive">
                {errors.transactionDate.message}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                handleOpenChange(false)
              }
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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
import { updateTransaction } from "@/features/transactions/actions/update-transaction";
import {
  transactionSchema,
  type TransactionFormInput,
  type TransactionFormValues,
} from "@/features/transactions/schemas/transaction-schema";

type EditTransactionDialogProps = {
  transaction: {
    id: number;
    description: string;
    amount: number;
    category: string;
    transactionDate: string;
  };
};

export function EditTransactionDialog({
  transaction,
}: EditTransactionDialogProps) {
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
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      transactionDate:
        transaction.transactionDate,
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

    const result = await updateTransaction({
      id: transaction.id,
      ...values,
    });

    if (!result.success) {
      setServerMessage(result.message);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setServerMessage("");

    if (nextOpen) {
      reset({
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        transactionDate:
          transaction.transactionDate,
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Edit ${transaction.description}`}
          >
            <Pencil className="size-4" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Transaksi
          </DialogTitle>

          <DialogDescription>
            Ubah data transaksi kemudian simpan
            perubahan.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label
              htmlFor={`description-${transaction.id}`}
            >
              Deskripsi
            </Label>

            <Input
              id={`description-${transaction.id}`}
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
            <Label
              htmlFor={`amount-${transaction.id}`}
            >
              Nominal
            </Label>

            <Input
              id={`amount-${transaction.id}`}
              type="number"
              min="1"
              step="1"
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
            <Label
              htmlFor={`transaction-date-${transaction.id}`}
            >
              Tanggal transaksi
            </Label>

            <Input
              id={`transaction-date-${transaction.id}`}
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
                : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
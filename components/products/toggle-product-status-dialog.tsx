"use client";

import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
} from "lucide-react";
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
import { toggleProductStatus } from "@/features/products/actions/toggle-product-status";

type ToggleProductStatusDialogProps = {
  product: {
    id: number;
    name: string;
    isActive: boolean;
  };
};

export function ToggleProductStatusDialog({
  product,
}: ToggleProductStatusDialogProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    serverMessage,
    setServerMessage,
  ] = useState("");

  const nextStatus =
    !product.isActive;

  async function handleToggleStatus() {
    setIsSubmitting(true);
    setServerMessage("");

    try {
      const result =
        await toggleProductStatus({
          id: product.id,
          isActive: nextStatus,
        });

      if (!result.success) {
        setServerMessage(
          result.message,
        );
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setServerMessage(
        "Terjadi kesalahan saat memperbarui status produk.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (isSubmitting) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      setServerMessage("");
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              product.isActive
                ? `Nonaktifkan ${product.name}`
                : `Aktifkan ${product.name}`
            }
          >
            {product.isActive ? (
              <Archive className="size-4" />
            ) : (
              <ArchiveRestore className="size-4" />
            )}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product.isActive
              ? "Nonaktifkan Produk"
              : "Aktifkan Produk"}
          </DialogTitle>

          <DialogDescription>
            {product.isActive
              ? `Produk "${product.name}" tidak akan ditampilkan sebagai produk aktif.`
              : `Produk "${product.name}" akan diaktifkan kembali.`}
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            variant={
              product.isActive
                ? "destructive"
                : "default"
            }
            disabled={
              isSubmitting
            }
            onClick={
              handleToggleStatus
            }
          >
            {isSubmitting
              ? "Memproses..."
              : product.isActive
                ? "Nonaktifkan"
                : "Aktifkan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
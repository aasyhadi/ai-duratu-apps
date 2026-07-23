"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  FilePlus2,
  LoaderCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  Button,
} from "@/components/ui/button";

import {
  createPurchaseOrder,
} from "@/features/purchase-orders/actions/create-purchase-order";

type CreatePurchaseOrderButtonProps = {
  purchaseRequestId: number;
  expectedDate: string | null;
  notes: string | null;
  disabled?: boolean;
};

function getTodayDate(): string {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

export function CreatePurchaseOrderButton({
  purchaseRequestId,
  expectedDate,
  notes,
  disabled = false,
}: CreatePurchaseOrderButtonProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  function handleCreatePurchaseOrder(): void {
    setErrorMessage(
      null,
    );

    startTransition(
      async () => {
        const result =
          await createPurchaseOrder({
            purchaseRequestId,

            orderDate:
              getTodayDate(),

            expectedDate:
              expectedDate ??
              "",

            notes:
              notes ??
              "",

            discountAmount:
              0,

            taxAmount:
              0,
          });

        if (!result.success) {
          setErrorMessage(
            result.message,
          );

          return;
        }

        if (
          !result.data
            ?.purchaseOrderId
        ) {
          setErrorMessage(
            "Purchase Order berhasil diproses, tetapi ID Purchase Order tidak ditemukan.",
          );

          return;
        }

        router.push(
          `/purchase-orders/${result.data.purchaseOrderId}`,
        );

        router.refresh();
      },
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={
          handleCreatePurchaseOrder
        }
        disabled={
          disabled ||
          isPending
        }
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <FilePlus2 className="size-4" />
        )}

        {isPending
          ? "Membuat Purchase Order..."
          : "Buat Purchase Order"}
      </Button>

      {errorMessage ? (
        <p className="max-w-sm text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
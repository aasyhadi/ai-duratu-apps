"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Loader2,
  PackageCheck,
  Send,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  updatePurchaseOrderStatus,
} from "@/features/purchase-orders/actions/update-purchase-order-status";

import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

type Props = {
  purchaseOrderId: number;
  status: PurchaseOrderStatus;
};

export function PurchaseOrderStatusActions({
  purchaseOrderId,
  status,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [reason, setReason] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  async function execute(
    action:
      | "send"
      | "confirm"
      | "cancel",
  ) {
    setError(null);

    startTransition(async () => {
      const result =
        await updatePurchaseOrderStatus(
          action === "cancel"
            ? {
                purchaseOrderId,
                action,
                cancellationReason:
                  reason,
              }
            : {
                purchaseOrderId,
                action,
              },
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">

      {status === "draft" && (
        <Button
          className="w-full"
          disabled={isPending}
          onClick={() =>
            execute("send")
          }
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Kirim Purchase Order
            </>
          )}
        </Button>
      )}

      {status === "sent" && (
        <Button
          className="w-full"
          disabled={isPending}
          onClick={() =>
            execute("confirm")
          }
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Konfirmasi Purchase Order
            </>
          )}
        </Button>
      )}

      {(status === "draft" ||
        status === "sent" ||
        status === "confirmed") && (
        <>
          <Textarea
            placeholder="Alasan pembatalan"
            value={reason}
            disabled={isPending}
            onChange={(e) =>
              setReason(
                e.target.value,
              )
            }
          />

          <Button
            variant="destructive"
            className="w-full"
            disabled={isPending}
            onClick={() =>
              execute("cancel")
            }
          >
            <XCircle className="size-4" />
            Batalkan Purchase Order
          </Button>
        </>
      )}

      {status === "confirmed" && (
        <Button
          className="w-full"
          disabled
        >
          <PackageCheck className="size-4" />
          Ready Receive Goods
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
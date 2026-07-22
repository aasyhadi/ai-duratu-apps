"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import {
  approvePurchaseRequest,
} from "@/features/purchases/actions/approve-purchase-request";

type ApprovePurchaseRequestButtonProps = {
  requestId: number;
  disabled?: boolean;
};

export function ApprovePurchaseRequestButton({
  requestId,
  disabled = false,
}: ApprovePurchaseRequestButtonProps) {
  const router =
    useRouter();

  const [
    isApproving,
    setIsApproving,
  ] = useState(false);

  async function handleApprove() {
    const confirmed =
      window.confirm(
        "Setujui permintaan pembelian ini?",
      );

    if (!confirmed) {
      return;
    }

    setIsApproving(true);

    try {
      const result =
        await approvePurchaseRequest(
          requestId,
        );

      window.alert(
        result.message,
      );

      if (!result.success) {
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Approve purchase request button failed:",
        error,
      );

      window.alert(
        "Terjadi kesalahan saat menyetujui permintaan pembelian.",
      );
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <button
      type="button"
      disabled={
        disabled ||
        isApproving
      }
      onClick={
        handleApprove
      }
      className="
        inline-flex
        min-h-10
        items-center
        justify-center
        gap-2
        rounded-md
        bg-primary
        px-4
        py-2
        text-sm
        font-medium
        text-primary-foreground
        transition-colors
        hover:bg-primary/90
        disabled:pointer-events-none
        disabled:opacity-50
      "
    >
      {isApproving ? (
        <>
          <LoaderCircle
            className="size-4 animate-spin"
            aria-hidden="true"
          />

          Menyetujui...
        </>
      ) : (
        <>
          <CheckCircle2
            className="size-4"
            aria-hidden="true"
          />

          Setujui
        </>
      )}
    </button>
  );
}
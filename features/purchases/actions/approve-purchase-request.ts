"use server";

import { revalidatePath } from "next/cache";

import type { PurchaseRequestStatus } from "@/features/purchases/types/purchase-request";
import type { ActionState } from "@/features/shared/types/action-state";

import { toSafeNumber } from "@/features/shared/utils/number";
import { createClient } from "@/lib/supabase/server";

type ApprovePurchaseRequestResult = {
  requestId: number;
  requestNumber: string;
  previousStatus: PurchaseRequestStatus;
  currentStatus: PurchaseRequestStatus;
  estimatedTotal: number;
};

export type ApprovePurchaseRequestState =
  ActionState<ApprovePurchaseRequestResult>;

type ApprovePurchaseRequestRpcRow = {
  request_id: number | string;
  request_number: string;
  previous_status: PurchaseRequestStatus;
  current_status: PurchaseRequestStatus;
  estimated_total: number | string;
};

export async function approvePurchaseRequest(
  requestId: number,
): Promise<ApprovePurchaseRequestState> {
  if (
    !Number.isInteger(requestId) ||
    requestId < 1
  ) {
    return {
      success: false,
      message:
        "ID permintaan pembelian tidak valid.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "approve_purchase_request",
    {
      p_request_id:
        requestId,
    },
  );

  if (error) {
    console.error(
      "Approve purchase request failed:",
      error,
    );

    return {
      success: false,
      message:
        error.message ||
        "Permintaan pembelian gagal disetujui.",
    };
  }

  const result =
    (
      data as
        | ApprovePurchaseRequestRpcRow[]
        | null
    )?.[0];

  if (!result) {
    return {
      success: false,
      message:
        "Hasil persetujuan permintaan pembelian tidak ditemukan.",
    };
  }

  revalidatePath(
    "/purchases",
  );

  revalidatePath(
    `/purchases/${requestId}`,
  );

  revalidatePath(
    `/purchases/${requestId}/edit`,
  );

  revalidatePath(
    "/dashboard",
  );

  return {
    success: true,

    message:
      "Permintaan pembelian berhasil disetujui.",

    data: {
      requestId:
        toSafeNumber(
          result.request_id,
        ),

      requestNumber:
        result.request_number,

      previousStatus:
        result.previous_status,

      currentStatus:
        result.current_status,

      estimatedTotal:
        toSafeNumber(
          result.estimated_total,
        ),
    },
  };
}
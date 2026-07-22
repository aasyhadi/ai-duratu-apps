"use server";

import { revalidatePath } from "next/cache";

import { rejectPurchaseRequestSchema } from "@/features/purchases/schemas/reject-purchase-request-schema";

import type { PurchaseRequestStatus } from "@/features/purchases/types/purchase-request";
import type { ActionState } from "@/features/shared/types/action-state";

import { toSafeNumber } from "@/features/shared/utils/number";
import { createClient } from "@/lib/supabase/server";

type RejectPurchaseRequestResult = {
  requestId: number;
  requestNumber: string;
  previousStatus: PurchaseRequestStatus;
  currentStatus: PurchaseRequestStatus;
  rejectionReason: string;
  rejectedAt: string;
};

export type RejectPurchaseRequestState =
  ActionState<RejectPurchaseRequestResult>;

type RejectPurchaseRequestRpcRow = {
  request_id: number | string;
  request_number: string;
  previous_status: PurchaseRequestStatus;
  current_status: PurchaseRequestStatus;
  rejection_reason: string;
  rejected_at: string;
};

export async function rejectPurchaseRequest(
  requestId: number,
  values: unknown,
): Promise<RejectPurchaseRequestState> {
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

  const validationResult =
    rejectPurchaseRequestSchema.safeParse(
      values,
    );

  if (!validationResult.success) {
    return {
      success: false,

      message:
        "Data penolakan belum valid.",

      fieldErrors:
        validationResult.error
          .flatten()
          .fieldErrors,
    };
  }

  const {
    rejectionReason,
  } = validationResult.data;

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "reject_purchase_request",
    {
      p_request_id:
        requestId,

      p_rejection_reason:
        rejectionReason,
    },
  );

  if (error) {
    console.error(
      "Reject purchase request failed:",
      error,
    );

    return {
      success: false,

      message:
        error.message ||
        "Permintaan pembelian gagal ditolak.",
    };
  }

  const result =
    (
      data as
        | RejectPurchaseRequestRpcRow[]
        | null
    )?.[0];

  if (!result) {
    return {
      success: false,

      message:
        "Hasil penolakan permintaan pembelian tidak ditemukan.",
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
      "Permintaan pembelian berhasil ditolak.",

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

      rejectionReason:
        result.rejection_reason,

      rejectedAt:
        result.rejected_at,
    },
  };
}
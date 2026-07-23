"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionState,
} from "@/features/shared/types/action-state";

import {
  createClient,
} from "@/lib/supabase/server";

type SendPurchaseOrderResult = {
  purchaseOrderId: number;
  orderNumber: string;
  status: "sent";
  sentAt: string;
};

export type SendPurchaseOrderState =
  ActionState<SendPurchaseOrderResult>;

type PurchaseOrderValidationRow = {
  id: number;
  order_number: string;
  status: string;
  sent_at: string | null;
};

export async function sendPurchaseOrder(
  purchaseOrderId: number,
): Promise<SendPurchaseOrderState> {
  if (
    !Number.isInteger(
      purchaseOrderId,
    ) ||
    purchaseOrderId < 1
  ) {
    return {
      success: false,
      message:
        "ID Purchase Order tidak valid.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: purchaseOrderData,
    error: purchaseOrderError,
  } = await supabase
    .from(
      "purchase_orders",
    )
    .select(
      `
        id,
        order_number,
        status,
        sent_at
      `,
    )
    .eq(
      "id",
      purchaseOrderId,
    )
    .maybeSingle();

  if (purchaseOrderError) {
    console.error(
      "Validate purchase order before send failed:",
      purchaseOrderError,
    );

    return {
      success: false,
      message:
        "Purchase Order gagal divalidasi.",
    };
  }

  if (!purchaseOrderData) {
    return {
      success: false,
      message:
        "Purchase Order tidak ditemukan.",
    };
  }

  const purchaseOrder =
    purchaseOrderData as PurchaseOrderValidationRow;

  if (
    purchaseOrder.status !==
    "draft"
  ) {
    return {
      success: false,
      message:
        `Purchase Order ${purchaseOrder.order_number} tidak dapat dikirim karena statusnya ${purchaseOrder.status}.`,
    };
  }

  const sentAt =
    new Date().toISOString();

  const {
    data: updatedPurchaseOrderData,
    error: updateError,
  } = await supabase
    .from(
      "purchase_orders",
    )
    .update({
      status: "sent",
      sent_at: sentAt,
      updated_at: sentAt,
    })
    .eq(
      "id",
      purchaseOrderId,
    )
    .eq(
      "status",
      "draft",
    )
    .select(
      `
        id,
        order_number,
        status,
        sent_at
      `,
    )
    .maybeSingle();

  if (updateError) {
    console.error(
      "Send purchase order failed:",
      updateError,
    );

    return {
      success: false,
      message:
        updateError.message ||
        "Purchase Order gagal dikirim.",
    };
  }

  if (!updatedPurchaseOrderData) {
    return {
      success: false,
      message:
        "Purchase Order tidak dapat dikirim. Status dokumen mungkin sudah berubah.",
    };
  }

  const updatedPurchaseOrder =
    updatedPurchaseOrderData as PurchaseOrderValidationRow;

  if (
    updatedPurchaseOrder.status !==
      "sent" ||
    !updatedPurchaseOrder.sent_at
  ) {
    return {
      success: false,
      message:
        "Status Purchase Order tidak berhasil diperbarui.",
    };
  }

  revalidatePath(
    "/purchase-orders",
  );

  revalidatePath(
    `/purchase-orders/${purchaseOrderId}`,
  );

  revalidatePath(
    "/dashboard",
  );

  return {
    success: true,
    message:
      `Purchase Order ${updatedPurchaseOrder.order_number} berhasil dikirim.`,

    data: {
      purchaseOrderId:
        updatedPurchaseOrder.id,

      orderNumber:
        updatedPurchaseOrder.order_number,

      status: "sent",

      sentAt:
        updatedPurchaseOrder.sent_at,
    },
  };
}
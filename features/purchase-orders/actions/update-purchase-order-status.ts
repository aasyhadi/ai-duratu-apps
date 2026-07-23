"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  z,
} from "zod";

import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import {
  createClient,
} from "@/lib/supabase/server";

const purchaseOrderStatusActionSchema =
  z.discriminatedUnion(
    "action",
    [
      z.object({
        purchaseOrderId:
          z.coerce
            .number<number>()
            .int(
              "ID Purchase Order harus berupa bilangan bulat.",
            )
            .positive(
              "ID Purchase Order tidak valid.",
            ),

        action:
          z.literal("send"),
      }),

      z.object({
        purchaseOrderId:
          z.coerce
            .number<number>()
            .int(
              "ID Purchase Order harus berupa bilangan bulat.",
            )
            .positive(
              "ID Purchase Order tidak valid.",
            ),

        action:
          z.literal("confirm"),
      }),

      z.object({
        purchaseOrderId:
          z.coerce
            .number<number>()
            .int(
              "ID Purchase Order harus berupa bilangan bulat.",
            )
            .positive(
              "ID Purchase Order tidak valid.",
            ),

        action:
          z.literal("cancel"),

        cancellationReason:
          z
            .string()
            .trim()
            .min(
              3,
              "Alasan pembatalan minimal 3 karakter.",
            )
            .max(
              500,
              "Alasan pembatalan maksimal 500 karakter.",
            ),
      }),
    ],
  );

export type PurchaseOrderStatusAction =
  z.infer<
    typeof purchaseOrderStatusActionSchema
  >;

export type UpdatePurchaseOrderStatusState = {
  success: boolean;
  message: string;

  data?: {
    purchaseOrderId: number;
    previousStatus: PurchaseOrderStatus;
    currentStatus: PurchaseOrderStatus;
  };

  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
};

type PurchaseOrderValidationRow = {
  id: number;
  order_number: string;
  status: PurchaseOrderStatus;

  sent_at: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

type PurchaseOrderUpdatePayload = {
  status: PurchaseOrderStatus;
  updated_at: string;

  sent_at?: string;
  confirmed_at?: string;

  cancelled_at?: string;
  cancellation_reason?: string;
};

function getStatusLabel(
  status: PurchaseOrderStatus,
): string {
  const labels: Record<
    PurchaseOrderStatus,
    string
  > = {
    draft:
      "Draft",

    sent:
      "Terkirim",

    confirmed:
      "Dikonfirmasi",

    partial_received:
      "Diterima Sebagian",

    completed:
      "Selesai",

    cancelled:
      "Dibatalkan",
  };

  return labels[status];
}

function getAllowedCurrentStatuses(
  action:
    PurchaseOrderStatusAction["action"],
): PurchaseOrderStatus[] {
  switch (action) {
    case "send":
      return [
        "draft",
      ];

    case "confirm":
      return [
        "sent",
      ];

    case "cancel":
      return [
        "draft",
        "sent",
        "confirmed",
      ];
  }
}

function getTargetStatus(
  action:
    PurchaseOrderStatusAction["action"],
): PurchaseOrderStatus {
  switch (action) {
    case "send":
      return "sent";

    case "confirm":
      return "confirmed";

    case "cancel":
      return "cancelled";
  }
}

function getSuccessMessage(
  action:
    PurchaseOrderStatusAction["action"],
  orderNumber: string,
): string {
  switch (action) {
    case "send":
      return `Purchase Order ${orderNumber} berhasil dikirim ke supplier.`;

    case "confirm":
      return `Purchase Order ${orderNumber} berhasil dikonfirmasi.`;

    case "cancel":
      return `Purchase Order ${orderNumber} berhasil dibatalkan.`;
  }
}

export async function updatePurchaseOrderStatus(
  values: unknown,
): Promise<UpdatePurchaseOrderStatusState> {
  const validationResult =
    purchaseOrderStatusActionSchema.safeParse(
      values,
    );

  if (!validationResult.success) {
    return {
      success: false,

      message:
        "Data perubahan status Purchase Order belum valid.",

      fieldErrors:
        validationResult.error
          .flatten()
          .fieldErrors,
    };
  }

  const input =
    validationResult.data;

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "purchase_orders",
    )
    .select(
      `
        id,
        order_number,
        status,
        sent_at,
        confirmed_at,
        completed_at,
        cancelled_at
      `,
    )
    .eq(
      "id",
      input.purchaseOrderId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Validate purchase order status failed:",
      error,
    );

    return {
      success: false,

      message:
        "Purchase Order gagal divalidasi.",
    };
  }

  if (!data) {
    return {
      success: false,

      message:
        "Purchase Order tidak ditemukan.",
    };
  }

  const purchaseOrder =
    data as PurchaseOrderValidationRow;

  const allowedCurrentStatuses =
    getAllowedCurrentStatuses(
      input.action,
    );

  if (
    !allowedCurrentStatuses.includes(
      purchaseOrder.status,
    )
  ) {
    return {
      success: false,

      message:
        `Purchase Order ${purchaseOrder.order_number} dengan status ${getStatusLabel(
          purchaseOrder.status,
        )} tidak dapat menjalankan tindakan ini.`,
    };
  }

  const now =
    new Date().toISOString();

  const targetStatus =
    getTargetStatus(
      input.action,
    );

  const updatePayload:
    PurchaseOrderUpdatePayload = {
      status:
        targetStatus,

      updated_at:
        now,
    };

  if (
    input.action ===
    "send"
  ) {
    updatePayload.sent_at =
      now;
  }

  if (
    input.action ===
    "confirm"
  ) {
    updatePayload.confirmed_at =
      now;
  }

  if (
    input.action ===
    "cancel"
  ) {
    updatePayload.cancelled_at =
      now;

    updatePayload.cancellation_reason =
      input.cancellationReason;
  }

  const {
    data: updatedData,
    error: updateError,
  } = await supabase
    .from(
      "purchase_orders",
    )
    .update(
      updatePayload,
    )
    .eq(
      "id",
      purchaseOrder.id,
    )
    .eq(
      "status",
      purchaseOrder.status,
    )
    .select(
      `
        id,
        status
      `,
    )
    .maybeSingle();

  if (updateError) {
    console.error(
      "Update purchase order status failed:",
      updateError,
    );

    return {
      success: false,

      message:
        updateError.message ||
        "Status Purchase Order gagal diperbarui.",
    };
  }

  if (!updatedData) {
    return {
      success: false,

      message:
        "Status Purchase Order telah berubah. Silakan muat ulang halaman dan coba kembali.",
    };
  }

  revalidatePath(
    "/purchase-orders",
  );

  revalidatePath(
    `/purchase-orders/${purchaseOrder.id}`,
  );

  revalidatePath(
    `/purchase-orders/${purchaseOrder.id}/receive`,
  );

  revalidatePath(
    "/dashboard",
  );

  return {
    success: true,

    message:
      getSuccessMessage(
        input.action,
        purchaseOrder.order_number,
      ),

    data: {
      purchaseOrderId:
        purchaseOrder.id,

      previousStatus:
        purchaseOrder.status,

      currentStatus:
        targetStatus,
    },
  };
}
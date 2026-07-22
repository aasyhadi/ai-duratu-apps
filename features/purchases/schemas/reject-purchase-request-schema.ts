import { z } from "zod";

export const rejectPurchaseRequestSchema =
  z.object({
    rejectionReason:
      z
        .string()
        .trim()
        .min(
          5,
          "Alasan penolakan minimal 5 karakter.",
        )
        .max(
          500,
          "Alasan penolakan maksimal 500 karakter.",
        ),
  });

export type RejectPurchaseRequestInput =
  z.input<
    typeof rejectPurchaseRequestSchema
  >;

export type RejectPurchaseRequestValues =
  z.output<
    typeof rejectPurchaseRequestSchema
  >;
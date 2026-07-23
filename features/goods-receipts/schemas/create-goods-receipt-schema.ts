import {
  z,
} from "zod";

export const goodsReceiptItemSchema =
  z.object({
    purchaseOrderItemId:
      z.coerce
        .number()
        .int()
        .positive(),

    quantityReceived:
      z.coerce
        .number()
        .positive(),

    unitCost:
      z.coerce
        .number()
        .min(0),

    notes:
      z.string().trim().default(""),
  });

export const createGoodsReceiptSchema =
  z.object({
    purchaseOrderId:
      z.coerce
        .number()
        .int()
        .positive(),

    receiptDate:
      z
        .string()
        .min(1),

    referenceNumber:
      z.string().trim().default(""),

    notes:
      z.string().trim().default(""),

    items:
      z
        .array(
          goodsReceiptItemSchema,
        )
        .min(
          1,
          "Minimal satu item diterima.",
        ),
  });

export type CreateGoodsReceiptInput =
  z.infer<
    typeof createGoodsReceiptSchema
  >;
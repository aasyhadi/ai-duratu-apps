import { z } from "zod";

export const createPurchaseOrderSchema =
  z
    .object({
      purchaseRequestId:
        z.coerce
          .number()
          .int(
            "ID permintaan pembelian harus berupa bilangan bulat.",
          )
          .positive(
            "ID permintaan pembelian tidak valid.",
          ),

      orderDate:
        z
          .string()
          .trim()
          .min(
            1,
            "Tanggal Purchase Order wajib diisi.",
          )
          .refine(
            (value) =>
              !Number.isNaN(
                Date.parse(value),
              ),
            {
              message:
                "Tanggal Purchase Order tidak valid.",
            },
          ),

      expectedDate:
        z
          .string()
          .trim()
          .refine(
            (value) =>
              value.length === 0 ||
              !Number.isNaN(
                Date.parse(value),
              ),
            {
              message:
                "Tanggal kebutuhan tidak valid.",
            },
          ),

      notes:
        z
          .string()
          .trim()
          .max(
            1000,
            "Catatan maksimal 1.000 karakter.",
          ),

      discountAmount:
        z.coerce
          .number()
          .finite(
            "Nilai diskon tidak valid.",
          )
          .min(
            0,
            "Nilai diskon tidak boleh negatif.",
          ),

      taxAmount:
        z.coerce
          .number()
          .finite(
            "Nilai pajak tidak valid.",
          )
          .min(
            0,
            "Nilai pajak tidak boleh negatif.",
          ),
    })
    .superRefine(
      (
        values,
        context,
      ) => {
        if (
          values.expectedDate &&
          values.expectedDate <
            values.orderDate
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "expectedDate",
            ],

            message:
              "Tanggal kebutuhan tidak boleh lebih awal dari tanggal Purchase Order.",
          });
        }
      },
    );

export type CreatePurchaseOrderInput =
  z.input<
    typeof createPurchaseOrderSchema
  >;

export type CreatePurchaseOrderValues =
  z.output<
    typeof createPurchaseOrderSchema
  >;
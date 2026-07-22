import { z } from "zod";

export const purchaseRequestItemSchema =
  z.object({
    productId: z.coerce
      .number<number>()
      .int(
        "ID produk harus berupa bilangan bulat.",
      )
      .positive(
        "Produk tidak valid.",
      ),

    quantity: z.coerce
      .number<number>()
      .positive(
        "Jumlah pembelian harus lebih dari 0.",
      )
      .max(
        999_999,
        "Jumlah pembelian terlalu besar.",
      ),

    unitCost: z.coerce
      .number<number>()
      .min(
        0,
        "Harga satuan tidak boleh negatif.",
      )
      .max(
        999_999_999,
        "Harga satuan terlalu besar.",
      ),

    notes: z
      .string()
      .trim()
      .max(
        300,
        "Catatan item maksimal 300 karakter.",
      )
      .catch(""),
  });

export const createPurchaseRequestSchema =
  z
    .object({
      supplierId: z
        .union([
          z.coerce
            .number<number>()
            .int()
            .positive(),
          z.null(),
        ])
        .catch(null),

      requestDate: z
        .string()
        .trim()
        .min(
          1,
          "Tanggal permintaan wajib diisi.",
        ),

      expectedDate: z
        .string()
        .trim()
        .catch(""),

      notes: z
        .string()
        .trim()
        .max(
          500,
          "Catatan maksimal 500 karakter.",
        )
        .catch(""),

      items: z
        .array(
          purchaseRequestItemSchema,
        )
        .min(
          1,
          "Minimal satu produk wajib dipilih.",
        )
        .max(
          100,
          "Maksimal 100 produk dalam satu draft.",
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
            values.requestDate
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "expectedDate",
            ],
            message:
              "Tanggal kebutuhan tidak boleh sebelum tanggal permintaan.",
          });
        }

        const productIds =
          values.items.map(
            (item) =>
              item.productId,
          );

        const uniqueProductIds =
          new Set(
            productIds,
          );

        if (
          uniqueProductIds.size !==
          productIds.length
        ) {
          context.addIssue({
            code: "custom",
            path: ["items"],
            message:
              "Produk yang sama tidak boleh dimasukkan lebih dari satu kali.",
          });
        }
      },
    );

export type CreatePurchaseRequestInput =
  z.input<
    typeof createPurchaseRequestSchema
  >;

export type CreatePurchaseRequestValues =
  z.output<
    typeof createPurchaseRequestSchema
  >;
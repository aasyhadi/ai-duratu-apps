import { z } from "zod";

const optionalSkuSchema = z
  .string()
  .trim()
  .max(50, "SKU maksimal 50 karakter.")
  .transform((value) =>
    value.length === 0
      ? null
      : value.toUpperCase(),
  );

export const productSchema = z
  .object({
    categoryId: z.coerce
      .number<number>()
      .int("Kategori tidak valid.")
      .positive("Kategori wajib dipilih."),

    sku: optionalSkuSchema,

    name: z
      .string()
      .trim()
      .min(2, "Nama produk minimal 2 karakter.")
      .max(100, "Nama produk maksimal 100 karakter."),

    description: z
      .string()
      .trim()
      .max(500, "Deskripsi maksimal 500 karakter.")
      .transform((value) =>
        value.length === 0
          ? null
          : value,
      ),

    unit: z
      .string()
      .trim()
      .min(1, "Satuan wajib diisi.")
      .max(20, "Satuan maksimal 20 karakter."),

    costPrice: z.coerce
      .number<number>()
      .min(0, "Harga modal tidak boleh negatif.")
      .max(
        999_999_999,
        "Harga modal terlalu besar.",
      ),

    sellingPrice: z.coerce
      .number<number>()
      .min(0, "Harga jual tidak boleh negatif.")
      .max(
        999_999_999,
        "Harga jual terlalu besar.",
      ),

    stock: z.coerce
      .number<number>()
      .min(0, "Stok tidak boleh negatif.")
      .max(999_999, "Stok terlalu besar."),

    minimumStock: z.coerce
      .number<number>()
      .min(
        0,
        "Stok minimum tidak boleh negatif.",
      )
      .max(
        999_999,
        "Stok minimum terlalu besar.",
      ),

    trackStock: z.boolean(),

    isActive: z.boolean(),
  })
  .superRefine((values, context) => {
    if (
      values.sellingPrice <
      values.costPrice
    ) {
      context.addIssue({
        code: "custom",
        path: ["sellingPrice"],
        message:
          "Harga jual lebih rendah daripada harga modal.",
      });
    }
  });

export const updateProductSchema =
  productSchema.extend({
    id: z.coerce
      .number<number>()
      .int("ID produk harus berupa bilangan bulat.")
      .positive("ID produk tidak valid."),
  });

export type ProductFormInput = z.input<
  typeof productSchema
>;

export type ProductFormValues = z.output<
  typeof productSchema
>;
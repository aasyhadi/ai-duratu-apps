import { z } from "zod";

export const transactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Deskripsi minimal 3 karakter.")
    .max(100, "Deskripsi maksimal 100 karakter."),

  amount: z.coerce
    .number()
    .positive("Nominal harus lebih dari 0.")
    .max(999_999_999, "Nominal terlalu besar."),

  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib dipilih."),

  transactionDate: z
    .string()
    .min(1, "Tanggal transaksi wajib diisi."),
});

export const updateTransactionSchema =
  transactionSchema.extend({
    id: z.coerce
      .number()
      .int("ID transaksi harus berupa bilangan bulat.")
      .positive("ID transaksi tidak valid."),
  });

export type TransactionFormInput = z.input<
  typeof transactionSchema
>;

export type TransactionFormValues = z.output<
  typeof transactionSchema
>;
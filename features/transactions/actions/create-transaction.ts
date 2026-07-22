"use server";

import { revalidatePath } from "next/cache";

import { transactionSchema } from "@/features/transactions/schemas/transaction-schema";
import { createClient } from "@/lib/supabase/server";

export type CreateTransactionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createTransaction(
  values: unknown,
): Promise<CreateTransactionState> {
  const validationResult = transactionSchema.safeParse(values);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Data transaksi belum valid.",
      fieldErrors:
        validationResult.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { description, amount, category, transactionDate } =
    validationResult.data;

  const { error } = await supabase.from("transactions").insert({
    description,
    amount,
    category,
    transaction_date: transactionDate,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Transaksi berhasil ditambahkan.",
  };
}
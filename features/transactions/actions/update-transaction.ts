"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { updateTransactionSchema } from "@/features/transactions/schemas/transaction-schema";

export type UpdateTransactionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateTransaction(
  values: unknown,
): Promise<UpdateTransactionState> {
  const validationResult =
    updateTransactionSchema.safeParse(values);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Data transaksi belum valid.",
      fieldErrors:
        validationResult.error.flatten().fieldErrors,
    };
  }

  const {
    id,
    description,
    amount,
    category,
    transactionDate,
  } = validationResult.data;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .update({
      description,
      amount,
      category,
      transaction_date: transactionDate,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "Transaksi tidak ditemukan atau tidak dapat diperbarui.",
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Transaksi berhasil diperbarui.",
  };
}
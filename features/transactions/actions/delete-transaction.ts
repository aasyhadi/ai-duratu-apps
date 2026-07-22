"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const deleteTransactionSchema = z.object({
  id: z.coerce
    .number<number>()
    .int("ID transaksi harus berupa bilangan bulat.")
    .positive("ID transaksi tidak valid."),
});

export type DeleteTransactionState = {
  success: boolean;
  message: string;
};

export async function deleteTransaction(
  transactionId: number,
): Promise<DeleteTransactionState> {
  const validationResult = deleteTransactionSchema.safeParse({
    id: transactionId,
  });

  if (!validationResult.success) {
    return {
      success: false,
      message: "ID transaksi tidak valid.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", validationResult.data.id);

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
    message: "Transaksi berhasil dihapus.",
  };
}
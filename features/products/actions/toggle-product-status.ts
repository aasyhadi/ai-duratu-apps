"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const toggleProductStatusSchema =
  z.object({
    id: z.coerce
      .number<number>()
      .int(
        "ID produk harus berupa bilangan bulat.",
      )
      .positive(
        "ID produk tidak valid.",
      ),

    isActive: z.boolean(),
  });

export type ToggleProductStatusState = {
  success: boolean;
  message: string;
};

export async function toggleProductStatus(
  values: unknown,
): Promise<ToggleProductStatusState> {
  const validationResult =
    toggleProductStatusSchema.safeParse(
      values,
    );

  if (!validationResult.success) {
    return {
      success: false,
      message:
        "Data status produk tidak valid.",
    };
  }

  const {
    id,
    isActive,
  } = validationResult.data;

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .update({
      is_active:
        isActive,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      message:
        error.message,
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "Produk tidak ditemukan.",
    };
  }

  revalidatePath(
    "/products",
  );

  revalidatePath(
    "/dashboard",
  );

  return {
    success: true,

    message: isActive
      ? "Produk berhasil diaktifkan."
      : "Produk berhasil dinonaktifkan.",
  };
}
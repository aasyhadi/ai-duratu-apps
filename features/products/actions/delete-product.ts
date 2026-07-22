"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const deleteProductSchema =
  z.object({
    id: z.coerce
      .number<number>()
      .int(
        "ID produk harus berupa bilangan bulat.",
      )
      .positive(
        "ID produk tidak valid.",
      ),
  });

export type DeleteProductState = {
  success: boolean;
  message: string;
};

export async function deleteProduct(
  productId: number,
): Promise<DeleteProductState> {
  const validationResult =
    deleteProductSchema.safeParse({
      id: productId,
    });

  if (!validationResult.success) {
    return {
      success: false,
      message:
        "ID produk tidak valid.",
    };
  }

  const supabase =
    await createClient();

  const {
    count: saleItemCount,
    error: saleItemError,
  } = await supabase
    .from("sale_items")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq(
      "product_id",
      validationResult.data.id,
    );

  if (saleItemError) {
    return {
      success: false,
      message:
        saleItemError.message,
    };
  }

  if (
    (saleItemCount ?? 0) > 0
  ) {
    const { error } =
      await supabase
        .from("products")
        .update({
          is_active: false,
        })
        .eq(
          "id",
          validationResult
            .data.id,
        );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath(
      "/products",
    );

    return {
      success: true,
      message:
        "Produk sudah memiliki riwayat penjualan sehingga dinonaktifkan, bukan dihapus.",
    };
  }

  const { error } =
    await supabase
      .from("products")
      .delete()
      .eq(
        "id",
        validationResult.data.id,
      );

  if (error) {
    if (
      error.code === "23503"
    ) {
      return {
        success: false,
        message:
          "Produk masih memiliki riwayat stok sehingga belum dapat dihapus.",
      };
    }

    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");

  return {
    success: true,
    message:
      "Produk berhasil dihapus.",
  };
}
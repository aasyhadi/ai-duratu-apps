"use server";

import { revalidatePath } from "next/cache";

import { updateProductSchema } from "@/features/products/schemas/product-schema";
import { createClient } from "@/lib/supabase/server";

export type UpdateProductState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
};

type ExistingProductRow = {
  id: number;
  stock: number | string;
  cost_price: number | string;
};

export async function updateProduct(
  values: unknown,
): Promise<UpdateProductState> {
  const validationResult =
    updateProductSchema.safeParse(
      values,
    );

  if (!validationResult.success) {
    return {
      success: false,
      message:
        "Data produk belum valid.",
      fieldErrors:
        validationResult.error
          .flatten().fieldErrors,
    };
  }

  const {
    id,
    categoryId,
    sku,
    name,
    description,
    unit,
    costPrice,
    sellingPrice,
    stock,
    minimumStock,
    trackStock,
    isActive,
  } = validationResult.data;

  const supabase =
    await createClient();

  const {
    data: existingData,
    error: existingError,
  } = await supabase
    .from("products")
    .select(
      "id, stock, cost_price",
    )
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      message:
        existingError.message,
    };
  }

  if (!existingData) {
    return {
      success: false,
      message:
        "Produk tidak ditemukan.",
    };
  }

  const existing =
    existingData as ExistingProductRow;

  const previousStock =
    Number(existing.stock);

  const stockDifference =
    stock - previousStock;

  const {
    data: updatedProduct,
    error,
  } = await supabase
    .from("products")
    .update({
      category_id:
        categoryId,
      sku,
      name,
      description,
      unit,
      cost_price:
        costPrice,
      selling_price:
        sellingPrice,
      stock,
      minimum_stock:
        minimumStock,
      track_stock:
        trackStock,
      is_active:
        isActive,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (
      error.code === "23505"
    ) {
      return {
        success: false,
        message:
          "SKU sudah digunakan oleh produk lain.",
      };
    }

    return {
      success: false,
      message: error.message,
    };
  }

  if (!updatedProduct) {
    return {
      success: false,
      message:
        "Produk tidak ditemukan atau tidak dapat diperbarui.",
    };
  }

  if (
    trackStock &&
    stockDifference !== 0
  ) {
    const {
      error: movementError,
    } = await supabase
      .from(
        "inventory_movements",
      )
      .insert({
        product_id: id,

        movement_type:
          stockDifference > 0
            ? "adjustment_in"
            : "adjustment_out",

        quantity:
          Math.abs(
            stockDifference,
          ),

        unit_cost:
          costPrice,

        reference_number:
          `ADJUSTMENT-${Date.now()}`,

        notes:
          `Penyesuaian stok dari ${previousStock} menjadi ${stock}.`,
      });

    if (movementError) {
      console.error(
        "Create inventory adjustment failed:",
        movementError,
      );
    }
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");

  return {
    success: true,
    message:
      "Produk berhasil diperbarui.",
  };
}
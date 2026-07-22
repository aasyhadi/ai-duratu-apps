"use server";

import { revalidatePath } from "next/cache";

import { productSchema } from "@/features/products/schemas/product-schema";
import { createClient } from "@/lib/supabase/server";

export type CreateProductState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
};

export async function createProduct(
  values: unknown,
): Promise<CreateProductState> {
  const validationResult =
    productSchema.safeParse(values);

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
    data: product,
    error,
  } = await supabase
    .from("products")
    .insert({
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
    .select("id")
    .single();

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

  if (
    trackStock &&
    stock > 0
  ) {
    const {
      error: movementError,
    } = await supabase
      .from(
        "inventory_movements",
      )
      .insert({
        product_id:
          product.id,
        movement_type:
          "initial_stock",
        quantity: stock,
        unit_cost:
          costPrice,
        reference_number:
          `INITIAL-${product.id}`,
        notes:
          "Stok awal saat produk dibuat.",
      });

    if (movementError) {
      console.error(
        "Create initial inventory movement failed:",
        movementError,
      );
    }
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");

  return {
    success: true,
    message:
      "Produk berhasil ditambahkan.",
  };
}
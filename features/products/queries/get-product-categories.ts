import { createClient } from "@/lib/supabase/server";

import type { ProductCategory } from "@/features/products/types/product";

type ProductCategoryRow = {
  id: number;
  name: string;
};

export async function getProductCategories(): Promise<
  ProductCategory[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("product_categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Get product categories failed:",
      error,
    );

    throw new Error(
      "Kategori produk gagal diambil.",
    );
  }

  return (
    (data ?? []) as ProductCategoryRow[]
  ).map((category) => ({
    id: category.id,
    name: category.name,
  }));
}
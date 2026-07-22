import {
  AlertTriangle,
  Archive,
  Boxes,
  Package,
  PackageX,
  TrendingUp,
} from "lucide-react";

import { CreateProductDialog } from "@/components/products/create-product-dialog";
import { EditProductDialog } from "@/components/products/edit-product-dialog";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductPagination } from "@/components/products/product-pagination";
import { ProductSearch } from "@/components/products/product-search";
import { ToggleProductStatusDialog } from "@/components/products/toggle-product-status-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProducts }
from "@/features/products/queries/get-products";

import { getProductCategories }
from "@/features/products/queries/get-product-categories";

import {
    formatProductCurrency,
    formatProductPercentage,
    formatProductQuantity,
    getProductStockStatusClassName,
    getProductStockStatusLabel,
}
from "@/features/products/utils/product-formatters";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    stock?: string;
    active?: string;
  }>;
};

function normalizePage(value?: string): number {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const page = normalizePage(params.page);

  const [categories, productResult] = await Promise.all([
    getProductCategories(),

    getProducts({
      page,
      search: params.search,
      category: params.category,
      stockStatus: params.stock,
      activeStatus: params.active,
    }),
  ]);

  const { summary } = productResult;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Produk
          </h1>

          <p className="text-muted-foreground">
            Kelola produk, harga, margin, dan persediaan
            Duratu Kafe.
          </p>
        </div>

        <CreateProductDialog categories={categories} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Produk
            </CardTitle>

            <Package className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalProducts}
            </div>

            <p className="text-xs text-muted-foreground">
              {summary.activeProducts} aktif,{" "}
              {summary.inactiveProducts} nonaktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Persediaan
            </CardTitle>

            <Boxes className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatProductCurrency(
                summary.inventoryCostValue,
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Berdasarkan harga modal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Potensi Laba
            </CardTitle>

            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatProductCurrency(
                summary.potentialGrossProfit,
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Nilai jual dikurangi modal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peringatan Stok
            </CardTitle>

            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {summary.lowStockProducts +
                summary.outOfStockProducts}
            </div>

            <p className="text-xs text-muted-foreground">
              {summary.lowStockProducts} menipis,{" "}
              {summary.outOfStockProducts} habis
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Daftar Produk</CardTitle>

            <CardDescription>
              Cari, filter, dan kelola produk Duratu Kafe.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <ProductSearch
              key={params.search ?? ""}
              defaultValue={params.search ?? ""}
            />

            <ProductFilters
              categories={categories}
              selectedCategory={
                params.category ?? "all"
              }
              selectedStock={
                params.stock ?? "all"
              }
              selectedActive={
                params.active ?? "all"
              }
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {productResult.products.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
              <PackageX className="size-10 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  Produk tidak ditemukan
                </p>

                <p className="text-sm text-muted-foreground">
                  Tambahkan produk baru atau ubah filter
                  pencarian.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">
                      Produk
                    </th>

                    <th className="p-3">
                      Kategori
                    </th>

                    <th className="p-3 text-right">
                      Modal
                    </th>

                    <th className="p-3 text-right">
                      Harga Jual
                    </th>

                    <th className="p-3 text-right">
                      Margin
                    </th>

                    <th className="p-3 text-right">
                      Stok
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {productResult.products.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className={
                          product.isActive
                            ? "border-b last:border-0"
                            : "border-b bg-muted/30 opacity-70 last:border-0"
                        }
                      >
                        <td className="p-3">
                          <div className="font-medium">
                            {product.name}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {product.sku ??
                              "Tanpa SKU"}
                          </div>
                        </td>

                        <td className="p-3">
                          {product.categoryName ?? "-"}
                        </td>

                        <td className="p-3 text-right">
                          {formatProductCurrency(
                            product.costPrice,
                          )}
                        </td>

                        <td className="p-3 text-right">
                          {formatProductCurrency(
                            product.sellingPrice,
                          )}
                        </td>

                        <td className="p-3 text-right">
                          {formatProductPercentage(
                            product.grossMarginPercentage,
                          )}
                        </td>

                        <td className="p-3 text-right">
                          {formatProductQuantity(
                            product.stock,
                          )}{" "}
                          {product.unit}
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                "inline-flex rounded-full border px-2 py-1 text-xs font-medium",
                                getProductStockStatusClassName(
                                  product.stockStatus,
                                ),
                              ].join(" ")}
                            >
                              {getProductStockStatusLabel(
                                product.stockStatus,
                              )}
                            </span>

                            {!product.isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-muted-foreground">
                                <Archive className="size-3" />
                                Nonaktif
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <EditProductDialog
                              product={product}
                              categories={categories}
                            />

                            <ToggleProductStatusDialog
                              product={{
                                id: product.id,
                                name: product.name,
                                isActive:
                                  product.isActive,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          <ProductPagination
            currentPage={
              productResult.currentPage
            }
            totalPages={
              productResult.totalPages
            }
            totalItems={
              productResult.totalItems
            }
            pageSize={
              productResult.pageSize
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
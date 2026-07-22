"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_ACTIVE_STATUS_OPTIONS,
  PRODUCT_STOCK_STATUS_OPTIONS,
} from "@/features/products/constants/product-constants";
import type { ProductCategory } from "@/features/products/types/product";

type ProductFiltersProps = {
  categories: ProductCategory[];
  selectedCategory?: string;
  selectedStock?: string;
  selectedActive?: string;
};

export function ProductFilters({
  categories,
  selectedCategory = "all",
  selectedStock = "all",
  selectedActive = "all",
}: ProductFiltersProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function updateFilter(
    key: "category" | "stock" | "active",
    value: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      value === "all" ||
      !value
    ) {
      params.delete(key);
    } else {
      params.set(
        key,
        value,
      );
    }

    params.delete("page");

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
  }

  function resetFilters() {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.delete(
      "category",
    );

    params.delete(
      "stock",
    );

    params.delete(
      "active",
    );

    params.delete(
      "page",
    );

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
  }

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedStock !== "all" ||
    selectedActive !== "all";

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto">
      <Select
        value={
          selectedCategory
        }
        onValueChange={(
          value,
        ) => {
          updateFilter(
            "category",
            value ?? "all",
          );
        }}
      >
        <SelectTrigger className="w-full sm:w-[190px]">
          <SelectValue placeholder="Semua kategori" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            Semua kategori
          </SelectItem>

          {categories.map(
            (
              category,
            ) => (
              <SelectItem
                key={
                  category.id
                }
                value={String(
                  category.id,
                )}
              >
                {
                  category.name
                }
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Select
        value={
          selectedStock
        }
        onValueChange={(
          value,
        ) => {
          updateFilter(
            "stock",
            value ?? "all",
          );
        }}
      >
        <SelectTrigger className="w-full sm:w-[190px]">
          <SelectValue placeholder="Semua stok" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            Semua stok
          </SelectItem>

          {PRODUCT_STOCK_STATUS_OPTIONS.map(
            (
              option,
            ) => (
              <SelectItem
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      <Select
        value={
          selectedActive
        }
        onValueChange={(
          value,
        ) => {
          updateFilter(
            "active",
            value ?? "all",
          );
        }}
      >
        <SelectTrigger className="w-full sm:w-[190px]">
          <SelectValue placeholder="Semua status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            Semua status
          </SelectItem>

          {PRODUCT_ACTIVE_STATUS_OPTIONS.map(
            (
              option,
            ) => (
              <SelectItem
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="outline"
          onClick={
            resetFilters
          }
        >
          Reset Filter
        </Button>
      ) : null}
    </div>
  );
}
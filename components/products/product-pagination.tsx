"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

export function ProductPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: ProductPaginationProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function goToPage(
    page: number,
  ) {
    const normalizedPage =
      Math.min(
        Math.max(page, 1),
        totalPages,
      );

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      normalizedPage === 1
    ) {
      params.delete("page");
    } else {
      params.set(
        "page",
        String(
          normalizedPage,
        ),
      );
    }

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
  }

  if (
    totalItems === 0
  ) {
    return null;
  }

  const firstItem =
    (currentPage - 1) *
      pageSize +
    1;

  const lastItem =
    Math.min(
      currentPage *
        pageSize,
      totalItems,
    );

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Menampilkan{" "}
        {firstItem}–
        {lastItem} dari{" "}
        {totalItems} produk
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            currentPage <= 1
          }
          onClick={() =>
            goToPage(
              currentPage -
                1,
            )
          }
        >
          <ChevronLeft className="mr-1 size-4" />
          Sebelumnya
        </Button>

        <span className="min-w-24 text-center text-sm">
          Halaman{" "}
          {currentPage} dari{" "}
          {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            currentPage >=
            totalPages
          }
          onClick={() =>
            goToPage(
              currentPage +
                1,
            )
          }
        >
          Berikutnya
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
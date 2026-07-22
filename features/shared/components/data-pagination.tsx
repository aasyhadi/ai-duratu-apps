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

type DataPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;

  itemLabel?: string;

  pageParameter?: string;
};

export function DataPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "data",
  pageParameter = "page",
}: DataPaginationProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function goToPage(
    targetPage: number,
  ) {
    const normalizedPage =
      Math.min(
        Math.max(
          targetPage,
          1,
        ),
        totalPages,
      );

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      normalizedPage <= 1
    ) {
      params.delete(
        pageParameter,
      );
    } else {
      params.set(
        pageParameter,
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
    totalItems === 0 ||
    totalPages <= 1
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
    <nav
      aria-label={`Pagination ${itemLabel}`}
      className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Menampilkan{" "}
        <strong>
          {firstItem}
        </strong>
        {"–"}
        <strong>
          {lastItem}
        </strong>{" "}
        dari{" "}
        <strong>
          {totalItems}
        </strong>{" "}
        {itemLabel}
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
              currentPage - 1,
            )
          }
        >
          <ChevronLeft className="mr-1 size-4" />

          Sebelumnya
        </Button>

        <span className="min-w-24 text-center text-sm">
          Halaman{" "}
          <strong>
            {currentPage}
          </strong>{" "}
          dari{" "}
          <strong>
            {totalPages}
          </strong>
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
              currentPage + 1,
            )
          }
        >
          Berikutnya

          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </nav>
  );
}
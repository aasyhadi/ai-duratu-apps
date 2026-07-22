import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TransactionPaginationProps = {
  currentPage: number;
  totalPages: number;
  limit: number;
  query: string;
};

function createPageUrl(
  page: number,
  limit: number,
  query: string,
) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (query) {
    params.set("q", query);
  }

  return `/transactions?${params.toString()}`;
}

export function TransactionPagination({
  currentPage,
  totalPages,
  limit,
  query,
}: TransactionPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </p>

      <div className="flex gap-2">
        {previousDisabled ? (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "sm",
              }),
              "pointer-events-none opacity-50",
            )}
          >
            <ChevronLeft className="mr-2 size-4" />
            Sebelumnya
          </span>
        ) : (
          <Link
            href={createPageUrl(
              currentPage - 1,
              limit,
              query,
            )}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            <ChevronLeft className="mr-2 size-4" />
            Sebelumnya
          </Link>
        )}

        {nextDisabled ? (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "sm",
              }),
              "pointer-events-none opacity-50",
            )}
          >
            Berikutnya
            <ChevronRight className="ml-2 size-4" />
          </span>
        ) : (
          <Link
            href={createPageUrl(
              currentPage + 1,
              limit,
              query,
            )}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            Berikutnya
            <ChevronRight className="ml-2 size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
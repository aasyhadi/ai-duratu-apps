"use client";

import { useState } from "react";
import {
  Search,
  X,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProductSearchProps = {
  defaultValue?: string;
};

export function ProductSearch({
  defaultValue = "",
}: ProductSearchProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [value, setValue] = useState(() => defaultValue);

  function applySearch(
    searchValue: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    const normalizedValue =
      searchValue.trim();

    if (normalizedValue) {
      params.set(
        "search",
        normalizedValue,
      );
    } else {
      params.delete(
        "search",
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

  return (
    <form
      className="flex w-full gap-2 sm:max-w-md"
      onSubmit={(event) => {
        event.preventDefault();

        applySearch(value);
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={value}
          onChange={(event) =>
            setValue(
              event.target.value,
            )
          }
          placeholder="Cari nama atau SKU..."
          className="pl-9 pr-9"
        />

        {value ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Hapus pencarian"
            onClick={() => {
              setValue("");
              applySearch("");
            }}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <Button type="submit">
        Cari
      </Button>
    </form>
  );
}
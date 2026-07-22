"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  RotateCcw,
  Search,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  INVENTORY_MOVEMENT_OPTIONS,
} from "@/features/inventory/constants/inventory-constants";

type InventoryFiltersProps = {
  defaultSearch?: string;
  defaultMovementType?: string;
  defaultDateFrom?: string;
  defaultDateTo?: string;
};

export function InventoryFilters({
  defaultSearch = "",
  defaultMovementType = "all",
  defaultDateFrom = "",
  defaultDateTo = "",
}: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const [search, setSearch] =
    useState(defaultSearch);

  const [
    movementType,
    setMovementType,
  ] = useState(
    defaultMovementType,
  );

  const [dateFrom, setDateFrom] =
    useState(defaultDateFrom);

  const [dateTo, setDateTo] =
    useState(defaultDateTo);

  function updateUrl(
    values: {
      search?: string;
      movementType?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    const normalizedSearch =
      values.search?.trim() ?? "";

    const normalizedMovementType =
      values.movementType ?? "all";

    const normalizedDateFrom =
      values.dateFrom ?? "";

    const normalizedDateTo =
      values.dateTo ?? "";

    if (normalizedSearch) {
      params.set(
        "search",
        normalizedSearch,
      );
    } else {
      params.delete("search");
    }

    if (
      normalizedMovementType &&
      normalizedMovementType !==
        "all"
    ) {
      params.set(
        "movementType",
        normalizedMovementType,
      );
    } else {
      params.delete(
        "movementType",
      );
    }

    if (normalizedDateFrom) {
      params.set(
        "dateFrom",
        normalizedDateFrom,
      );
    } else {
      params.delete("dateFrom");
    }

    if (normalizedDateTo) {
      params.set(
        "dateTo",
        normalizedDateTo,
      );
    } else {
      params.delete("dateTo");
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

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    updateUrl({
      search,
      movementType,
      dateFrom,
      dateTo,
    });
  }

  function handleReset() {
    setSearch("");
    setMovementType("all");
    setDateFrom("");
    setDateTo("");

    router.push(pathname);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_220px_170px_170px_auto] lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="inventory-search">
            Pencarian
          </Label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="inventory-search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Referensi atau catatan..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Jenis Pergerakan
          </Label>

          <Select
            value={movementType}
            onValueChange={(value) =>
              setMovementType(
                value ?? "all",
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua jenis" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                Semua jenis
              </SelectItem>

              {INVENTORY_MOVEMENT_OPTIONS.map(
                (option) => (
                  <SelectItem
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-from">
            Dari Tanggal
          </Label>

          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(
                event.target.value,
              )
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">
            Sampai Tanggal
          </Label>

          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(
                event.target.value,
              )
            }
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 lg:flex-none"
          >
            <Search className="mr-2 size-4" />
            Terapkan
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Reset filter"
            onClick={handleReset}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
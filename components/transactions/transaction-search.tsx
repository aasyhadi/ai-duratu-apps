"use client";

import { FormEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TransactionSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(currentQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    params.set("page", "1");

    router.push(`/transactions?${params.toString()}`);
  }

  function handleClear() {
    setQuery("");

    const params = new URLSearchParams(searchParams.toString());

    params.delete("q");
    params.set("page", "1");

    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari deskripsi transaksi..."
          className="pl-9"
        />
      </div>

      <Button type="submit">Cari</Button>

      {currentQuery ? (
        <Button type="button" variant="outline" onClick={handleClear}>
          <X className="mr-2 size-4" />
          Hapus
        </Button>
      ) : null}
    </form>
  );
}
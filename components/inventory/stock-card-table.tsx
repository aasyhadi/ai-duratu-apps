import type { InventoryStockCardEntry } from "@/features/inventory/types/inventory";

import {
  formatInventoryCurrency,
  formatInventoryDateTime,
  formatInventoryQuantity,
  getInventoryMovementClassName,
  getInventoryMovementLabel,
  getInventoryMovementSign,
} from "@/features/inventory/utils/inventory-formatters";

import {
  ClipboardList,
} from "lucide-react";

import { EmptyState } from "@/features/shared/components/empty-state";

type StockCardTableProps = {
  entries: InventoryStockCardEntry[];
  unit: string;
};

export function StockCardTable({
  entries,
  unit,
}: StockCardTableProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={
          ClipboardList
        }
        title="Belum ada riwayat stok"
        description="Pergerakan stok produk ini akan tampil setelah terdapat stok awal, pembelian, penjualan, atau penyesuaian."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="border-b bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">
                Tanggal
              </th>

              <th className="px-4 py-3 font-medium">
                Jenis
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Masuk
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Keluar
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Saldo
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Biaya Satuan
              </th>

              <th className="px-4 py-3 font-medium">
                Referensi
              </th>

              <th className="px-4 py-3 font-medium">
                Catatan
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {entries.map(
              (entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatInventoryDateTime(
                      entry.movementDate,
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getInventoryMovementClassName(
                        entry.movementType,
                      )}`}
                    >
                      {getInventoryMovementLabel(
                        entry.movementType,
                      )}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-600">
                    {entry.direction ===
                    "in"
                      ? `${getInventoryMovementSign(
                          entry.direction,
                        )}${formatInventoryQuantity(
                          entry.quantity,
                          unit,
                        )}`
                      : "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-rose-600">
                    {entry.direction ===
                    "out"
                      ? `${getInventoryMovementSign(
                          entry.direction,
                        )}${formatInventoryQuantity(
                          entry.quantity,
                          unit,
                        )}`
                      : "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold">
                    {formatInventoryQuantity(
                      entry.balanceAfter,
                      unit,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {entry.unitCost ===
                    null
                      ? "-"
                      : formatInventoryCurrency(
                          entry.unitCost,
                        )}
                  </td>

                  <td className="px-4 py-3">
                    {entry.referenceNumber ??
                      "-"}
                  </td>

                  <td className="max-w-[280px] px-4 py-3 text-muted-foreground">
                    <p className="truncate">
                      {entry.notes ??
                        "-"}
                    </p>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
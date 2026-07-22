import type { InventoryMovement } from "@/features/inventory/types/inventory";

import {
  formatInventoryCurrency,
  formatInventoryDateTime,
  formatInventoryQuantity,
  getInventoryMovementClassName,
  getInventoryMovementLabel,
  getInventoryMovementSign,
} from "@/features/inventory/utils/inventory-formatters";

import Link from "next/link";

import {
  ArrowLeftRight,
} from "lucide-react";

import { EmptyState } from "@/features/shared/components/empty-state";

type InventoryMovementTableProps = {
  movements: InventoryMovement[];
};

export function InventoryMovementTable({
  movements,
}: InventoryMovementTableProps) {
  if (movements.length === 0) {
    return (
      <EmptyState
        icon={
          ArrowLeftRight
        }
        title="Belum ada pergerakan stok"
        description="Riwayat pembelian, penjualan, dan penyesuaian stok akan tampil di sini."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">
                Tanggal
              </th>

              <th className="px-4 py-3 font-medium">
                Produk
              </th>

              <th className="px-4 py-3 font-medium">
                Jenis
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Kuantitas
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
            {movements.map(
              (movement) => (
                <tr
                  key={
                    movement.id
                  }
                  className="hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatInventoryDateTime(
                      movement.movementDate,
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/inventory/${movement.productId}`}
                      className="font-medium hover:underline"
                    >
                      {movement.productName}
                    </Link>

                    <div className="text-xs text-muted-foreground">
                      {movement.productSku ??
                        "Tanpa SKU"}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getInventoryMovementClassName(
                        movement.movementType,
                      )}`}
                    >
                      {getInventoryMovementLabel(
                        movement.movementType,
                      )}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                    <span
                      className={
                        movement.direction ===
                        "in"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    >
                      {getInventoryMovementSign(
                        movement.direction,
                      )}
                      {formatInventoryQuantity(
                        movement.quantity,
                        movement.productUnit,
                      )}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {movement.unitCost ===
                    null
                      ? "-"
                      : formatInventoryCurrency(
                          movement.unitCost,
                        )}
                  </td>

                  <td className="px-4 py-3">
                    {movement.referenceNumber ??
                      "-"}
                  </td>

                  <td className="max-w-[260px] px-4 py-3 text-muted-foreground">
                    <p className="truncate">
                      {movement.notes ??
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
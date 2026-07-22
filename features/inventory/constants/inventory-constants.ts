import type {
  InventoryMovementDirection,
  InventoryMovementType,
} from "@/features/inventory/types/inventory";

export const DEFAULT_INVENTORY_PAGE_SIZE =
  20;

export const MAX_INVENTORY_PAGE_SIZE =
  100;

export const INVENTORY_MOVEMENT_TYPES =
  [
    "initial_stock",
    "purchase",
    "sale",
    "adjustment_in",
    "adjustment_out",
    "return_in",
    "return_out",
    "damaged",
    "expired",
  ] as const satisfies readonly InventoryMovementType[];

export const INVENTORY_IN_MOVEMENT_TYPES =
  [
    "initial_stock",
    "purchase",
    "adjustment_in",
    "return_in",
  ] as const satisfies readonly InventoryMovementType[];

export const INVENTORY_OUT_MOVEMENT_TYPES =
  [
    "sale",
    "adjustment_out",
    "return_out",
    "damaged",
    "expired",
  ] as const satisfies readonly InventoryMovementType[];

export const INVENTORY_MOVEMENT_LABELS: Record<
  InventoryMovementType,
  string
> = {
  initial_stock: "Stok Awal",
  purchase: "Pembelian",
  sale: "Penjualan",
  adjustment_in: "Penyesuaian Masuk",
  adjustment_out: "Penyesuaian Keluar",
  return_in: "Retur Masuk",
  return_out: "Retur Keluar",
  damaged: "Barang Rusak",
  expired: "Kedaluwarsa",
};

export const INVENTORY_MOVEMENT_OPTIONS =
  INVENTORY_MOVEMENT_TYPES.map(
    (value) => ({
      value,
      label:
        INVENTORY_MOVEMENT_LABELS[
          value
        ],
    }),
  );

export function getInventoryMovementDirection(
  movementType: InventoryMovementType,
): InventoryMovementDirection {
  return INVENTORY_IN_MOVEMENT_TYPES.includes(
    movementType as (
      typeof INVENTORY_IN_MOVEMENT_TYPES
    )[number],
  )
    ? "in"
    : "out";
}
import {
  INVENTORY_MOVEMENT_LABELS,
  getInventoryMovementDirection,
} from "@/features/inventory/constants/inventory-constants";

import type {
  InventoryMovementDirection,
  InventoryMovementType,
} from "@/features/inventory/types/inventory";

import { formatCurrency } from "@/features/shared/utils/currency";
import { formatDateTime } from "@/features/shared/utils/date";
import { formatNumber } from "@/features/shared/utils/number";

export function formatInventoryCurrency(
  value:
    | number
    | null
    | undefined,
): string {
  return formatCurrency(
    value,
  );
}

export function formatInventoryQuantity(
  value: number,
  unit?: string,
): string {
  const formatted =
    formatNumber(
      value,
      {
        maximumFractionDigits:
          3,
      },
    );

  return unit
    ? `${formatted} ${unit}`
    : formatted;
}

export function formatInventoryDateTime(
  value: string,
): string {
  return formatDateTime(
    value,
  );
}

export function getInventoryMovementLabel(
  movementType: InventoryMovementType,
): string {
  return (
    INVENTORY_MOVEMENT_LABELS[
      movementType
    ] ?? movementType
  );
}

export function getInventoryMovementSign(
  direction: InventoryMovementDirection,
): "+" | "-" {
  return direction === "in"
    ? "+"
    : "-";
}

export function getInventoryMovementClassName(
  movementType: InventoryMovementType,
): string {
  const direction =
    getInventoryMovementDirection(
      movementType,
    );

  return direction === "in"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
}
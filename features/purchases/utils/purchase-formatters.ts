import type { PurchaseRequestStatus } from "@/features/purchases/types/purchase-request";

import { formatCurrency } from "@/features/shared/utils/currency";
import {
  formatDate,
  formatDateTime,
} from "@/features/shared/utils/date";
import { formatNumber } from "@/features/shared/utils/number";

export function formatPurchaseCurrency(
  value:
    | number
    | null
    | undefined,
): string {
  return formatCurrency(
    value,
  );
}

export function formatPurchaseQuantity(
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

export function formatPurchaseDate(
  value: string | null,
): string {
  return formatDate(
    value,
  );
}

export function formatPurchaseDateTime(
  value: string,
): string {
  return formatDateTime(
    value,
  );
}

export function getPurchaseRequestStatusLabel(
  status: PurchaseRequestStatus,
): string {
  const labels: Record<
    PurchaseRequestStatus,
    string
  > = {
    draft: "Draft",
    submitted: "Diajukan",
    approved: "Disetujui",
    rejected: "Ditolak",
    converted:
      "Dikonversi",
    cancelled: "Dibatalkan",
  };

  return labels[status];
}

export function getPurchaseRequestStatusClassName(
  status: PurchaseRequestStatus,
): string {
  const classes: Record<
    PurchaseRequestStatus,
    string
  > = {
    draft:
      "border-slate-200 bg-slate-50 text-slate-700",

    submitted:
      "border-blue-200 bg-blue-50 text-blue-700",

    approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    rejected:
      "border-rose-200 bg-rose-50 text-rose-700",

    converted:
      "border-violet-200 bg-violet-50 text-violet-700",

    cancelled:
      "border-zinc-200 bg-zinc-50 text-zinc-600",
  };

  return classes[status];
}
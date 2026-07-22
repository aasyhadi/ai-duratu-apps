export function formatCurrency(
  value:
    | number
    | null
    | undefined,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",

      currency:
        options.currency ??
        "IDR",

      minimumFractionDigits:
        options.minimumFractionDigits ??
        0,

      maximumFractionDigits:
        options.maximumFractionDigits ??
        0,
    },
  ).format(value ?? 0);
}
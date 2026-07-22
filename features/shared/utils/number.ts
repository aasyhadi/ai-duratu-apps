export function toSafeNumber(
  value:
    | number
    | string
    | null
    | undefined,
  fallback = 0,
): number {
  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : fallback;
}

export function normalizePositiveInteger(
  value:
    | number
    | string
    | null
    | undefined,
  fallback = 1,
): number {
  const numericValue =
    Number(value);

  if (
    !Number.isInteger(
      numericValue,
    ) ||
    numericValue < 1
  ) {
    return fallback;
  }

  return numericValue;
}

export function normalizePageSize(
  value:
    | number
    | string
    | null
    | undefined,
  options: {
    fallback: number;
    maximum: number;
  },
): number {
  const numericValue =
    Number(value);

  if (
    !Number.isInteger(
      numericValue,
    ) ||
    numericValue < 1
  ) {
    return options.fallback;
  }

  return Math.min(
    numericValue,
    options.maximum,
  );
}

export function formatNumber(
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      minimumFractionDigits:
        options.minimumFractionDigits ??
        0,

      maximumFractionDigits:
        options.maximumFractionDigits ??
        3,
    },
  ).format(value);
}

export function clampNumber(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
  );
}
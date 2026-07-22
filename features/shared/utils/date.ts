function isValidDate(
  date: Date,
): boolean {
  return !Number.isNaN(
    date.getTime(),
  );
}

export function formatDate(
  value:
    | string
    | Date
    | null
    | undefined,
): string {
  if (!value) {
    return "-";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(
          value.length === 10
            ? `${value}T00:00:00`
            : value,
        );

  if (!isValidDate(date)) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
    },
  ).format(date);
}

export function formatDateTime(
  value:
    | string
    | Date
    | null
    | undefined,
): string {
  if (!value) {
    return "-";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (!isValidDate(date)) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

export function toDateInputValue(
  value:
    | string
    | Date
    | null
    | undefined = new Date(),
): string {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (!isValidDate(date)) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

export function addDaysToDateInput(
  days: number,
  startDate = new Date(),
): string {
  const date =
    new Date(startDate);

  date.setDate(
    date.getDate() +
      days,
  );

  return toDateInputValue(
    date,
  );
}
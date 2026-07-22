export type TransactionKind =
  | "all"
  | "revenue"
  | "expense";

export type TransactionDateRange = {
  startDate: string | null;
  endDate: string | null;
  label: string;
};

export type TransactionQueryAnalysis = {
  kind: TransactionKind;
  dateRange: TransactionDateRange;
  matchedKeywords: string[];
};

const APP_TIME_ZONE =
  process.env.APP_TIME_ZONE ??
  "Asia/Jakarta";

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function normalizeText(
  value: string,
): string {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCalendarDateInTimeZone(
  date: Date,
  timeZone: string,
): CalendarDate {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    );

  const parts =
    formatter.formatToParts(date);

  const year = Number(
    parts.find(
      (part) =>
        part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) =>
        part.type === "month",
    )?.value,
  );

  const day = Number(
    parts.find(
      (part) =>
        part.type === "day",
    )?.value,
  );

  return {
    year,
    month,
    day,
  };
}

function createUtcDate(
  calendarDate: CalendarDate,
): Date {
  return new Date(
    Date.UTC(
      calendarDate.year,
      calendarDate.month - 1,
      calendarDate.day,
    ),
  );
}

function toDateString(
  date: Date,
): string {
  return date
    .toISOString()
    .slice(0, 10);
}

function addDays(
  date: Date,
  amount: number,
): Date {
  const result =
    new Date(date);

  result.setUTCDate(
    result.getUTCDate() +
      amount,
  );

  return result;
}

function startOfMonth(
  date: Date,
): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1,
    ),
  );
}

function endOfMonth(
  date: Date,
): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0,
    ),
  );
}

function startOfYear(
  date: Date,
): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      0,
      1,
    ),
  );
}

function endOfYear(
  date: Date,
): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      11,
      31,
    ),
  );
}

/**
 * Minggu bisnis dimulai pada Senin.
 */
function startOfWeek(
  date: Date,
): Date {
  const day = date.getUTCDay();

  const daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  return addDays(
    date,
    -daysSinceMonday,
  );
}

function endOfWeek(
  date: Date,
): Date {
  return addDays(
    startOfWeek(date),
    6,
  );
}

function createRange(
  startDate: Date,
  endDate: Date,
  label: string,
): TransactionDateRange {
  return {
    startDate:
      toDateString(startDate),

    endDate:
      toDateString(endDate),

    label,
  };
}

function detectTransactionKind(
  normalizedQuestion: string,
): {
  kind: TransactionKind;
  matchedKeywords: string[];
} {
  const revenueKeywords = [
    "pendapatan",
    "penjualan",
    "omzet",
    "omset",
    "revenue",
    "pemasukan",
    "income",
  ];

  const expenseKeywords = [
    "pengeluaran",
    "biaya",
    "beban",
    "expense",
    "operasional",
    "bahan baku",
    "perlengkapan",
  ];

  const matchedRevenue =
    revenueKeywords.filter(
      (keyword) =>
        normalizedQuestion.includes(
          keyword,
        ),
    );

  const matchedExpense =
    expenseKeywords.filter(
      (keyword) =>
        normalizedQuestion.includes(
          keyword,
        ),
    );

  if (
    matchedRevenue.length >
    matchedExpense.length
  ) {
    return {
      kind: "revenue",
      matchedKeywords:
        matchedRevenue,
    };
  }

  if (
    matchedExpense.length >
    matchedRevenue.length
  ) {
    return {
      kind: "expense",
      matchedKeywords:
        matchedExpense,
    };
  }

  return {
    kind: "all",
    matchedKeywords: [
      ...matchedRevenue,
      ...matchedExpense,
    ],
  };
}

function detectDateRange(
  normalizedQuestion: string,
  now: Date,
): {
  dateRange: TransactionDateRange;
  matchedKeywords: string[];
} {
  const calendarDate =
    getCalendarDateInTimeZone(
      now,
      APP_TIME_ZONE,
    );

  const today =
    createUtcDate(calendarDate);

  if (
    normalizedQuestion.includes(
      "hari ini",
    )
  ) {
    return {
      dateRange: createRange(
        today,
        today,
        "hari ini",
      ),

      matchedKeywords: [
        "hari ini",
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "kemarin",
    )
  ) {
    const yesterday =
      addDays(today, -1);

    return {
      dateRange: createRange(
        yesterday,
        yesterday,
        "kemarin",
      ),

      matchedKeywords: [
        "kemarin",
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "minggu lalu",
    )
  ) {
    const previousWeekDate =
      addDays(today, -7);

    return {
      dateRange: createRange(
        startOfWeek(
          previousWeekDate,
        ),
        endOfWeek(
          previousWeekDate,
        ),
        "minggu lalu",
      ),

      matchedKeywords: [
        "minggu lalu",
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "minggu ini",
    )
  ) {
    return {
      dateRange: createRange(
        startOfWeek(today),
        endOfWeek(today),
        "minggu ini",
      ),

      matchedKeywords: [
        "minggu ini",
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "bulan lalu",
    )
  ) {
    const previousMonthDate =
      new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth() -
            1,
          1,
        ),
      );

    return {
      dateRange: createRange(
        startOfMonth(
          previousMonthDate,
        ),
        endOfMonth(
          previousMonthDate,
        ),
        "bulan lalu",
      ),

      matchedKeywords: [
        "bulan lalu",
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "bulan ini",
    )
  ) {
    return {
      dateRange: createRange(
        startOfMonth(today),
        endOfMonth(today),
        "bulan ini",
      ),

      matchedKeywords: [
        "bulan ini",
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "tahun lalu",
    )
  ) {
    const previousYearDate =
      new Date(
        Date.UTC(
          today.getUTCFullYear() -
            1,
          0,
          1,
        ),
      );

    return {
      dateRange: createRange(
        startOfYear(
          previousYearDate,
        ),
        endOfYear(
          previousYearDate,
        ),
        "tahun lalu",
      ),

      matchedKeywords: [
        "tahun lalu",
      ],
    };
  }

  if (
    normalizedQuestion.includes(
      "tahun ini",
    )
  ) {
    return {
      dateRange: createRange(
        startOfYear(today),
        endOfYear(today),
        "tahun ini",
      ),

      matchedKeywords: [
        "tahun ini",
      ],
    };
  }

  return {
    dateRange: {
      startDate: null,
      endDate: null,
      label:
        "seluruh data yang tersedia",
    },

    matchedKeywords: [],
  };
}

export function analyzeTransactionQuery(
  question: string,
  now: Date = new Date(),
): TransactionQueryAnalysis {
  const normalizedQuestion =
    normalizeText(question);

  const kindResult =
    detectTransactionKind(
      normalizedQuestion,
    );

  const dateResult =
    detectDateRange(
      normalizedQuestion,
      now,
    );

  return {
    kind: kindResult.kind,

    dateRange:
      dateResult.dateRange,

    matchedKeywords: [
      ...new Set([
        ...kindResult
          .matchedKeywords,

        ...dateResult
          .matchedKeywords,
      ]),
    ],
  };
}
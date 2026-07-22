import { createClient } from "@/lib/supabase/server";

import type {
  TransactionCategorySummary,
  TransactionContext,
  TransactionRetrieveOptions,
} from "@/features/ai/types/retriever";
import type { Transaction } from "@/features/ai/types/transaction";

const REVENUE_CATEGORY =
  "Penjualan";

type TransactionRow = {
  id: number;
  description: string | null;
  amount: number | string;
  category: string | null;
  transaction_date: string;
  created_at: string;
};

function normalizeCategory(
  category: string | null,
): string {
  return (
    category
      ?.trim()
      .toLocaleLowerCase("id-ID") ??
    ""
  );
}

function convertAmountToNumber(
  amount: number | string,
): number {
  const numericAmount =
    Number(amount);

  return Number.isFinite(
    numericAmount,
  )
    ? numericAmount
    : 0;
}

function mapTransactionRow(
  row: TransactionRow,
): Transaction {
  return {
    id: row.id,

    description:
      row.description ??
      "Tanpa deskripsi",

    amount:
      convertAmountToNumber(
        row.amount,
      ),

    category:
      row.category ??
      "Tidak Berkategori",

    transaction_date:
      row.transaction_date,

    created_at:
      row.created_at,
  };
}

function isRevenueTransaction(
  transaction: Transaction,
): boolean {
  return (
    normalizeCategory(
      transaction.category,
    ) ===
    normalizeCategory(
      REVENUE_CATEGORY,
    )
  );
}

function sumTransactionAmounts(
  transactions: Transaction[],
): number {
  return transactions.reduce(
    (
      total,
      transaction,
    ) =>
      total +
      transaction.amount,
    0,
  );
}

function calculateAverage(
  totalAmount: number,
  transactionCount: number,
): number {
  if (transactionCount === 0) {
    return 0;
  }

  return (
    totalAmount /
    transactionCount
  );
}

function findLargestTransaction(
  transactions: Transaction[],
): Transaction | null {
  if (
    transactions.length === 0
  ) {
    return null;
  }

  return transactions.reduce(
    (
      largest,
      transaction,
    ) =>
      transaction.amount >
      largest.amount
        ? transaction
        : largest,
  );
}

function buildCategorySummary(
  transactions: Transaction[],
): TransactionCategorySummary[] {
  const totalAmount =
    sumTransactionAmounts(
      transactions,
    );

  const groupedCategories =
    new Map<
      string,
      {
        category: string;
        transactionCount: number;
        totalAmount: number;
      }
    >();

  for (
    const transaction of
    transactions
  ) {
    const normalizedCategory =
      normalizeCategory(
        transaction.category,
      );

    const categoryKey =
      normalizedCategory ||
      "tidak berkategori";

    const existingCategory =
      groupedCategories.get(
        categoryKey,
      );

    if (existingCategory) {
      existingCategory.transactionCount +=
        1;

      existingCategory.totalAmount +=
        transaction.amount;

      continue;
    }

    groupedCategories.set(
      categoryKey,
      {
        category:
          transaction.category ||
          "Tidak Berkategori",

        transactionCount: 1,

        totalAmount:
          transaction.amount,
      },
    );
  }

  return Array.from(
    groupedCategories.values(),
  )
    .map((category) => ({
      ...category,

      percentageOfTotal:
        totalAmount > 0
          ? Number(
              (
                (
                  category.totalAmount /
                  totalAmount
                ) *
                100
              ).toFixed(2),
            )
          : 0,
    }))
    .sort(
      (first, second) =>
        second.totalAmount -
        first.totalAmount,
    );
}

export async function retrieveTransactions(
  options: TransactionRetrieveOptions = {},
): Promise<TransactionContext> {
  const kind =
    options.kind ?? "all";

  const dateRange =
    options.dateRange ?? {
      startDate: null,
      endDate: null,
      label:
        "seluruh data yang tersedia",
    };

  const supabase =
    await createClient();

  let query = supabase
    .from("transactions")
    .select(
      `
        id,
        description,
        amount,
        category,
        transaction_date,
        created_at
      `,
    );

  if (dateRange.startDate) {
    query = query.gte(
      "transaction_date",
      dateRange.startDate,
    );
  }

  if (dateRange.endDate) {
    query = query.lte(
      "transaction_date",
      dateRange.endDate,
    );
  }

  if (kind === "revenue") {
    query = query.eq(
      "category",
      REVENUE_CATEGORY,
    );
  }

  if (kind === "expense") {
    query = query.neq(
      "category",
      REVENUE_CATEGORY,
    );
  }

  const { data, error } =
    await query
      .order(
        "transaction_date",
        {
          ascending: false,
        },
      )
      .order("id", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Retrieve transactions failed:",
      error,
    );

    throw new Error(
      "Data transaksi gagal diambil dari Supabase.",
    );
  }

  const transactions = (
    (data ??
      []) as TransactionRow[]
  ).map(mapTransactionRow);

  const revenueTransactions =
    transactions.filter(
      isRevenueTransaction,
    );

  const expenseTransactions =
    transactions.filter(
      (transaction) =>
        !isRevenueTransaction(
          transaction,
        ),
    );

  const totalRevenue =
    sumTransactionAmounts(
      revenueTransactions,
    );

  const totalExpense =
    sumTransactionAmounts(
      expenseTransactions,
    );

  return {
    summary: {
      totalTransactions:
        transactions.length,

      revenueTransactions:
        revenueTransactions.length,

      expenseTransactions:
        expenseTransactions.length,

      totalRevenue,

      totalExpense,

      netProfit:
        totalRevenue -
        totalExpense,

      averageRevenueTransaction:
        calculateAverage(
          totalRevenue,
          revenueTransactions.length,
        ),

      averageExpenseTransaction:
        calculateAverage(
          totalExpense,
          expenseTransactions.length,
        ),

      largestRevenueTransaction:
        findLargestTransaction(
          revenueTransactions,
        ),

      largestExpenseTransaction:
        findLargestTransaction(
          expenseTransactions,
        ),

      revenueByCategory:
        buildCategorySummary(
          revenueTransactions,
        ),

      expenseByCategory:
        buildCategorySummary(
          expenseTransactions,
        ),
    },

    transactions,

    filters: {
      kind,

      startDate:
        dateRange.startDate,

      endDate:
        dateRange.endDate,

      periodLabel:
        dateRange.label,
    },
  };
}
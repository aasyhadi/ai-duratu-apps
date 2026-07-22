import type {
  TransactionDateRange,
  TransactionKind,
} from "@/features/ai/analyzers/transaction-query-analyzer";
import type { Transaction } from "@/features/ai/types/transaction";

export type TransactionCategorySummary = {
  category: string;
  transactionCount: number;
  totalAmount: number;
  percentageOfTotal: number;
};

export type TransactionSummary = {
  totalTransactions: number;

  totalRevenue: number;

  totalExpense: number;

  netProfit: number;

  revenueTransactions: number;

  expenseTransactions: number;

  averageRevenueTransaction: number;

  averageExpenseTransaction: number;

  largestRevenueTransaction:
    | Transaction
    | null;

  largestExpenseTransaction:
    | Transaction
    | null;

  revenueByCategory:
    TransactionCategorySummary[];

  expenseByCategory:
    TransactionCategorySummary[];
};

export type TransactionRetrieveOptions = {
  kind?: TransactionKind;

  dateRange?: TransactionDateRange;
};

export type TransactionContext = {
  summary: TransactionSummary;

  transactions: Transaction[];

  filters: {
    kind: TransactionKind;

    startDate: string | null;

    endDate: string | null;

    periodLabel: string;
  };
};
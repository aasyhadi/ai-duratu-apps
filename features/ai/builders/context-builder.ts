import type {
  TransactionCategorySummary,
  TransactionContext,
} from "@/features/ai/types/retriever";
import type { Transaction } from "@/features/ai/types/transaction";

function formatRupiah(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function getTransactionKindLabel(
  kind:
    TransactionContext["filters"]["kind"],
): string {
  if (kind === "revenue") {
    return "Pendapatan";
  }

  if (kind === "expense") {
    return "Pengeluaran";
  }

  return "Seluruh transaksi";
}

function formatLargestTransaction(
  transaction:
    | Transaction
    | null,
): string {
  if (!transaction) {
    return "Tidak tersedia";
  }

  return [
    transaction.description,
    formatRupiah(
      transaction.amount,
    ),
    `kategori ${transaction.category}`,
    `tanggal ${transaction.transaction_date}`,
  ].join(" | ");
}

function formatCategoryBreakdown(
  categories:
    TransactionCategorySummary[],
): string {
  if (categories.length === 0) {
    return "Tidak ada data kategori.";
  }

  return categories
    .map(
      (
        category,
        index,
      ) =>
        `${index + 1}. ${category.category}
   - Jumlah transaksi: ${category.transactionCount}
   - Total: ${formatRupiah(category.totalAmount)}
   - Persentase: ${category.percentageOfTotal}%`,
    )
    .join("\n");
}

export function buildBusinessContext(
  context: TransactionContext,
): string {
  const {
    summary,
    filters,
  } = context;

  const financialCondition =
    summary.netProfit > 0
      ? "Laba"
      : summary.netProfit < 0
        ? "Rugi"
        : "Impas";

  const periodRange =
    filters.startDate &&
    filters.endDate
      ? `${filters.startDate} sampai ${filters.endDate}`
      : "Tidak dibatasi";

  return `
DATA BISNIS DURATU

SUMBER DATA

Tabel:
transactions pada Supabase.

FILTER DATA

Jenis data:
${getTransactionKindLabel(filters.kind)}

Periode permintaan:
${filters.periodLabel}

Rentang tanggal:
${periodRange}

RINGKASAN TRANSAKSI

Jumlah transaksi yang ditemukan:
${summary.totalTransactions}

Jumlah transaksi pendapatan:
${summary.revenueTransactions}

Jumlah transaksi pengeluaran:
${summary.expenseTransactions}

Total pendapatan:
${formatRupiah(summary.totalRevenue)}

Total pengeluaran:
${formatRupiah(summary.totalExpense)}

Hasil bersih:
${formatRupiah(summary.netProfit)}

Kondisi keuangan:
${financialCondition}

Rata-rata transaksi pendapatan:
${formatRupiah(summary.averageRevenueTransaction)}

Rata-rata transaksi pengeluaran:
${formatRupiah(summary.averageExpenseTransaction)}

Transaksi pendapatan terbesar:
${formatLargestTransaction(summary.largestRevenueTransaction)}

Transaksi pengeluaran terbesar:
${formatLargestTransaction(summary.largestExpenseTransaction)}

RINCIAN PENDAPATAN PER KATEGORI

${formatCategoryBreakdown(summary.revenueByCategory)}

RINCIAN PENGELUARAN PER KATEGORI

${formatCategoryBreakdown(summary.expenseByCategory)}

ATURAN PENGGUNAAN DATA

- Semua angka telah dihitung oleh TypeScript.
- Gunakan angka dalam context sebagai sumber kebenaran.
- Jangan mengubah, menambah, atau mengarang angka.
- Jangan membuat transaksi baru.
- Jangan menghitung ulang menggunakan asumsi.
- Sebutkan periode data yang digunakan.
- Jika jumlah transaksi adalah 0, nyatakan bahwa tidak ada transaksi pada periode tersebut.
- Rekomendasi harus didasarkan pada kategori dan nilai yang tersedia.
- Jangan menyatakan hubungan sebab-akibat yang tidak didukung data.
`.trim();
}
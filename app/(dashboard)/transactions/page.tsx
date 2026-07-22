import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionPagination } from "@/components/transactions/transaction-pagination";
import { TransactionSearch } from "@/components/transactions/transaction-search";
import { createClient } from "@/lib/supabase/server";
import { CreateTransactionDialog } from "@/components/transactions/create-transaction-dialog";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";

type TransactionsPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
  }>;
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(value));
}

function normalizePositiveInteger(
  value: string | undefined,
  fallback: number,
) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  const page = normalizePositiveInteger(params.page, 1);
  const requestedLimit = normalizePositiveInteger(params.limit, 5);
  const limit = Math.min(requestedLimit, 20);
  const query = params.q?.trim() ?? "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();

  let transactionQuery = supabase
    .from("transactions")
    .select(
      "id, description, amount, category, transaction_date, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    transactionQuery = transactionQuery.ilike(
      "description",
      `%${query}%`,
    );
  }

  const {
    data: transactions,
    count,
    error,
  } = await transactionQuery;

  const totalTransactions = count ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalTransactions / limit),
  );

  if (error) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-bold tracking-tight">
            Transaksi
          </h1>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Data gagal dimuat</CardTitle>
            <CardDescription>
              Terjadi kesalahan ketika membaca transaksi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-destructive">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Conventional Application
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Transaksi
          </h1>

          <p className="mt-2 text-muted-foreground">
            Pencarian, pagination, dan pengelolaan data transaksi.
          </p>
        </div>

        <CreateTransactionDialog />
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Daftar Transaksi</CardTitle>

            <CardDescription>
              {totalTransactions} transaksi ditemukan.
            </CardDescription>
          </div>

          <TransactionSearch />
        </CardHeader>

        <CardContent className="space-y-4">
          {transactions.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Tidak ada transaksi yang sesuai.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Nominal
                    </th>
                    <th className="w-16 px-4 py-3 text-right font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {transaction.description}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {transaction.category}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDate(transaction.transaction_date)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <EditTransactionDialog
                            transaction={{
                              id: Number(transaction.id),
                              description: transaction.description,
                              amount: Number(transaction.amount),
                              category: transaction.category,
                              transactionDate: transaction.transaction_date,
                            }}
                          />

                          <DeleteTransactionDialog
                            transactionId={Number(transaction.id)}
                            transactionDescription={transaction.description}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <TransactionPagination
            currentPage={Math.min(page, totalPages)}
            totalPages={totalPages}
            limit={limit}
            query={query}
          />
        </CardContent>
      </Card>
    </div>
  );
}
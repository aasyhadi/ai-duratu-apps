import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DatabaseTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, description, amount, category, transaction_date")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">
          Pengujian integrasi
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Supabase Connection
        </h1>
      </section>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Koneksi gagal</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-destructive">
              {error.message}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Koneksi berhasil — {data.length} transaksi ditemukan
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tabel berhasil dibaca, tetapi belum memiliki data.
              </p>
            ) : (
              data.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {transaction.category} ·{" "}
                      {transaction.transaction_date}
                    </p>
                  </div>

                  <p className="font-semibold">
                    Rp
                    {Number(transaction.amount).toLocaleString(
                      "id-ID",
                    )}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import {
  Bot,
  CircleDollarSign,
  Package,
  ReceiptText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statistics = [
  {
    title: "Total Pendapatan",
    value: "Rp0",
    description: "Belum ada transaksi",
    icon: CircleDollarSign,
  },
  {
    title: "Total Transaksi",
    value: "0",
    description: "Data akan terhubung ke Supabase",
    icon: ReceiptText,
  },
  {
    title: "Jumlah Produk",
    value: "0",
    description: "Produk belum ditambahkan",
    icon: Package,
  },
  {
    title: "AI Requests",
    value: "0",
    description: "Gemini belum dihubungkan",
    icon: Bot,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Selamat datang kembali</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <Card key={statistic.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">
                  {statistic.title}
                </CardTitle>

                <Icon className="size-5 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-bold">{statistic.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {statistic.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Belum ada transaksi
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Fitur AI akan dibuat pada modul berikutnya
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
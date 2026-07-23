import type {
  InventoryKnowledgeContext,
  InventoryKnowledgeProduct,
} from "@/features/ai/types/inventory-knowledge";

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

function getStockStatusLabel(
  status:
    InventoryKnowledgeProduct["stockStatus"],
): string {
  if (status === "out_of_stock") {
    return "Habis";
  }

  if (status === "low_stock") {
    return "Stok menipis";
  }

  return "Tersedia";
}

function getQueryKindLabel(
  kind:
    InventoryKnowledgeContext["query"]["kind"],
): string {
  if (kind === "product_stock") {
    return "Pencarian stok produk";
  }

  if (kind === "low_stock") {
    return "Produk stok menipis";
  }

  if (kind === "out_of_stock") {
    return "Produk stok habis";
  }

  return "Ringkasan persediaan";
}

function formatProducts(
  products:
    InventoryKnowledgeProduct[],
): string {
  if (products.length === 0) {
    return "Tidak ada produk yang ditemukan untuk filter permintaan ini.";
  }

  return products
    .map(
      (
        product,
        index,
      ) => `
${index + 1}. ${product.name}
   - SKU: ${product.sku ?? "Tidak tersedia"}
   - Kategori: ${product.categoryName ?? "Tidak berkategori"}
   - Stok saat ini: ${product.stock} ${product.unit}
   - Batas minimum: ${product.minimumStock} ${product.unit}
   - Status: ${getStockStatusLabel(product.stockStatus)}
   - Harga modal: ${formatRupiah(product.costPrice)}
   - Harga jual: ${formatRupiah(product.sellingPrice)}
`.trim(),
    )
    .join("\n\n");
}

export function buildInventoryContext(
  context: InventoryKnowledgeContext,
): string {
  const {
    query,
    summary,
    products,
    retrievedAt,
  } = context;

  return `
DATA BISNIS DURATU

DOMAIN DATA

Persediaan dan stok produk Duratu Kafe.

SUMBER DATA

View:
product_inventory_summary pada Supabase.

Tabel pendukung:
inventory_movements pada Supabase.

JENIS PERMINTAAN

${getQueryKindLabel(query.kind)}

Kata pencarian produk:
${query.searchTerm ?? "Tidak ada"}

Waktu pengambilan data:
${retrievedAt}

RINGKASAN PERSEDIAAN

Jumlah produk yang dipantau stoknya:
${summary.trackedProducts}

Jumlah produk aktif yang dipantau:
${summary.activeTrackedProducts}

Total kuantitas stok aktif:
${summary.totalStockQuantity}

Jumlah produk stok menipis:
${summary.lowStockProducts}

Jumlah produk stok habis:
${summary.outOfStockProducts}

Nilai persediaan berdasarkan harga modal:
${formatRupiah(summary.inventoryCostValue)}

Nilai persediaan berdasarkan harga jual:
${formatRupiah(summary.inventorySellingValue)}

Potensi laba kotor persediaan:
${formatRupiah(summary.potentialGrossProfit)}

Jumlah pergerakan stok hari ini:
${summary.movementsToday}

PRODUK YANG SESUAI DENGAN PERMINTAAN

${formatProducts(products)}

ATURAN PENGGUNAAN DATA

- Gunakan angka dari context sebagai sumber kebenaran.
- Jangan mengubah atau mengarang jumlah stok.
- Jangan menghitung stok menggunakan asumsi.
- Stok saat ini berasal dari product_inventory_summary.
- Jika daftar produk kosong, katakan bahwa produk yang dimaksud tidak ditemukan.
- Jangan menyatakan stok aman apabila nilainya sama dengan atau di bawah batas minimum.
- Status "stok menipis" dan "habis" mengikuti status yang dihitung aplikasi.
- Bedakan data persediaan aktual dengan rekomendasi.
- Rekomendasi pembelian tidak boleh dianggap sebagai Purchase Order yang telah dibuat.
`.trim();
}
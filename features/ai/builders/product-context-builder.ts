import type {
  ProductKnowledgeContext,
  ProductKnowledgeItem,
} from "@/features/ai/types/product-knowledge";

function formatRupiah(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style:
        "currency",

      currency:
        "IDR",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0,
    },
  ).format(value);
}

function formatPercentage(
  value: number,
): string {
  return `${value.toLocaleString(
    "id-ID",
    {
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    },
  )}%`;
}

function getQueryKindLabel(
  kind:
    ProductKnowledgeContext["query"]["kind"],
): string {
  if (
    kind ===
    "product_detail"
  ) {
    return "Detail produk";
  }

  if (
    kind === "active"
  ) {
    return "Produk aktif";
  }

  if (
    kind === "inactive"
  ) {
    return "Produk tidak aktif";
  }

  if (
    kind === "category"
  ) {
    return "Produk berdasarkan kategori";
  }

  return "Ringkasan produk";
}

function formatProducts(
  products:
    ProductKnowledgeItem[],
): string {
  if (
    products.length === 0
  ) {
    return "Tidak ada produk yang ditemukan untuk permintaan ini.";
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
   - Deskripsi: ${product.description ?? "Tidak tersedia"}
   - Satuan: ${product.unit}
   - Harga modal: ${formatRupiah(product.costPrice)}
   - Harga jual: ${formatRupiah(product.sellingPrice)}
   - Margin per unit: ${formatRupiah(product.grossMarginPerUnit)}
   - Margin: ${formatPercentage(product.grossMarginPercentage)}
   - Status: ${product.isActive ? "Aktif" : "Tidak aktif"}
`.trim(),
    )
    .join("\n\n");
}

export function buildProductContext(
  context:
    ProductKnowledgeContext,
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

Master produk Duratu Kafe.

SUMBER DATA

View:
product_inventory_summary pada Supabase.

Tabel pendukung:
products pada Supabase.

JENIS PERMINTAAN

${getQueryKindLabel(query.kind)}

Produk yang dicari:
${query.searchTerm ?? "Tidak ada"}

Kategori yang dicari:
${query.categoryTerm ?? "Tidak ada"}

Waktu pengambilan data:
${retrievedAt}

RINGKASAN PRODUK

Total produk:
${summary.totalProducts}

Produk aktif:
${summary.activeProducts}

Produk tidak aktif:
${summary.inactiveProducts}

PRODUK YANG SESUAI DENGAN PERMINTAAN

${formatProducts(products)}

ATURAN PENGGUNAAN DATA

- Gunakan data dalam context sebagai sumber kebenaran.
- Jangan mengarang nama produk, SKU, kategori, deskripsi, atau harga.
- Jangan menghitung ulang harga modal, harga jual, atau margin menggunakan perkiraan.
- Margin berasal dari data aplikasi.
- Jika produk tidak ditemukan, katakan bahwa produk tersebut tidak ditemukan.
- Bedakan produk aktif dan tidak aktif berdasarkan data aplikasi.
- Pertanyaan mengenai stok harus menggunakan domain Inventory, bukan Product.
- Jangan menyatakan produk telah dijual, dibeli, atau direstock hanya berdasarkan data master produk.
`.trim();
}
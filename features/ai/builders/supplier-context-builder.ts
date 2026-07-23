import type {
  SupplierKnowledgeContext,
  SupplierKnowledgeItem,
} from "@/features/ai/types/supplier-knowledge";

function getStatusLabel(
  supplier: SupplierKnowledgeItem,
): string {
  return supplier.isActive
    ? "Aktif"
    : "Tidak aktif";
}

function getQueryKindLabel(
  kind:
    SupplierKnowledgeContext["query"]["kind"],
): string {
  if (kind === "active") {
    return "Daftar supplier aktif";
  }

  if (kind === "inactive") {
    return "Daftar supplier tidak aktif";
  }

  if (
    kind ===
    "supplier_detail"
  ) {
    return "Detail supplier";
  }

  return "Ringkasan supplier";
}

function formatSuppliers(
  suppliers:
    SupplierKnowledgeItem[],
): string {
  if (
    suppliers.length === 0
  ) {
    return "Tidak ada supplier yang ditemukan untuk permintaan ini.";
  }

  return suppliers
    .map(
      (
        supplier,
        index,
      ) => `
${index + 1}. ${supplier.name}
   - Status: ${getStatusLabel(supplier)}
   - Kontak: ${supplier.contactPerson ?? "Tidak tersedia"}
   - Telepon: ${supplier.phone ?? "Tidak tersedia"}
   - Email: ${supplier.email ?? "Tidak tersedia"}
   - Alamat: ${supplier.address ?? "Tidak tersedia"}
`.trim(),
    )
    .join("\n\n");
}

export function buildSupplierContext(
  context:
    SupplierKnowledgeContext,
): string {
  const {
    query,
    summary,
    suppliers,
    retrievedAt,
  } = context;

  return `
DATA BISNIS DURATU

DOMAIN DATA

Supplier Duratu Kafe.

SUMBER DATA

Tabel:
suppliers pada Supabase.

JENIS PERMINTAAN

${getQueryKindLabel(query.kind)}

Kata pencarian supplier:
${query.searchTerm ?? "Tidak ada"}

Waktu pengambilan data:
${retrievedAt}

RINGKASAN SUPPLIER

Total supplier:
${summary.totalSuppliers}

Supplier aktif:
${summary.activeSuppliers}

Supplier tidak aktif:
${summary.inactiveSuppliers}

SUPPLIER YANG SESUAI DENGAN PERMINTAAN

${formatSuppliers(suppliers)}

ATURAN PENGGUNAAN DATA

- Gunakan data supplier dalam context sebagai sumber kebenaran.
- Jangan mengarang nama, nomor telepon, email, alamat, atau kontak supplier.
- Jika informasi kontak tidak tersedia, katakan bahwa informasi tersebut belum tersedia.
- Jika supplier yang diminta tidak ditemukan, katakan bahwa supplier tersebut tidak ditemukan.
- Bedakan supplier aktif dan tidak aktif berdasarkan data aplikasi.
- Jangan mengklaim telah menghubungi supplier.
- Jangan mengklaim telah membuat Purchase Order atau Purchase Request.
`.trim();
}
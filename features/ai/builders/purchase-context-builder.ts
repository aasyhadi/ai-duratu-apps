import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import type {
  PurchaseKnowledgeContext,
  PurchaseKnowledgeOrder,
} from "@/features/ai/types/purchase-knowledge";

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

function getStatusLabel(
  status: PurchaseOrderStatus,
): string {
  const labels: Record<
    PurchaseOrderStatus,
    string
  > = {
    draft:
      "Draft",

    sent:
      "Terkirim",

    confirmed:
      "Dikonfirmasi",

    partial_received:
      "Diterima sebagian",

    completed:
      "Selesai",

    cancelled:
      "Dibatalkan",
  };

  return labels[status];
}

function getQueryKindLabel(
  context: PurchaseKnowledgeContext,
): string {
  if (
    context.query.kind ===
    "latest"
  ) {
    return "Purchase Order terbaru";
  }

  if (
    context.query.kind ===
    "largest"
  ) {
    return "Purchase Order dengan nilai terbesar";
  }

  if (
    context.query.kind ===
    "open"
  ) {
    return "Purchase Order yang belum selesai";
  }

  if (
    context.query.kind ===
    "status"
  ) {
    return "Purchase Order berdasarkan status";
  }

  if (
    context.query.kind ===
    "order_detail"
  ) {
    return "Detail Purchase Order";
  }

  return "Ringkasan Purchase Order";
}

function formatOrders(
  orders:
    PurchaseKnowledgeOrder[],
): string {
  if (orders.length === 0) {
    return "Tidak ada Purchase Order yang ditemukan untuk permintaan ini.";
  }

  return orders
    .map(
      (order, index) => `
${index + 1}. ${order.orderNumber}
   - Supplier: ${order.supplierName}
   - Status: ${getStatusLabel(order.status)}
   - Tanggal PO: ${order.orderDate}
   - Estimasi datang: ${order.expectedDate ?? "Tidak tersedia"}
   - Nilai PO: ${formatRupiah(order.totalAmount)}
   - Jumlah item: ${order.totalItems}
   - Kuantitas dipesan: ${order.totalOrderedQuantity}
   - Kuantitas diterima: ${order.totalReceivedQuantity}
`.trim(),
    )
    .join("\n\n");
}

export function buildPurchaseContext(
  context:
    PurchaseKnowledgeContext,
): string {
  const {
    query,
    summary,
    orders,
    retrievedAt,
  } = context;

  return `
DATA BISNIS DURATU

DOMAIN DATA

Purchase Order Duratu Kafe.

SUMBER DATA

Tabel:
purchase_orders
purchase_order_items
suppliers

pada Supabase.

JENIS PERMINTAAN

${getQueryKindLabel(context)}

Status yang diminta:
${query.status ?? "Tidak ada"}

Nomor PO yang dicari:
${query.searchTerm ?? "Tidak ada"}

Waktu pengambilan data:
${retrievedAt}

RINGKASAN PURCHASE ORDER

Total Purchase Order:
${summary.totalOrders}

Draft:
${summary.draftOrders}

Terkirim:
${summary.sentOrders}

Dikonfirmasi:
${summary.confirmedOrders}

Diterima sebagian:
${summary.partialReceivedOrders}

Selesai:
${summary.completedOrders}

Dibatalkan:
${summary.cancelledOrders}

Total nilai Purchase Order:
${formatRupiah(summary.totalOrderValue)}

PURCHASE ORDER YANG SESUAI DENGAN PERMINTAAN

${formatOrders(orders)}

ATURAN PENGGUNAAN DATA

- Gunakan angka dan status dalam context sebagai sumber kebenaran.
- Jangan mengarang Purchase Order.
- Jangan mengubah nilai Purchase Order.
- Jangan menyatakan PO selesai apabila statusnya bukan completed.
- Jangan menyatakan barang sudah diterima seluruhnya apabila total received masih lebih kecil daripada ordered.
- Jika PO tidak ditemukan, katakan bahwa PO tersebut tidak ditemukan.
- Jangan mengklaim membuat, mengubah, membatalkan, atau menerima PO.
- Bedakan fakta Purchase Order dengan rekomendasi.
- Purchase Order "belum selesai" mencakup status draft, sent, confirmed, dan partial_received.
- Purchase Order completed dan cancelled tidak termasuk PO yang masih berjalan.
`.trim();
}
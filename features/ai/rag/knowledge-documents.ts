export type KnowledgeDocument = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export const KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "sop-pelayanan",
    title: "SOP Pelayanan Pelanggan",
    category: "operation",
    content: `
Setiap pelanggan Duratu Kafe harus disambut dengan ramah.

Kasir atau staf yang menerima pelanggan harus:
- memberikan salam;
- memastikan pesanan pelanggan tercatat dengan benar;
- mengulang pesanan sebelum pembayaran;
- memberikan informasi estimasi waktu penyajian apabila diperlukan;
- mengucapkan terima kasih setelah transaksi selesai.

Apabila terjadi kesalahan pesanan, staf harus:
- meminta maaf kepada pelanggan;
- memeriksa kesalahan;
- melakukan koreksi sesuai kebijakan Duratu Kafe;
- melibatkan supervisor apabila masalah tidak dapat diselesaikan oleh staf.
`.trim(),
  },

  {
    id: "sop-kebersihan",
    title: "SOP Kebersihan Area Kafe",
    category: "operation",
    content: `
Area pelayanan dan produksi Duratu Kafe harus selalu dijaga kebersihannya.

Meja pelanggan harus dibersihkan setelah pelanggan selesai menggunakan meja.

Area bar harus dibersihkan secara berkala dan tidak boleh terdapat sisa bahan makanan atau minuman yang dapat mencemari produk.

Peralatan yang bersentuhan langsung dengan makanan dan minuman harus dicuci dan disanitasi setelah digunakan.

Sampah harus dibuang ke tempat sampah yang sesuai dan tidak boleh dibiarkan menumpuk di area produksi.
`.trim(),
  },

  {
    id: "kebijakan-refund",
    title: "Kebijakan Refund dan Kesalahan Pesanan",
    category: "policy",
    content: `
Refund tidak dilakukan secara otomatis.

Apabila pelanggan mengajukan refund, staf harus terlebih dahulu memeriksa transaksi dan alasan pengajuan.

Refund dapat dipertimbangkan apabila:
- terjadi kesalahan transaksi;
- pembayaran tercatat ganda;
- produk tidak dapat disediakan setelah pembayaran;
- terdapat kondisi lain yang disetujui supervisor.

Setiap refund harus memiliki alasan yang jelas dan dapat ditelusuri.
`.trim(),
  },

  {
    id: "panduan-restock",
    title: "Panduan Restock Persediaan",
    category: "inventory",
    content: `
Produk yang stoknya telah mencapai atau berada di bawah batas minimum harus ditinjau untuk proses restock.

Keputusan pembelian tidak hanya berdasarkan jumlah stok.

Staf juga perlu mempertimbangkan:
- kecepatan penggunaan produk;
- kebutuhan operasional;
- Purchase Order yang masih berjalan;
- waktu pengiriman supplier;
- kondisi penyimpanan.

Restock tidak boleh dianggap telah dilakukan sebelum Purchase Order atau proses pembelian benar-benar dibuat.
`.trim(),
  },
];
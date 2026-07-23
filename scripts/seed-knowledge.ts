import dotenv from "dotenv";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  GoogleGenAI,
} from "@google/genai";

dotenv.config({
  path: ".env.local",
});

const documents = [
  {
    documentKey:
      "sop-pelayanan",

    title:
      "SOP Pelayanan Pelanggan",

    category:
      "operation",

    content: `
Setiap pelanggan Duratu Kafe harus disambut dengan ramah.

Kasir atau staf yang menerima pelanggan harus memberikan salam, memastikan pesanan tercatat dengan benar, mengulang pesanan sebelum pembayaran, memberikan informasi estimasi waktu penyajian apabila diperlukan, dan mengucapkan terima kasih setelah transaksi selesai.

Apabila terjadi kesalahan pesanan, staf harus meminta maaf, memeriksa kesalahan, melakukan koreksi sesuai kebijakan Duratu Kafe, dan melibatkan supervisor apabila masalah tidak dapat diselesaikan oleh staf.
`.trim(),
  },

  {
    documentKey:
      "sop-kebersihan",

    title:
      "SOP Kebersihan Area Kafe",

    category:
      "operation",

    content: `
Area pelayanan dan produksi Duratu Kafe harus selalu dijaga kebersihannya.

Meja pelanggan harus dibersihkan setelah pelanggan selesai menggunakan meja.

Area bar harus dibersihkan secara berkala.

Peralatan yang bersentuhan dengan makanan dan minuman harus dicuci dan disanitasi setelah digunakan.

Sampah tidak boleh dibiarkan menumpuk di area produksi.
`.trim(),
  },

  {
    documentKey:
      "kebijakan-refund",

    title:
      "Kebijakan Refund",

    category:
      "policy",

    content: `
Refund tidak dilakukan secara otomatis.

Staf harus memeriksa transaksi dan alasan pengajuan.

Refund dapat dipertimbangkan apabila terjadi kesalahan transaksi, pembayaran tercatat ganda, produk tidak dapat disediakan setelah pembayaran, atau kondisi lain yang disetujui supervisor.

Setiap refund harus memiliki alasan yang jelas dan dapat ditelusuri.
`.trim(),
  },

  {
    documentKey:
      "panduan-restock",

    title:
      "Panduan Restock Persediaan",

    category:
      "inventory",

    content: `
Produk yang stoknya mencapai atau berada di bawah batas minimum harus ditinjau untuk proses restock.

Keputusan pembelian juga mempertimbangkan kecepatan penggunaan, kebutuhan operasional, Purchase Order yang masih berjalan, waktu pengiriman supplier, dan kondisi penyimpanan.

Restock tidak boleh dianggap selesai sebelum proses pembelian benar-benar dilakukan.
`.trim(),
  },
];

async function main() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY; 

  const geminiApiKey =
    process.env
      .GEMINI_API_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !geminiApiKey
  ) {
    throw new Error(
      "Environment variable Supabase atau Gemini belum lengkap.",
    );
  }

  const supabase =
    createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

  const ai =
    new GoogleGenAI({
      apiKey:
        geminiApiKey,
    });

  for (
    const document
    of documents
  ) {
    console.info(
      `Embedding: ${document.title}`,
    );

    const result =
      await ai.models.embedContent({
        model:
          "gemini-embedding-001",

        contents:
          [
            document.title,
            document.category,
            document.content,
          ].join("\n\n"),

        config: {
          outputDimensionality:
            768,
        },
      });

    const embedding =
      result
        .embeddings?.[0]
        ?.values;

    if (!embedding) {
      throw new Error(
        `Embedding gagal: ${document.title}`,
      );
    }

    const {
      error,
    } = await supabase
      .from(
        "knowledge_documents",
      )
      .upsert(
        {
          document_key:
            document.documentKey,

          title:
            document.title,

          category:
            document.category,

          content:
            document.content,

          embedding,

          updated_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "document_key",
        },
      );

    if (error) {
      throw error;
    }
  }

  console.info(
    "Knowledge base berhasil dibuat.",
  );
}

main().catch(
  (error) => {
    console.error(error);

    process.exit(1);
  },
);
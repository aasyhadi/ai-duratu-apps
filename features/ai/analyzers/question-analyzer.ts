import type {
  QuestionAnalysis,
  QuestionCategory,
  QuestionIntent,
} from "@/features/ai/types/rag";

type CategoryRule = {
  category: Exclude<
    QuestionCategory,
    "general"
  >;

  keywords: readonly string[];

  /**
   * Digunakan ketika dua kategori
   * mempunyai skor keyword yang sama.
   */
  priority: number;
};

type IntentRule = {
  intent: Exclude<
    QuestionIntent,
    "unknown"
  >;

  keywords: readonly string[];

  priority: number;
};

type CategoryCandidate = {
  category: Exclude<
    QuestionCategory,
    "general"
  >;

  priority: number;
  matchedKeywords: string[];
  score: number;
};

type IntentCandidate = {
  intent: Exclude<
    QuestionIntent,
    "unknown"
  >;

  priority: number;
  matchedKeywords: string[];
  score: number;
};

const CATEGORY_RULES: readonly CategoryRule[] =
  [
    {
      category: "inventory",

      /**
       * Inventory harus memiliki prioritas
       * lebih tinggi daripada product.
       *
       * Pertanyaan "stok kopi" mengandung
       * kata kopi dan stok, tetapi domain
       * yang benar adalah inventory.
       */
      priority: 80,

      keywords: [
        "stok",
        "persediaan",
        "inventory",
        "restock",
        "stok menipis",
        "stok rendah",
        "stok minimum",
        "minimum stok",
        "minimum stock",
        "stok habis",
        "kehabisan stok",
        "barang habis",
        "produk habis",
        "menu habis",
        "jumlah stok",
        "total stok",
        "nilai persediaan",
        "nilai inventory",
        "pergerakan stok",
        "mutasi stok",
        "stok masuk",
        "stok keluar",
      ],
    },

    {
      category: "supplier",
      priority: 70,

      keywords: [
        "supplier",
        "pemasok",
        "vendor",
        "supplier aktif",
        "supplier tidak aktif",
        "pemasok aktif",
        "pemasok tidak aktif",
        "daftar supplier",
        "daftar pemasok",
        "kontak supplier",
        "kontak pemasok",
        "nomor supplier",
        "nomor telepon supplier",
        "telepon supplier",
        "email supplier",
        "alamat supplier",
      ],
    },

    {
      category: "purchase",
      priority: 60,

      keywords: [
        "purchase order",
        "purchase request",

        "po pembelian",
        "permintaan pembelian",
        "pesanan pembelian",
        "order pembelian",

        "pembelian barang",
        "pembelian bahan",

        "po terakhir",
        "po terbaru",
        "po paling baru",

        "po terbesar",
        "po paling besar",
        "nilai po",
        "total po",

        "po mana",
        "po yang",

        "status po",
        "daftar po",
        "nomor po",

        "po belum selesai",
        "po yang belum selesai",
        "po masih berjalan",
        "po yang masih berjalan",

        "po selesai",
        "po yang selesai",

        "po dibatalkan",
        "po dikonfirmasi",
        "po dikirim",
        "po terkirim",
        "po draft",

        "diterima sebagian",
      ],
    },

    {
      category: "report",
      priority: 50,

      keywords: [
        "laporan",
        "ringkasan",
        "rekap",
        "rekapitulasi",
        "dashboard",
        "performa bisnis",
        "kinerja bisnis",
        "laporan harian",
        "laporan mingguan",
        "laporan bulanan",
        "laporan tahunan",
        "laba rugi",
        "untung rugi",
        "profit loss",
        "analisis bisnis",
        "penyebab kerugian",
        "kondisi keuangan",
        "analisis keuangan",
        "analisa keuangan",
        "evaluasi bisnis",
        "kategori terbesar",
        "biaya terbesar",
        "pengeluaran terbesar",
      ],
    },

    {
      category: "sales",
      priority: 40,

      keywords: [
        "penjualan",
        "pendapatan",
        "omzet",
        "omset",
        "revenue",
        "income",
        "laba",
        "keuntungan",
        "profit",
        "terjual",
        "produk terlaris",
        "menu terlaris",
        "penjualan tertinggi",
        "penjualan terendah",
        "rata rata penjualan",
        "rata-rata penjualan",
        "target penjualan",
        "total penjualan",
        "total pendapatan",
      ],
    },

    {
      category: "transaction",
      priority: 30,

      keywords: [
        "transaksi",
        "pembayaran",
        "struk",
        "invoice",
        "nota",
        "pesanan pelanggan",
        "order pelanggan",
        "refund",
        "pengembalian dana",
        "metode pembayaran",
        "tunai",
        "cash",
        "qris",
        "debit",
        "kredit",
        "jumlah transaksi",
        "total transaksi",
      ],
    },

    {
      category: "product",
      priority: 20,

      keywords: [
        "produk",
        "menu",
        "makanan",
        "minuman",
        "kopi",
        "harga produk",
        "harga menu",
        "kategori produk",
        "produk aktif",
        "produk tidak aktif",
        "menu tersedia",
        "harga jual",
        "harga modal",
        "food cost",
        "sku",
        "satuan produk",
      ],
    },
  ] as const;

const INTENT_RULES: readonly IntentRule[] =
  [
    {
      intent: "report",
      priority: 40,

      keywords: [
        "buat laporan",
        "buatkan laporan",
        "buat ringkasan",
        "buatkan ringkasan",
        "tampilkan laporan",
        "ringkas data",
        "analisis data",
        "analisa data",
        "rekap",
        "rekapitulasi",
        "laporan",
      ],
    },

    {
      intent: "business_data",
      priority: 30,

      keywords: [
        "berapa",
        "berapa banyak",
        "berapa jumlah",
        "berapa total",
        "total",
        "jumlah",
        "nilai",
        "tampilkan",
        "daftar",
        "siapa",
        "mana",
        "apa saja",
        "kontak",
        "nomor telepon",
        "email",
        "alamat",
        "status",
        "tertinggi",
        "terendah",
        "terlaris",
        "paling laku",
        "paling sedikit",
        "hari ini",
        "kemarin",
        "minggu ini",
        "minggu lalu",
        "bulan ini",
        "bulan lalu",
        "tahun ini",
        "tahun lalu",
        "duratu",
        "kafe saya",
        "bisnis saya",
        "cabang saya",
        "data saya",
        "terbesar",
        "paling besar",
        "penyebab",
        "komposisi",
        "persentase",
        "aktif",
        "tidak aktif",
        "terbaru",
        "terakhir",
        "belum selesai",
        "sudah selesai",
      ],
    },

    {
      intent: "definition",
      priority: 20,

      keywords: [
        "apa itu",
        "apa yang dimaksud",
        "jelaskan pengertian",
        "pengertian",
        "definisi",
        "arti",
        "maksud dari",
        "jelaskan apa",
      ],
    },

    {
      intent: "advice",
      priority: 10,

      keywords: [
        "bagaimana cara",
        "bagaimana meningkatkan",
        "bagaimana mengurangi",
        "apa strategi",
        "berikan strategi",
        "beri saran",
        "berikan saran",
        "tips",
        "rekomendasi",
        "sebaiknya",
        "solusi",
      ],
    },
  ] as const;

const BUSINESS_TIME_KEYWORDS = [
  "hari ini",
  "kemarin",
  "minggu ini",
  "minggu lalu",
  "bulan ini",
  "bulan lalu",
  "tahun ini",
  "tahun lalu",
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
] as const;

function normalizeQuestion(
  question: string,
): string {
  return question
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKeyword(
  keyword: string,
): string {
  return normalizeQuestion(
    keyword,
  );
}

function containsKeyword(
  normalizedQuestion: string,
  keyword: string,
): boolean {
  const normalizedKeyword =
    normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  return normalizedQuestion.includes(
    normalizedKeyword,
  );
}

function findMatchedKeywords(
  normalizedQuestion: string,
  keywords: readonly string[],
): string[] {
  return keywords.filter(
    (keyword) =>
      containsKeyword(
        normalizedQuestion,
        keyword,
      ),
  );
}

function buildCategoryCandidates(
  normalizedQuestion: string,
): CategoryCandidate[] {
  return CATEGORY_RULES.map(
    (rule): CategoryCandidate => {
      const matchedKeywords =
        findMatchedKeywords(
          normalizedQuestion,
          rule.keywords,
        );

      return {
        category:
          rule.category,

        priority:
          rule.priority,

        matchedKeywords,

        score:
          matchedKeywords.length,
      };
    },
  )
    .filter(
      (candidate) =>
        candidate.score > 0,
    )
    .sort((first, second) => {
      if (
        second.score !==
        first.score
      ) {
        return (
          second.score -
          first.score
        );
      }

      return (
        second.priority -
        first.priority
      );
    });
}

function buildIntentCandidates(
  normalizedQuestion: string,
): IntentCandidate[] {
  return INTENT_RULES.map(
    (rule): IntentCandidate => {
      const matchedKeywords =
        findMatchedKeywords(
          normalizedQuestion,
          rule.keywords,
        );

      return {
        intent:
          rule.intent,

        priority:
          rule.priority,

        matchedKeywords,

        score:
          matchedKeywords.length,
      };
    },
  )
    .filter(
      (candidate) =>
        candidate.score > 0,
    )
    .sort((first, second) => {
      if (
        second.score !==
        first.score
      ) {
        return (
          second.score -
          first.score
        );
      }

      return (
        second.priority -
        first.priority
      );
    });
}

function calculateConfidence(
  categoryKeywordCount: number,
  intentKeywordCount: number,
): number {
  const totalSignals =
    categoryKeywordCount +
    intentKeywordCount;

  if (totalSignals <= 0) {
    return 0;
  }

  if (totalSignals === 1) {
    return 0.6;
  }

  if (totalSignals === 2) {
    return 0.75;
  }

  if (totalSignals === 3) {
    return 0.85;
  }

  return 0.95;
}

function resolveIntent(
  intentCandidate:
    | IntentCandidate
    | undefined,
): QuestionIntent {
  return (
    intentCandidate?.intent ??
    "unknown"
  );
}

function resolveCategory(
  categoryCandidate:
    | CategoryCandidate
    | undefined,
  intent: QuestionIntent,
): QuestionCategory {
  /**
   * Pertanyaan definisi atau saran
   * tidak memerlukan query data bisnis,
   * walaupun mengandung istilah bisnis.
   */
  if (
    intent === "definition" ||
    intent === "advice"
  ) {
    return "general";
  }

  return (
    categoryCandidate
      ?.category ??
    "general"
  );
}

function shouldRetrieveBusinessData(
  category: QuestionCategory,
  intent: QuestionIntent,
): boolean {
  if (
    category === "general"
  ) {
    return false;
  }

  return (
    intent ===
      "business_data" ||
    intent === "report"
  );
}

export function analyzeQuestion(
  question: string,
): QuestionAnalysis {
  const normalizedQuestion =
    normalizeQuestion(
      question,
    );

  if (!normalizedQuestion) {
    return {
      category:
        "general",

      intent:
        "unknown",

      confidence:
        0,

      matchedKeywords:
        [],

      matchedIntentKeywords:
        [],

      requiresBusinessData:
        false,
    };
  }

  const categoryCandidates =
    buildCategoryCandidates(
      normalizedQuestion,
    );

  const intentCandidates =
    buildIntentCandidates(
      normalizedQuestion,
    );

  const bestCategoryCandidate =
    categoryCandidates[0];

  const bestIntentCandidate =
    intentCandidates[0];

  const intent =
    resolveIntent(
      bestIntentCandidate,
    );

  const category =
    resolveCategory(
      bestCategoryCandidate,
      intent,
    );

  const matchedTimeKeywords =
    findMatchedKeywords(
      normalizedQuestion,
      BUSINESS_TIME_KEYWORDS,
    );

  const matchedKeywords = [
    ...new Set([
      ...(
        bestCategoryCandidate
          ?.matchedKeywords ??
        []
      ),

      ...matchedTimeKeywords,
    ]),
  ];

  const matchedIntentKeywords =
    bestIntentCandidate
      ?.matchedKeywords ??
    [];

  return {
    category,
    intent,

    confidence:
      calculateConfidence(
        bestCategoryCandidate
          ?.matchedKeywords
          .length ??
          0,

        matchedIntentKeywords
          .length,
      ),

    matchedKeywords,

    matchedIntentKeywords,

    requiresBusinessData:
      shouldRetrieveBusinessData(
        category,
        intent,
      ),
  };
}
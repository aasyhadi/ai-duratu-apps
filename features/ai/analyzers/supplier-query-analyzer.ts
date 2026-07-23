import type {
  SupplierQueryAnalysis,
  SupplierQueryKind,
} from "@/features/ai/types/supplier-knowledge";

const ACTIVE_KEYWORDS = [
  "supplier aktif",
  "pemasok aktif",
  "vendor aktif",
] as const;

const INACTIVE_KEYWORDS = [
  "supplier tidak aktif",
  "supplier nonaktif",
  "pemasok tidak aktif",
  "pemasok nonaktif",
  "vendor tidak aktif",
  "vendor nonaktif",
] as const;

const DETAIL_PREFIXES = [
  "kontak supplier",
  "kontak pemasok",
  "kontak vendor",

  "nomor supplier",
  "nomor pemasok",
  "nomor vendor",

  "nomor telepon supplier",
  "nomor telepon pemasok",
  "nomor telepon vendor",

  "telepon supplier",
  "telepon pemasok",
  "telepon vendor",

  "email supplier",
  "email pemasok",
  "email vendor",

  "alamat supplier",
  "alamat pemasok",
  "alamat vendor",

  "siapa supplier",
  "siapa pemasok",
  "siapa vendor",

  "detail supplier",
  "detail pemasok",
  "detail vendor",

  "cari supplier",
  "cari pemasok",
  "cari vendor",
] as const;

const REMOVABLE_WORDS = [
  "berapa",
  "berapa banyak",
  "berapa jumlah",
  "berapa nomor",

  "apa",
  "siapa",
  "mana",

  "nomor telepon",
  "nomor hp",
  "no telepon",
  "no telp",
  "no hp",

  "nomor",
  "telepon",
  "telp",
  "phone",
  "hp",

  "kontak",
  "contact",

  "email",
  "alamat",

  "detail",
  "informasi",
  "info",

  "cari",
  "cek",
  "lihat",
  "tampilkan",

  "tolong",

  "supplier",
  "pemasok",
  "vendor",

  "duratu",
  "kafe",
  "cafe",

  "saya",
  "kami",

  "nya",
] as const;

function normalizeText(
  value: string,
): string {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function findMatches(
  normalizedQuestion: string,
  keywords: readonly string[],
): string[] {
  return keywords.filter(
    (keyword) =>
      normalizedQuestion.includes(
        normalizeText(keyword),
      ),
  );
}

function detectKind(
  normalizedQuestion: string,
): {
  kind: SupplierQueryKind;
  matchedKeywords: string[];
} {
  /**
   * Penting:
   * inactive diperiksa lebih dulu.
   *
   * Karena frasa:
   *
   * "supplier tidak aktif"
   *
   * juga mengandung kata:
   *
   * "supplier aktif"
   *
   * jika proses klasifikasi dilakukan
   * terlalu longgar.
   */
  const inactiveMatches =
    findMatches(
      normalizedQuestion,
      INACTIVE_KEYWORDS,
    );

  if (
    inactiveMatches.length >
    0
  ) {
    return {
      kind:
        "inactive",

      matchedKeywords:
        inactiveMatches,
    };
  }

  const activeMatches =
    findMatches(
      normalizedQuestion,
      ACTIVE_KEYWORDS,
    );

  if (
    activeMatches.length >
    0
  ) {
    return {
      kind:
        "active",

      matchedKeywords:
        activeMatches,
    };
  }

  const detailMatches =
    findMatches(
      normalizedQuestion,
      DETAIL_PREFIXES,
    );

  if (
    detailMatches.length >
    0
  ) {
    return {
      kind:
        "supplier_detail",

      matchedKeywords:
        detailMatches,
    };
  }

  /**
   * Jika pertanyaan mengandung kata
   * supplier/pemasok/vendor dan tidak
   * masuk filter khusus di atas,
   * default-nya adalah summary.
   */
  return {
    kind:
      "summary",

    matchedKeywords:
      [],
  };
}

function buildRemovablePhrases(): string[] {
  /**
   * Frasa panjang harus dibuang lebih
   * dahulu.
   *
   * Contoh:
   *
   * "nomor telepon supplier"
   *
   * harus diproses sebelum:
   *
   * "nomor"
   * "telepon"
   * "supplier"
   *
   * agar extraction tidak meninggalkan
   * potongan kata yang tidak perlu.
   */
  return [
    ...DETAIL_PREFIXES,
    ...REMOVABLE_WORDS,
  ]
    .map(
      (phrase) =>
        normalizeText(
          phrase,
        ),
    )
    .filter(Boolean)
    .sort(
      (
        first,
        second,
      ) =>
        second.length -
        first.length,
    );
}

function extractSearchTerm(
  normalizedQuestion: string,
  kind: SupplierQueryKind,
): string | null {
  if (
    kind !==
    "supplier_detail"
  ) {
    return null;
  }

  let candidate =
    normalizedQuestion;

  const removablePhrases =
    buildRemovablePhrases();

  for (
    const normalizedPhrase
    of removablePhrases
  ) {
    /**
     * Escape karakter regex untuk
     * keamanan, walaupun hasil
     * normalizeText umumnya sudah
     * sederhana.
     */
    const escapedPhrase =
      normalizedPhrase.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

    const phrasePattern =
      escapedPhrase.replace(
        /\s+/g,
        "\\s+",
      );

    candidate =
      candidate.replace(
        new RegExp(
          `\\b${phrasePattern}\\b`,
          "g",
        ),
        " ",
      );
  }

  candidate =
    candidate
      .replace(/\s+/g, " ")
      .trim();

  return candidate || null;
}

export function analyzeSupplierQuery(
  question: string,
): SupplierQueryAnalysis {
  const normalizedQuestion =
    normalizeText(
      question,
    );

  if (!normalizedQuestion) {
    return {
      kind:
        "summary",

      searchTerm:
        null,

      matchedKeywords:
        [],
    };
  }

  const result =
    detectKind(
      normalizedQuestion,
    );

  const searchTerm =
    extractSearchTerm(
      normalizedQuestion,
      result.kind,
    );

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Supplier AI analyzer:",
      {
        question,
        normalizedQuestion,

        kind:
          result.kind,

        searchTerm,

        matchedKeywords:
          result.matchedKeywords,
      },
    );
  }

  return {
    kind:
      result.kind,

    searchTerm,

    matchedKeywords: [
      ...new Set(
        result.matchedKeywords,
      ),
    ],
  };
}
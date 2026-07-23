import type {
  ProductQueryAnalysis,
  ProductQueryKind,
} from "@/features/ai/types/product-knowledge";

const ACTIVE_KEYWORDS = [
  "produk aktif",
  "menu aktif",
  "produk tersedia",
  "menu tersedia",
] as const;

const INACTIVE_KEYWORDS = [
  "produk tidak aktif",
  "produk nonaktif",
  "menu tidak aktif",
  "menu nonaktif",
] as const;

const CATEGORY_PREFIXES = [
  "produk kategori",
  "menu kategori",
  "kategori produk",
  "kategori menu",
  "produk dalam kategori",
  "menu dalam kategori",
] as const;

const DETAIL_PREFIXES = [
  "harga produk",
  "harga menu",

  "harga jual",
  "harga modal",

  "margin produk",
  "margin menu",
  "margin",

  "sku produk",
  "sku menu",
  "sku",

  "detail produk",
  "detail menu",

  "informasi produk",
  "informasi menu",

  "cari produk",
  "cari menu",
] as const;

const REMOVABLE_WORDS = [
  "berapa",
  "apa",
  "berapa harga",
  "harga",
  "harga jual",
  "harga modal",

  "berapa margin",
  "margin",
  "keuntungan",
  "laba",

  "berapa persen",
  "persen",

  "sku",

  "detail",
  "informasi",
  "info",

  "produk",
  "menu",
  "makanan",
  "minuman",

  "duratu",
  "kafe",
  "cafe",

  "tolong",
  "tampilkan",
  "lihat",
  "cek",
  "cari",

  "saya",
  "kami",
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
  kind: ProductQueryKind;
  matchedKeywords: string[];
} {
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

  const categoryMatches =
    findMatches(
      normalizedQuestion,
      CATEGORY_PREFIXES,
    );

  if (
    categoryMatches.length >
    0
  ) {
    return {
      kind:
        "category",

      matchedKeywords:
        categoryMatches,
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
        "product_detail",

      matchedKeywords:
        detailMatches,
    };
  }

  return {
    kind:
      "summary",

    matchedKeywords:
      [],
  };
}

function removePhrases(
  value: string,
  phrases: readonly string[],
): string {
  let candidate =
    value;

  const normalizedPhrases =
    phrases
      .map(normalizeText)
      .filter(Boolean)
      .sort(
        (
          first,
          second,
        ) =>
          second.length -
          first.length,
      );

  for (
    const phrase
    of normalizedPhrases
  ) {
    const escaped =
      phrase.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

    candidate =
      candidate.replace(
        new RegExp(
          `\\b${escaped.replace(
            /\s+/g,
            "\\s+",
          )}\\b`,
          "g",
        ),
        " ",
      );
  }

  return candidate
    .replace(/\s+/g, " ")
    .trim();
}

function extractSearchTerm(
  normalizedQuestion: string,
  kind: ProductQueryKind,
): string | null {
  if (
    kind !==
    "product_detail"
  ) {
    return null;
  }

  const candidate =
    removePhrases(
      normalizedQuestion,
      [
        ...DETAIL_PREFIXES,
        ...REMOVABLE_WORDS,
      ],
    );

  return candidate || null;
}

function extractCategoryTerm(
  normalizedQuestion: string,
  kind: ProductQueryKind,
): string | null {
  if (
    kind !== "category"
  ) {
    return null;
  }

  const candidate =
    removePhrases(
      normalizedQuestion,
      [
        ...CATEGORY_PREFIXES,
        "produk",
        "menu",
        "kategori",
        "apa",
        "apa saja",
        "tampilkan",
        "daftar",
        "dalam",
        "yang",
        "duratu",
        "kafe",
        "cafe",
      ],
    );

  return candidate || null;
}

export function analyzeProductQuery(
  question: string,
): ProductQueryAnalysis {
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

      categoryTerm:
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

  const categoryTerm =
    extractCategoryTerm(
      normalizedQuestion,
      result.kind,
    );

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Product AI analyzer:",
      {
        question,

        normalizedQuestion,

        kind:
          result.kind,

        searchTerm,

        categoryTerm,

        matchedKeywords:
          result.matchedKeywords,
      },
    );
  }

  return {
    kind:
      result.kind,

    searchTerm,

    categoryTerm,

    matchedKeywords: [
      ...new Set(
        result.matchedKeywords,
      ),
    ],
  };
}
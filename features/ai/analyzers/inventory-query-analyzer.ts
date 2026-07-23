import type {
  InventoryQueryAnalysis,
  InventoryQueryKind,
} from "@/features/ai/types/inventory-knowledge";

const SUMMARY_KEYWORDS = [
  "ringkasan stok",
  "ringkasan persediaan",
  "kondisi stok",
  "kondisi persediaan",
  "total stok",
  "jumlah stok",
  "nilai persediaan",
  "nilai inventory",
  "inventory",
  "persediaan",
] as const;

const LOW_STOCK_KEYWORDS = [
  "stok rendah",
  "stok menipis",
  "stok sedikit",
  "hampir habis",
  "perlu restock",
  "perlu di restock",
  "perlu dibeli",
  "minimum stok",
  "minimum stock",
  "low stock",
] as const;

const OUT_OF_STOCK_KEYWORDS = [
  "stok habis",
  "produk habis",
  "menu habis",
  "tidak ada stok",
  "stok kosong",
  "out of stock",
] as const;

const PRODUCT_STOCK_PREFIXES = [
  "berapa stok",
  "jumlah stok",
  "stok produk",
  "stok menu",
  "stok barang",
  "cek stok",
  "lihat stok",
  "persediaan",
] as const;

const REMOVABLE_WORDS = [
  "sekarang",
  "saat ini",
  "hari ini",
  "berapa",
  "jumlah",
  "produk",
  "menu",
  "barang",
  "stok",
  "persediaan",
  "duratu",
  "kafe",
  "cafe",
  "saya",
  "kami",
  "tolong",
  "cek",
  "lihat",
  "tampilkan",
] as const;

function normalizeText(
  value: string,
): string {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findMatches(
  normalizedQuestion: string,
  keywords: readonly string[],
): string[] {
  return keywords.filter((keyword) =>
    normalizedQuestion.includes(
      normalizeText(keyword),
    ),
  );
}

function detectKind(
  normalizedQuestion: string,
): {
  kind: InventoryQueryKind;
  matchedKeywords: string[];
} {
  const outOfStockMatches =
    findMatches(
      normalizedQuestion,
      OUT_OF_STOCK_KEYWORDS,
    );

  if (outOfStockMatches.length > 0) {
    return {
      kind: "out_of_stock",
      matchedKeywords:
        outOfStockMatches,
    };
  }

  const lowStockMatches =
    findMatches(
      normalizedQuestion,
      LOW_STOCK_KEYWORDS,
    );

  if (lowStockMatches.length > 0) {
    return {
      kind: "low_stock",
      matchedKeywords:
        lowStockMatches,
    };
  }

  const productStockMatches =
    findMatches(
      normalizedQuestion,
      PRODUCT_STOCK_PREFIXES,
    );

  if (productStockMatches.length > 0) {
    return {
      kind: "product_stock",
      matchedKeywords:
        productStockMatches,
    };
  }

  const summaryMatches =
    findMatches(
      normalizedQuestion,
      SUMMARY_KEYWORDS,
    );

  return {
    kind: "summary",
    matchedKeywords:
      summaryMatches,
  };
}

function extractSearchTerm(
  normalizedQuestion: string,
  kind: InventoryQueryKind,
): string | null {
  if (kind !== "product_stock") {
    return null;
  }

  let candidate =
    normalizedQuestion;

  for (const phrase of [
    ...PRODUCT_STOCK_PREFIXES,
    ...REMOVABLE_WORDS,
  ]) {
    const normalizedPhrase =
      normalizeText(phrase);

    candidate = candidate.replace(
      new RegExp(
        `\\b${normalizedPhrase.replace(
          /\s+/g,
          "\\s+",
        )}\\b`,
        "g",
      ),
      " ",
    );
  }

  const normalizedCandidate =
    candidate
      .replace(/\s+/g, " ")
      .trim();

  return normalizedCandidate || null;
}

export function analyzeInventoryQuery(
  question: string,
): InventoryQueryAnalysis {
  const normalizedQuestion =
    normalizeText(question);

  const kindResult =
    detectKind(normalizedQuestion);

  return {
    kind: kindResult.kind,

    searchTerm: extractSearchTerm(
      normalizedQuestion,
      kindResult.kind,
    ),

    matchedKeywords: [
      ...new Set(
        kindResult.matchedKeywords,
      ),
    ],
  };
}
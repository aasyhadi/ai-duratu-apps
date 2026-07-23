import type {
  PurchaseOrderStatus,
} from "@/features/purchase-orders/types/purchase-order";

import type {
  PurchaseQueryAnalysis,
  PurchaseQueryKind,
} from "@/features/ai/types/purchase-knowledge";

const OPEN_KEYWORDS = [
  "po belum selesai",
  "po yang belum selesai",
  "purchase order belum selesai",
  "purchase order yang belum selesai",
  "po masih berjalan",
  "po yang masih berjalan",
  "purchase order masih berjalan",
  "po aktif",
  "po terbuka",
  "open po",
  "open purchase order",
  "po belum complete",
  "po belum completed",
] as const;

const LATEST_KEYWORDS = [
  "po terakhir",
  "po terbaru",
  "po paling baru",
  "purchase order terakhir",
  "purchase order terbaru",
  "purchase order paling baru",
] as const;

const LARGEST_KEYWORDS = [
  "po terbesar",
  "purchase order terbesar",
  "nilai po terbesar",
  "po paling besar",
  "po dengan nilai terbesar",
  "po yang nilainya paling besar",
  "po mana yang nilainya paling besar",
  "purchase order dengan nilai terbesar",
  "purchase order paling besar",
] as const;

const DETAIL_PREFIXES = [
  "detail po",
  "detail purchase order",
  "nomor po",
  "purchase order nomor",
  "cari po",
  "cari purchase order",
  "lihat po",
  "lihat purchase order",
] as const;

const STATUS_RULES: ReadonlyArray<{
  status: PurchaseOrderStatus;
  keywords: readonly string[];
}> = [
  {
    status: "partial_received",
    keywords: [
      "po diterima sebagian",
      "diterima sebagian",
      "partial received",
      "partial_received",
    ],
  },

  {
    status: "completed",
    keywords: [
      "po selesai",
      "po yang selesai",
      "po sudah selesai",
      "purchase order selesai",
      "sudah selesai",
      "completed",
    ],
  },

  {
    status: "cancelled",
    keywords: [
      "po dibatalkan",
      "po yang dibatalkan",
      "purchase order dibatalkan",
      "dibatalkan",
      "cancelled",
    ],
  },

  {
    status: "confirmed",
    keywords: [
      "po dikonfirmasi",
      "po yang dikonfirmasi",
      "purchase order dikonfirmasi",
      "dikonfirmasi",
      "confirmed",
    ],
  },

  {
    status: "sent",
    keywords: [
      "po terkirim",
      "po dikirim",
      "po yang dikirim",
      "purchase order terkirim",
      "sudah dikirim",
      "sent",
    ],
  },

  {
    status: "draft",
    keywords: [
      "po draft",
      "po yang masih draft",
      "purchase order draft",
      "masih draft",
      "draft",
    ],
  },
];

const REMOVABLE_WORDS = [
  "berapa",
  "apa",
  "mana",
  "yang",
  "nomor",
  "detail",
  "cari",
  "cek",
  "lihat",
  "tampilkan",
  "tolong",
  "purchase order",
  "po",
  "duratu",
  "kafe",
  "cafe",
] as const;

function normalizeText(
  value: string,
): string {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(
      /[^\p{L}\p{N}\s/-]/gu,
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

function detectStatus(
  normalizedQuestion: string,
): {
  status: PurchaseOrderStatus | null;
  matchedKeywords: string[];
} {
  for (
    const rule
    of STATUS_RULES
  ) {
    const matches =
      findMatches(
        normalizedQuestion,
        rule.keywords,
      );

    if (
      matches.length >
      0
    ) {
      return {
        status:
          rule.status,

        matchedKeywords:
          matches,
      };
    }
  }

  return {
    status:
      null,

    matchedKeywords:
      [],
  };
}

function detectKind(
  normalizedQuestion: string,
): {
  kind: PurchaseQueryKind;
  matchedKeywords: string[];
} {
  /**
   * "Belum selesai" harus diperiksa
   * sebelum status "selesai".
   *
   * Karena frasa "belum selesai"
   * mengandung kata "selesai".
   */
  const openMatches =
    findMatches(
      normalizedQuestion,
      OPEN_KEYWORDS,
    );

  if (
    openMatches.length >
    0
  ) {
    return {
      kind:
        "open",

      matchedKeywords:
        openMatches,
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
        "order_detail",

      matchedKeywords:
        detailMatches,
    };
  }

  const largestMatches =
    findMatches(
      normalizedQuestion,
      LARGEST_KEYWORDS,
    );

  if (
    largestMatches.length >
    0
  ) {
    return {
      kind:
        "largest",

      matchedKeywords:
        largestMatches,
    };
  }

  const latestMatches =
    findMatches(
      normalizedQuestion,
      LATEST_KEYWORDS,
    );

  if (
    latestMatches.length >
    0
  ) {
    return {
      kind:
        "latest",

      matchedKeywords:
        latestMatches,
    };
  }

  const statusResult =
    detectStatus(
      normalizedQuestion,
    );

  if (
    statusResult.status
  ) {
    return {
      kind:
        "status",

      matchedKeywords:
        statusResult
          .matchedKeywords,
    };
  }

  return {
    kind:
      "summary",

    matchedKeywords:
      [],
  };
}

function extractSearchTerm(
  normalizedQuestion: string,
  kind: PurchaseQueryKind,
): string | null {
  if (
    kind !==
    "order_detail"
  ) {
    return null;
  }

  let candidate =
    normalizedQuestion;

  const phrases = [
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

  for (
    const phrase
    of phrases
  ) {
    const escaped =
      phrase.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

    const pattern =
      escaped.replace(
        /\s+/g,
        "\\s+",
      );

    candidate =
      candidate.replace(
        new RegExp(
          `\\b${pattern}\\b`,
          "g",
        ),
        " ",
      );
  }

  candidate =
    candidate
      .replace(/\s+/g, " ")
      .trim();

  return (
    candidate ||
    null
  );
}

export function analyzePurchaseQuery(
  question: string,
): PurchaseQueryAnalysis {
  const normalizedQuestion =
    normalizeText(
      question,
    );

  if (!normalizedQuestion) {
    return {
      kind:
        "summary",

      status:
        null,

      searchTerm:
        null,

      matchedKeywords:
        [],
    };
  }

  const kindResult =
    detectKind(
      normalizedQuestion,
    );

  /**
   * Query "open" bukan satu status.
   *
   * Karena open mencakup:
   *
   * draft
   * sent
   * confirmed
   * partial_received
   */
  const statusResult =
    kindResult.kind ===
    "open"
      ? {
          status:
            null,

          matchedKeywords:
            [],
        }
      : detectStatus(
          normalizedQuestion,
        );

  const searchTerm =
    extractSearchTerm(
      normalizedQuestion,
      kindResult.kind,
    );

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Purchase AI analyzer:",
      {
        question,

        normalizedQuestion,

        kind:
          kindResult.kind,

        status:
          statusResult.status,

        searchTerm,

        matchedKeywords: [
          ...kindResult
            .matchedKeywords,

          ...statusResult
            .matchedKeywords,
        ],
      },
    );
  }

  return {
    kind:
      kindResult.kind,

    status:
      statusResult.status,

    searchTerm,

    matchedKeywords: [
      ...new Set([
        ...kindResult
          .matchedKeywords,

        ...statusResult
          .matchedKeywords,
      ]),
    ],
  };
}
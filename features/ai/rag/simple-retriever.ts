import {
  KNOWLEDGE_DOCUMENTS,
} from "@/features/ai/rag/knowledge-documents";

import type {
  KnowledgeDocument,
} from "@/features/ai/rag/knowledge-documents";

export type RagSearchResult = {
  document: KnowledgeDocument;

  score: number;
};

function normalizeText(
  value: string,
): string {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(
  value: string,
): string[] {
  const stopWords = new Set([
    "apa",
    "bagaimana",
    "yang",
    "dan",
    "atau",
    "di",
    "ke",
    "dari",
    "untuk",
    "dengan",
    "saya",
    "kami",
    "duratu",
    "kafe",
    "cafe",
  ]);

  return [
    ...new Set(
      normalizeText(value)
        .split(" ")
        .filter(
          (token) =>
            token.length >= 3 &&
            !stopWords.has(
              token,
            ),
        ),
    ),
  ];
}

function calculateScore(
  questionTokens: string[],
  document: KnowledgeDocument,
): number {
  const searchableText =
    normalizeText(
      [
        document.title,
        document.category,
        document.content,
      ].join(" "),
    );

  let score = 0;

  for (
    const token
    of questionTokens
  ) {
    if (
      searchableText.includes(
        token,
      )
    ) {
      score += 1;
    }
  }

  return score;
}

export function retrieveRagDocuments(
  question: string,
  limit = 3,
): RagSearchResult[] {
  const questionTokens =
    tokenize(question);

  if (
    questionTokens.length ===
    0
  ) {
    return [];
  }

  return KNOWLEDGE_DOCUMENTS
    .map(
      (
        document,
      ): RagSearchResult => ({
        document,

        score:
          calculateScore(
            questionTokens,
            document,
          ),
      }),
    )
    .filter(
      (result) =>
        result.score > 0,
    )
    .sort(
      (first, second) =>
        second.score -
        first.score,
    )
    .slice(
      0,
      limit,
    );
}
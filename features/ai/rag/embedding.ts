import {
  getGeminiClient,
} from "@/features/ai/lib/gemini";

const EMBEDDING_MODEL =
  "gemini-embedding-001";

const EMBEDDING_DIMENSION =
  768;

export async function generateEmbedding(
  text: string,
): Promise<number[]> {
  const normalizedText =
    text.trim();

  if (!normalizedText) {
    return [];
  }

  const ai =
    getGeminiClient();

  const result =
    await ai.models.embedContent({
      model:
        EMBEDDING_MODEL,

      contents:
        normalizedText,

      config: {
        outputDimensionality:
          EMBEDDING_DIMENSION,
      },
    });

  const embedding =
    result.embeddings?.[0];

  const values =
    embedding?.values;

  if (
    !values ||
    values.length === 0
  ) {
    throw new Error(
      "Embedding Gemini tidak menghasilkan vector.",
    );
  }

  return values;
}
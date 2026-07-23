import {
  createClient,
} from "@/lib/supabase/server";

import {
  generateEmbedding,
} from "@/features/ai/rag/embedding";

export type VectorRagResult = {
  id: number;

  documentKey: string;

  title: string;

  category: string;

  content: string;

  similarity: number;
};

type MatchKnowledgeRow = {
  id: number;

  document_key: string;

  title: string;

  category: string;

  content: string;

  similarity: number;
};

export async function retrieveVectorDocuments(
  question: string,
  options?: {
    threshold?: number;
    limit?: number;
  },
): Promise<VectorRagResult[]> {
  const threshold =
    options?.threshold ??
    0.55;

  const limit =
    options?.limit ??
    3;

  const embedding =
    await generateEmbedding(
      question,
    );

  if (embedding.length === 0) {
    return [];
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "match_knowledge_documents",
    {
      query_embedding:
        embedding,

      match_threshold:
        threshold,

      match_count:
        limit,
    },
  );

  if (error) {
    console.error(
      "Vector RAG retrieval failed:",
      error,
    );

    throw new Error(
      "Knowledge base gagal dicari.",
    );
  }

  const rows =
    (data ??
      []) as MatchKnowledgeRow[];

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Vector RAG result:",
      rows.map(
        (row) => ({
          title:
            row.title,

          similarity:
            row.similarity,
        }),
      ),
    );
  }

  return rows.map(
    (
      row,
    ): VectorRagResult => ({
      id:
        row.id,

      documentKey:
        row.document_key,

      title:
        row.title,

      category:
        row.category,

      content:
        row.content,

      similarity:
        row.similarity,
    }),
  );
}
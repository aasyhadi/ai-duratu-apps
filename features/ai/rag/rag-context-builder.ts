import type {
  VectorRagResult,
} from "@/features/ai/rag/vector-retriever";

function formatSimilarity(
  value: number,
): string {
  return `${(
    value * 100
  ).toFixed(1)}%`;
}

export function buildRagContext(
  results:
    VectorRagResult[],
): string {
  if (
    results.length === 0
  ) {
    return "";
  }

  const documents =
    results
      .map(
        (
          result,
          index,
        ) => `
DOKUMEN ${index + 1}

Judul:
${result.title}

Kategori:
${result.category}

Relevansi:
${formatSimilarity(result.similarity)}

Isi:
${result.content}
`.trim(),
      )
      .join(
        "\n\n------------------------------\n\n",
      );

  return `
KNOWLEDGE BASE DURATU KAFE

Dokumen berikut ditemukan menggunakan semantic search.

${documents}

ATURAN PENGGUNAAN KNOWLEDGE BASE

- Gunakan dokumen sebagai referensi internal Duratu Kafe.
- Jangan membuat kebijakan yang tidak terdapat pada dokumen.
- Jangan mengubah fakta atau prosedur dalam dokumen.
- Jika dokumen tidak cukup menjawab pertanyaan, nyatakan bahwa informasi belum tersedia secara lengkap.
- Bedakan isi SOP atau kebijakan dengan rekomendasi umum.
`.trim();
}
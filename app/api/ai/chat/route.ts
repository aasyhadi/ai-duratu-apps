import { NextResponse } from "next/server";

import { analyzeQuestion } from "@/features/ai/analyzers/question-analyzer";
import { analyzeTransactionQuery } from "@/features/ai/analyzers/transaction-query-analyzer";
import { buildBusinessContext } from "@/features/ai/builders/context-builder";
import {
  getGeminiClient,
  getGeminiModel,
} from "@/features/ai/lib/gemini";
import { CAFE_AI_SYSTEM_PROMPT } from "@/features/ai/prompts/system-prompt";
import { retrieveTransactions } from "@/features/ai/retrievers/transaction-retriever";
import { chatMessageSchema } from "@/features/ai/schemas/chat-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GeminiTextContent = {
  type?: string;
  text?: string;
};

type GeminiStep = {
  type?: string;
  content?: GeminiTextContent[];
};

type GeminiDelta = {
  type?: string;
  text?: string;

  content?: {
    type?: string;
    text?: string;
  };
};

type GeminiInteraction = {
  id?: string;
  status?: string;
};

type GeminiStreamError = {
  message?: string;
  code?: string;
};

type GeminiStreamEvent = {
  event_type?: string;
  eventType?: string;
  type?: string;

  index?: number;

  step?: GeminiStep;
  delta?: GeminiDelta;

  interaction?: GeminiInteraction;
  interaction_id?: string;

  error?: GeminiStreamError;
};

type OutputTextEvent = {
  type: "text";
  content: string;
};

type OutputMetadataEvent = {
  type: "metadata";
  interactionId: string;
};

type OutputErrorEvent = {
  type: "error";
  message: string;
};

type OutputStreamEvent =
  | OutputTextEvent
  | OutputMetadataEvent
  | OutputErrorEvent;

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan yang tidak diketahui.";
}

function createErrorResponse(
  message: string,
  status = 500,
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}

function encodeStreamEvent(
  event: OutputStreamEvent,
  encoder: TextEncoder,
): Uint8Array {
  return encoder.encode(
    `${JSON.stringify(event)}\n`,
  );
}

function getEventType(
  event: GeminiStreamEvent,
): string {
  return (
    event.event_type ??
    event.eventType ??
    event.type ??
    ""
  );
}

function extractTextFromStepStart(
  event: GeminiStreamEvent,
): string {
  const eventType =
    getEventType(event);

  if (eventType !== "step.start") {
    return "";
  }

  if (
    event.step?.type !==
    "model_output"
  ) {
    return "";
  }

  if (
    !Array.isArray(
      event.step.content,
    )
  ) {
    return "";
  }

  return event.step.content
    .filter(
      (content) =>
        content.type === "text" &&
        typeof content.text ===
          "string",
    )
    .map(
      (content) =>
        content.text ?? "",
    )
    .join("");
}

function extractTextFromDelta(
  event: GeminiStreamEvent,
): string {
  const eventType =
    getEventType(event);

  if (
    eventType !== "step.delta" &&
    eventType !== "content.delta"
  ) {
    return "";
  }

  if (
    event.delta?.type !== "text"
  ) {
    return "";
  }

  return event.delta.text ?? "";
}

function extractText(
  event: GeminiStreamEvent,
): string {
  return (
    extractTextFromStepStart(
      event,
    ) ||
    extractTextFromDelta(event)
  );
}

function extractInteractionId(
  event: GeminiStreamEvent,
): string {
  const eventType =
    getEventType(event);

  if (
    eventType ===
      "interaction.created" ||
    eventType ===
      "interaction.completed" ||
    eventType ===
      "interaction.start" ||
    eventType ===
      "interaction.complete"
  ) {
    return (
      event.interaction?.id ??
      event.interaction_id ??
      ""
    );
  }

  return "";
}

function extractStreamError(
  event: GeminiStreamEvent,
): string {
  if (
    getEventType(event) !==
    "error"
  ) {
    return "";
  }

  return (
    event.error?.message ??
    "Gemini menghentikan proses streaming."
  );
}

function buildGeminiInput(
  message: string,
  businessContext: string,
): string {
  if (!businessContext.trim()) {
    return message;
  }

  return `
${businessContext}

==================================================

PERTANYAAN PENGGUNA

${message}

==================================================

INSTRUKSI JAWABAN

Jawab pertanyaan pengguna berdasarkan DATA BISNIS DURATU yang tersedia.

Aturan:
- Gunakan angka dari context sebagai sumber kebenaran.
- Jangan mengubah angka.
- Jangan menghitung ulang angka menggunakan perkiraan.
- Jangan mengarang data yang tidak tersedia.
- Jangan mengatakan bahwa Anda tidak memiliki akses database.
- Sebutkan periode data yang digunakan.
- Jika jumlah transaksi adalah 0, katakan bahwa tidak ada transaksi pada periode tersebut.
- Jelaskan hasil dengan Bahasa Indonesia yang jelas.
- Gunakan format Markdown jika membantu keterbacaan.
`.trim();
}

export async function POST(
  request: Request,
) {
  let requestBody: unknown;

  try {
    requestBody =
      await request.json();
  } catch {
    return createErrorResponse(
      "Format request tidak valid.",
      400,
    );
  }

  const validationResult =
    chatMessageSchema.safeParse(
      requestBody,
    );

  if (
    !validationResult.success
  ) {
    return createErrorResponse(
      validationResult.error
        .issues[0]?.message ??
        "Pesan yang dikirim tidak valid.",
      400,
    );
  }

  const {
    message,
    previousInteractionId,
  } = validationResult.data;

  const questionAnalysis =
    analyzeQuestion(message);

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Duratu AI question analysis:",
      {
        question: message,

        category:
          questionAnalysis.category,

        intent:
          questionAnalysis.intent,

        confidence:
          questionAnalysis.confidence,

        matchedKeywords:
          questionAnalysis
            .matchedKeywords,

        matchedIntentKeywords:
          questionAnalysis
            .matchedIntentKeywords,

        requiresBusinessData:
          questionAnalysis
            .requiresBusinessData,
      },
    );
  }

  try {
    let businessContext = "";

    if (
      questionAnalysis
        .requiresBusinessData
    ) {
      const transactionQuery =
        analyzeTransactionQuery(
          message,
        );

      const transactionContext =
        await retrieveTransactions({
          kind:
            transactionQuery.kind,

          dateRange:
            transactionQuery.dateRange,
        });

      businessContext =
        buildBusinessContext(
          transactionContext,
        );

      if (
        process.env.NODE_ENV ===
        "development"
      ) {
        console.info(
          "Duratu AI transaction query:",
          {
            kind:
              transactionQuery.kind,

            dateRange:
              transactionQuery.dateRange,

            matchedKeywords:
              transactionQuery
                .matchedKeywords,
          },
        );

        console.info(
          "Duratu AI business context:",
          businessContext,
        );
      }
    }

    const geminiInput =
      buildGeminiInput(
        message,
        businessContext,
      );

    const ai =
      getGeminiClient();

    const geminiStream =
      await ai.interactions.create({
        model: getGeminiModel(),

        input: geminiInput,

        previous_interaction_id:
          previousInteractionId ??
          undefined,

        system_instruction:
          CAFE_AI_SYSTEM_PROMPT,

        generation_config: {
          temperature: 0.4,
          thinking_level: "low",
        },

        store: true,
        stream: true,
      });

    const encoder =
      new TextEncoder();

    const responseStream =
      new ReadableStream<Uint8Array>(
        {
          async start(controller) {
            let sentInteractionId =
              "";

            let emittedText = false;

            try {
              for await (
                const rawEvent of
                geminiStream
              ) {
                const event =
                  rawEvent as GeminiStreamEvent;

                const streamError =
                  extractStreamError(
                    event,
                  );

                if (streamError) {
                  controller.enqueue(
                    encodeStreamEvent(
                      {
                        type: "error",
                        message:
                          streamError,
                      },
                      encoder,
                    ),
                  );

                  controller.close();
                  return;
                }

                const interactionId =
                  extractInteractionId(
                    event,
                  );

                if (
                  interactionId &&
                  interactionId !==
                    sentInteractionId
                ) {
                  sentInteractionId =
                    interactionId;

                  controller.enqueue(
                    encodeStreamEvent(
                      {
                        type:
                          "metadata",
                        interactionId,
                      },
                      encoder,
                    ),
                  );
                }

                const text =
                  extractText(event);

                if (text) {
                  emittedText = true;

                  controller.enqueue(
                    encodeStreamEvent(
                      {
                        type: "text",
                        content: text,
                      },
                      encoder,
                    ),
                  );
                }
              }

              if (!emittedText) {
                controller.enqueue(
                  encodeStreamEvent(
                    {
                      type: "error",
                      message:
                        "Gemini menyelesaikan interaction tanpa menghasilkan teks.",
                    },
                    encoder,
                  ),
                );
              }

              controller.close();
            } catch (
              error: unknown
            ) {
              console.error(
                "Gemini streaming iteration failed:",
                error,
              );

              controller.enqueue(
                encodeStreamEvent(
                  {
                    type: "error",
                    message:
                      getErrorMessage(
                        error,
                      ),
                  },
                  encoder,
                ),
              );

              controller.close();
            }
          },
        },
      );

    return new Response(
      responseStream,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/x-ndjson; charset=utf-8",

          "Cache-Control":
            "no-cache, no-transform",

          "X-Content-Type-Options":
            "nosniff",
        },
      },
    );
  } catch (error: unknown) {
    console.error(
      "Duratu AI request failed:",
      error,
    );

    const originalError =
      getErrorMessage(error);

    const normalizedError =
      originalError.toLowerCase();

    if (
      normalizedError.includes(
        "data transaksi gagal",
      ) ||
      normalizedError.includes(
        "supabase",
      )
    ) {
      return createErrorResponse(
        "Data transaksi Duratu Kafe gagal diambil dari Supabase.",
        500,
      );
    }

    if (
      normalizedError.includes(
        "api key",
      ) ||
      normalizedError.includes(
        "api_key",
      )
    ) {
      return createErrorResponse(
        "API key Gemini tidak valid atau belum dikonfigurasi.",
        401,
      );
    }

    if (
      normalizedError.includes(
        "quota",
      ) ||
      normalizedError.includes(
        "rate limit",
      ) ||
      normalizedError.includes(
        "resource_exhausted",
      ) ||
      normalizedError.includes("429")
    ) {
      return createErrorResponse(
        "Kuota atau batas penggunaan Gemini telah tercapai. Tunggu beberapa saat atau periksa billing Google AI Studio.",
        429,
      );
    }

    if (
      normalizedError.includes(
        "not found",
      ) ||
      normalizedError.includes("404")
    ) {
      return createErrorResponse(
        "Model Gemini atau interaction sebelumnya tidak ditemukan. Periksa GEMINI_MODEL atau mulai percakapan baru.",
        404,
      );
    }

    if (
      normalizedError.includes(
        "previous_interaction",
      ) ||
      normalizedError.includes(
        "interaction id",
      )
    ) {
      return createErrorResponse(
        "Riwayat memory Gemini sudah tidak tersedia. Silakan mulai percakapan baru.",
        400,
      );
    }

    return createErrorResponse(
      originalError ||
        "Duratu AI sedang mengalami gangguan.",
      500,
    );
  }
}
import {
  getGeminiClient,
  getGeminiModel,
} from "@/features/ai/lib/gemini";

import {
  AGENT_TOOLS,
} from "@/features/ai/agent/agent-tools";

import {
  executeAgentTool,
} from "@/features/ai/agent/execute-agent-tool";

import type {
  AgentToolArguments,
  AgentToolName,
} from "@/features/ai/agent/execute-agent-tool";

type FunctionCallStep = {
  type: "function_call";

  id: string;

  name: string;

  arguments:
    AgentToolArguments;
};

type InteractionStep = {
  type?: string;

  id?: string;

  name?: string;

  arguments?: unknown;
};

export type AgentRunResult = {
  text: string;

  interactionId:
    string | null;

  toolUsed:
    string | null;
};

function isFunctionCallStep(
  step: InteractionStep,
): step is FunctionCallStep {
  return (
    step.type ===
      "function_call" &&
    typeof step.id ===
      "string" &&
    typeof step.name ===
      "string"
  );
}

function isAgentToolName(
  value: string,
): value is AgentToolName {
  return [
    "get_transactions",
    "get_inventory",
    "get_supplier",
    "get_purchase_orders",
    "get_product",
    "search_knowledge_base",
  ].includes(value);
}

export async function runAgent(
  question: string,
  previousInteractionId?: string | null,
): Promise<AgentRunResult> {
  const ai =
    getGeminiClient();

  const firstInteraction =
    await ai.interactions.create({
      model:
        getGeminiModel(),

      input:
        question,

      previous_interaction_id:
        previousInteractionId ??
        undefined,

      system_instruction: `
Anda adalah Duratu AI Agent.

Anda membantu pengguna berdasarkan data nyata Duratu Kafe.

Gunakan tool jika jawaban memerlukan:
- transaksi, penjualan, pendapatan, pengeluaran, atau laporan keuangan;
- stok atau inventory;
- data supplier;
- Purchase Order;
- master produk;
- SOP, kebijakan, atau panduan internal.

ATURAN PENTING:

- Jangan mengarang data bisnis.
- Jangan membuat angka sendiri.
- Jangan mengklaim telah mengubah database.
- Semua tool saat ini bersifat READ-ONLY.
- Anda tidak boleh membuat PO.
- Anda tidak boleh mengubah stok.
- Anda tidak boleh menghapus transaksi.
- Anda tidak boleh mengubah supplier atau produk.
- Gunakan hasil tool sebagai sumber kebenaran.
- Jawab dalam Bahasa Indonesia.
- Untuk angka transaksi dan keuangan gunakan get_transactions.
- Untuk stok gunakan get_inventory.
- Untuk harga, SKU, margin, dan master produk gunakan get_product.
- Jangan menggunakan knowledge base untuk menjawab angka transaksi aktual.
`.trim(),

      tools:
        [...AGENT_TOOLS],

      store:
        true,
    });

  const steps =
    (
      firstInteraction.steps ??
      []
    ) as InteractionStep[];

  const functionCall =
    steps.find(
      isFunctionCallStep,
    );

  /**
   * Gemini dapat menjawab langsung
   * apabila tidak membutuhkan tool.
   */
  if (!functionCall) {
    return {
      text:
        firstInteraction.output_text ??
        "",

      interactionId:
        firstInteraction.id ??
        null,

      toolUsed:
        null,
    };
  }

  if (
    !isAgentToolName(
      functionCall.name,
    )
  ) {
    throw new Error(
      `Gemini meminta tool yang tidak tersedia: ${functionCall.name}`,
    );
  }

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Duratu Agent tool call:",
      {
        name:
          functionCall.name,

        arguments:
          functionCall.arguments,
      },
    );
  }

  const toolResult =
    await executeAgentTool(
      functionCall.name,
      functionCall.arguments,
    );

  const finalInteraction =
    await ai.interactions.create({
      model:
        getGeminiModel(),

      previous_interaction_id:
        firstInteraction.id,

      input: [
        {
          type:
            "function_result",

          name:
            functionCall.name,

          call_id:
            functionCall.id,

          result: [
            {
              type:
                "text",

              text:
                toolResult,
            },
          ],
        },
      ],

      store:
        true,
    });

  return {
    text:
      finalInteraction.output_text ??
      "",

    interactionId:
      finalInteraction.id ??
      firstInteraction.id ??
      null,

    toolUsed:
      functionCall.name,
  };
}
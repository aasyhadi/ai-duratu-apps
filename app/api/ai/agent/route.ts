import {
  NextResponse,
} from "next/server";

import {
  runAgent,
} from "@/features/ai/agent/run-agent";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type AgentRequestBody = {
  message?: unknown;

  previousInteractionId?:
    unknown;
};

function createErrorResponse(
  message: string,
  status = 500,
) {
  return NextResponse.json(
    {
      success:
        false,

      message,
    },
    {
      status,
    },
  );
}

export async function POST(
  request: Request,
) {
  let body:
    AgentRequestBody;

  try {
    body =
      (await request.json()) as AgentRequestBody;
  } catch {
    return createErrorResponse(
      "Format request tidak valid.",
      400,
    );
  }

  if (
    typeof body.message !==
      "string" ||
    !body.message.trim()
  ) {
    return createErrorResponse(
      "Pesan wajib diisi.",
      400,
    );
  }

  const previousInteractionId =
    typeof body.previousInteractionId ===
      "string"
      ? body.previousInteractionId
      : null;

  try {
    const result =
      await runAgent(
        body.message.trim(),
        previousInteractionId,
      );

    return NextResponse.json({
      success:
        true,

      data: {
        message:
          result.text,

        interactionId:
          result.interactionId,

        toolUsed:
          result.toolUsed,
      },
    });
  } catch (error: unknown) {
    console.error(
      "Duratu Agent failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Duratu Agent mengalami gangguan.";

    return createErrorResponse(
      message,
      500,
    );
  }
}
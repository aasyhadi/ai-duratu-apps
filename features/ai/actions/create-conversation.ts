"use server";

import { createClient } from "@/lib/supabase/server";
import { mapConversationRow } from "@/features/ai/lib/chat-mappers";
import { createConversationSchema } from "@/features/ai/schemas/conversation-schema";
import type {
  ChatConversation,
  ConversationRow,
} from "@/features/ai/types/chat";

type CreateConversationResult =
  | {
      success: true;
      conversation: ChatConversation;
    }
  | {
      success: false;
      message: string;
    };

export async function createConversation(
  input: unknown = {},
): Promise<CreateConversationResult> {
  const validationResult =
    createConversationSchema.safeParse(
      input,
    );

  if (!validationResult.success) {
    return {
      success: false,
      message:
        validationResult.error.issues[0]
          ?.message ??
        "Data percakapan tidak valid.",
    };
  }

  const title =
    validationResult.data.title ??
    "Percakapan Baru";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      title,
    })
    .select(
      `
        id,
        title,
        gemini_interaction_id,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    console.error(
      "Create AI conversation failed:",
      error,
    );

    return {
      success: false,
      message:
        "Percakapan baru gagal dibuat.",
    };
  }

  return {
    success: true,

    conversation: mapConversationRow(
      data as ConversationRow,
    ),
  };
}
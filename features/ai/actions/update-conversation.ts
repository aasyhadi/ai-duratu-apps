"use server";

import { createClient } from "@/lib/supabase/server";
import { mapConversationRow } from "@/features/ai/lib/chat-mappers";
import { updateConversationSchema } from "@/features/ai/schemas/conversation-schema";
import type {
  ChatConversation,
  ConversationRow,
} from "@/features/ai/types/chat";

type UpdateConversationResult =
  | {
      success: true;
      conversation: ChatConversation;
    }
  | {
      success: false;
      message: string;
    };

export async function updateConversation(
  input: unknown,
): Promise<UpdateConversationResult> {
  const validationResult =
    updateConversationSchema.safeParse(
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

  const {
    conversationId,
    title,
    geminiInteractionId,
  } = validationResult.data;

  const updatePayload: {
    title?: string;
    gemini_interaction_id?:
      | string
      | null;
    updated_at: string;
  } = {
    updated_at:
      new Date().toISOString(),
  };

  if (title !== undefined) {
    updatePayload.title = title;
  }

  if (
    geminiInteractionId !==
    undefined
  ) {
    updatePayload.gemini_interaction_id =
      geminiInteractionId;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_conversations")
    .update(updatePayload)
    .eq("id", conversationId)
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
      "Update AI conversation failed:",
      error,
    );

    return {
      success: false,
      message:
        "Percakapan gagal diperbarui.",
    };
  }

  return {
    success: true,

    conversation: mapConversationRow(
      data as ConversationRow,
    ),
  };
}
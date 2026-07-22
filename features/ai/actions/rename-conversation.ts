"use server";

import { createClient } from "@/lib/supabase/server";
import { mapConversationRow } from "@/features/ai/lib/chat-mappers";
import { renameConversationSchema } from "@/features/ai/schemas/conversation-schema";
import type {
  ChatConversation,
  ConversationRow,
} from "@/features/ai/types/chat";

type RenameConversationResult =
  | {
      success: true;
      conversation: ChatConversation;
    }
  | {
      success: false;
      message: string;
    };

export async function renameConversation(
  input: unknown,
): Promise<RenameConversationResult> {
  const validationResult =
    renameConversationSchema.safeParse(
      input,
    );

  if (!validationResult.success) {
    return {
      success: false,
      message:
        validationResult.error.issues[0]
          ?.message ??
        "Data judul tidak valid.",
    };
  }

  const {
    conversationId,
    title,
  } = validationResult.data;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_conversations")
    .update({
      title,
      updated_at:
        new Date().toISOString(),
    })
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
      "Rename AI conversation failed:",
      error,
    );

    return {
      success: false,
      message:
        "Judul percakapan gagal diubah.",
    };
  }

  return {
    success: true,
    conversation: mapConversationRow(
      data as ConversationRow,
    ),
  };
}
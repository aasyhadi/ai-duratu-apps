"use server";

import { createClient } from "@/lib/supabase/server";
import {
  mapConversationRow,
  mapMessageRow,
} from "@/features/ai/lib/chat-mappers";
import { conversationIdSchema } from "@/features/ai/schemas/conversation-schema";
import type {
  ChatConversation,
  ChatMessage,
  ConversationRow,
  MessageRow,
} from "@/features/ai/types/chat";

type GetConversationResult =
  | {
      success: true;
      conversation: ChatConversation;
      messages: ChatMessage[];
    }
  | {
      success: false;
      message: string;
    };

export async function getConversation(
  input: unknown,
): Promise<GetConversationResult> {
  const validationResult =
    conversationIdSchema.safeParse(
      input,
    );

  if (!validationResult.success) {
    return {
      success: false,

      message:
        validationResult.error.issues[0]
          ?.message ??
        "ID percakapan tidak valid.",
    };
  }

  const { conversationId } =
    validationResult.data;

  const supabase = await createClient();

  const [
    conversationResult,
    messagesResult,
  ] = await Promise.all([
    supabase
      .from("ai_conversations")
      .select(
        `
          id,
          title,
          gemini_interaction_id,
          created_at,
          updated_at
        `,
      )
      .eq("id", conversationId)
      .maybeSingle(),

    supabase
      .from("ai_messages")
      .select(
        `
          id,
          conversation_id,
          role,
          content,
          created_at
        `,
      )
      .eq(
        "conversation_id",
        conversationId,
      )
      .order("created_at", {
        ascending: true,
      }),
  ]);

  if (conversationResult.error) {
    console.error(
      "Get AI conversation failed:",
      conversationResult.error,
    );

    return {
      success: false,
      message:
        "Percakapan gagal diambil.",
    };
  }

  if (!conversationResult.data) {
    return {
      success: false,
      message:
        "Percakapan tidak ditemukan.",
    };
  }

  if (messagesResult.error) {
    console.error(
      "Get AI messages failed:",
      messagesResult.error,
    );

    return {
      success: false,
      message:
        "Riwayat pesan gagal diambil.",
    };
  }

  return {
    success: true,

    conversation: mapConversationRow(
      conversationResult.data as ConversationRow,
    ),

    messages: (
      messagesResult.data as MessageRow[]
    ).map(mapMessageRow),
  };
}
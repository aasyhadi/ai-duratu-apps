"use server";

import { createClient } from "@/lib/supabase/server";
import { mapConversationRow } from "@/features/ai/lib/chat-mappers";
import type {
  ChatConversation,
  ConversationRow,
} from "@/features/ai/types/chat";

type ListConversationsResult =
  | {
      success: true;
      conversations: ChatConversation[];
    }
  | {
      success: false;
      message: string;
    };

export async function listConversations(): Promise<ListConversationsResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "List AI conversations failed:",
      error,
    );

    return {
      success: false,
      message:
        "Daftar percakapan gagal diambil.",
    };
  }

  return {
    success: true,
    conversations: (
      (data ?? []) as ConversationRow[]
    ).map(mapConversationRow),
  };
}
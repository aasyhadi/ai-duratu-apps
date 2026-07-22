"use server";

import { createClient } from "@/lib/supabase/server";
import { mapConversationRow } from "@/features/ai/lib/chat-mappers";
import type {
  ChatConversation,
  ConversationRow,
} from "@/features/ai/types/chat";

type LatestConversationResult =
  | {
      success: true;
      conversation:
        | ChatConversation
        | null;
    }
  | {
      success: false;
      message: string;
    };

export async function getLatestConversation(): Promise<LatestConversationResult> {
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
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Get latest AI conversation failed:",
      error,
    );

    return {
      success: false,
      message:
        "Percakapan terakhir gagal diambil.",
    };
  }

  return {
    success: true,

    conversation: data
      ? mapConversationRow(
          data as ConversationRow,
        )
      : null,
  };
}
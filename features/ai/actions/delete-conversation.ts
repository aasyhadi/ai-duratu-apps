"use server";

import { createClient } from "@/lib/supabase/server";
import { conversationIdSchema } from "@/features/ai/schemas/conversation-schema";

type DeleteConversationResult =
  | {
      success: true;
      conversationId: string;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteConversation(
  input: unknown,
): Promise<DeleteConversationResult> {
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

  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    console.error(
      "Delete AI conversation failed:",
      error,
    );

    return {
      success: false,
      message:
        "Percakapan gagal dihapus.",
    };
  }

  return {
    success: true,
    conversationId,
  };
}
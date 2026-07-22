"use server";

import { createClient } from "@/lib/supabase/server";
import { mapMessageRow } from "@/features/ai/lib/chat-mappers";
import { saveMessageSchema } from "@/features/ai/schemas/conversation-schema";
import type {
  ChatMessage,
  MessageRow,
} from "@/features/ai/types/chat";

type SaveMessageResult =
  | {
      success: true;
      message: ChatMessage;
    }
  | {
      success: false;
      message: string;
    };

export async function saveMessage(
  input: unknown,
): Promise<SaveMessageResult> {
  const validationResult =
    saveMessageSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message:
        validationResult.error.issues[0]
          ?.message ??
        "Pesan tidak valid.",
    };
  }

  const {
    conversationId,
    role,
    content,
  } = validationResult.data;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id:
        conversationId,

      role,
      content,
    })
    .select(
      `
        id,
        conversation_id,
        role,
        content,
        created_at
      `,
    )
    .single();

  if (error) {
    console.error(
      "Save AI message failed:",
      error,
    );

    return {
      success: false,
      message:
        "Pesan gagal disimpan ke database.",
    };
  }

  return {
    success: true,

    message: mapMessageRow(
      data as MessageRow,
    ),
  };
}
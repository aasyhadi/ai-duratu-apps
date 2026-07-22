import type {
  ChatConversation,
  ChatMessage,
  ConversationRow,
  MessageRow,
} from "@/features/ai/types/chat";

export function mapConversationRow(
  row: ConversationRow,
): ChatConversation {
  return {
    id: row.id,
    title: row.title,

    geminiInteractionId:
      row.gemini_interaction_id,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMessageRow(
  row: MessageRow,
): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}
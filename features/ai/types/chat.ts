export type ChatRole =
  | "user"
  | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
};

export type ChatConversation = {
  id: string;
  title: string;
  geminiInteractionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatStreamTextEvent = {
  type: "text";
  content: string;
};

export type ChatStreamMetadataEvent = {
  type: "metadata";
  interactionId: string;
};

export type ChatStreamEvent =
  | ChatStreamTextEvent
  | ChatStreamMetadataEvent
  | ChatStreamErrorEvent;

export type ConversationRow = {
  id: string;
  title: string;
  gemini_interaction_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
};

export type ChatStreamErrorEvent = {
  type: "error";
  message: string;
};
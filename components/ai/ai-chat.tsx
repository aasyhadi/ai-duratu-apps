"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bot,
  Brain,
  LoaderCircle,
  Save,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { ChatHistorySidebar } from "@/components/ai/chat-history-sidebar";
import { ChatMarkdown } from "@/components/ai/chat-markdown";
import { createConversation } from "@/features/ai/actions/create-conversation";
import { deleteConversation } from "@/features/ai/actions/delete-conversation";
import { getConversation } from "@/features/ai/actions/get-conversation";
import { listConversations } from "@/features/ai/actions/list-conversations";
import { renameConversation } from "@/features/ai/actions/rename-conversation";
import { saveMessage } from "@/features/ai/actions/save-message";
import { updateConversation } from "@/features/ai/actions/update-conversation";
import type {
  ChatConversation,
  ChatMessage,
  ChatStreamEvent,
} from "@/features/ai/types/chat";

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial-assistant-message",
  role: "assistant",
  content:
    "Halo! Saya **Duratu AI Assistant**. Saya dapat membantu Anda membahas promosi, penjualan, pelayanan, produk, biaya, dan operasional kafe.",
};

type ErrorResponse = {
  success?: boolean;
  message?: string;
};

function createMessageId(): string {
  return crypto.randomUUID();
}

function createConversationTitle(
  message: string,
): string {
  const normalizedMessage =
    message.trim();

  if (normalizedMessage.length <= 60) {
    return normalizedMessage;
  }

  return `${normalizedMessage.slice(
    0,
    57,
  )}...`;
}

async function getResponseErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const result =
      (await response.json()) as ErrorResponse;

    if (result.message) {
      return result.message;
    }
  } catch {
    // Response mungkin bukan JSON.
  }

  return `Permintaan gagal dengan status ${response.status}.`;
}

function parseStreamEvent(
  value: string,
): ChatStreamEvent | null {
  try {
    return JSON.parse(
      value,
    ) as ChatStreamEvent;
  } catch {
    return null;
  }
}

export function AiChat() {
  const [
    conversations,
    setConversations,
  ] = useState<ChatConversation[]>([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      INITIAL_MESSAGE,
    ]);

  const [
    previousInteractionId,
    setPreviousInteractionId,
  ] = useState<string | null>(null);

  const [input, setInput] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isLoadingHistory,
    setIsLoadingHistory,
  ] = useState(true);

  const [
    isSaved,
    setIsSaved,
  ] = useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  useEffect(() => {
    let isActive = true;

    async function initializeChat() {
      const result =
        await listConversations();

      if (!isActive) {
        return;
      }

      if (!result.success) {
        setErrorMessage(result.message);
        setIsLoadingHistory(false);
        return;
      }

      setConversations(
        result.conversations,
      );

      const latestConversation =
        result.conversations[0];

      if (!latestConversation) {
        setIsLoadingHistory(false);
        return;
      }

      const conversationResult =
        await getConversation({
          conversationId:
            latestConversation.id,
        });

      if (!isActive) {
        return;
      }

      if (!conversationResult.success) {
        setErrorMessage(
          conversationResult.message,
        );

        setIsLoadingHistory(false);
        return;
      }

      setActiveConversationId(
        conversationResult
          .conversation.id,
      );

      setPreviousInteractionId(
        conversationResult
          .conversation
          .geminiInteractionId,
      );

      setMessages(
        conversationResult.messages.length
          ? conversationResult.messages
          : [INITIAL_MESSAGE],
      );

      setIsSaved(true);
      setIsLoadingHistory(false);
    }

    void initializeChat();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSubmitting]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  function updateAssistantMessage(
    messageId: string,
    content: string,
  ) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content,
            }
          : message,
      ),
    );
  }

  function replaceMessageId(
    temporaryId: string,
    savedMessage: ChatMessage,
  ) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === temporaryId
          ? savedMessage
          : message,
      ),
    );
  }

  function removeMessage(
    messageId: string,
  ) {
    setMessages((currentMessages) =>
      currentMessages.filter(
        (message) =>
          message.id !== messageId,
      ),
    );
  }

  function putConversationFirst(
    conversation: ChatConversation,
  ) {
    setConversations(
      (currentConversations) => [
        conversation,
        ...currentConversations.filter(
          (item) =>
            item.id !== conversation.id,
        ),
      ],
    );
  }

  async function openConversation(
    conversationId: string,
  ) {
    if (
      isSubmitting ||
      isLoadingHistory
    ) {
      return;
    }

    setIsLoadingHistory(true);
    setErrorMessage("");

    const result =
      await getConversation({
        conversationId,
      });

    if (!result.success) {
      setErrorMessage(result.message);
      setIsLoadingHistory(false);
      return;
    }

    setActiveConversationId(
      result.conversation.id,
    );

    setPreviousInteractionId(
      result.conversation
        .geminiInteractionId,
    );

    setMessages(
      result.messages.length
        ? result.messages
        : [INITIAL_MESSAGE],
    );

    setIsSaved(true);
    setIsLoadingHistory(false);
  }

  function startNewConversation() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setActiveConversationId(null);
    setPreviousInteractionId(null);
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setErrorMessage("");
    setIsSubmitting(false);
    setIsSaved(false);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  async function handleRenameConversation(
    conversationId: string,
    title: string,
  ) {
    const result =
      await renameConversation({
        conversationId,
        title,
      });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setConversations(
      (currentConversations) =>
        currentConversations.map(
          (conversation) =>
            conversation.id ===
            conversationId
              ? result.conversation
              : conversation,
        ),
    );
  }

  async function handleDeleteConversation(
    conversationId: string,
  ) {
    const result =
      await deleteConversation({
        conversationId,
      });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    const remainingConversations =
      conversations.filter(
        (conversation) =>
          conversation.id !==
          conversationId,
      );

    setConversations(
      remainingConversations,
    );

    if (
      activeConversationId !==
      conversationId
    ) {
      return;
    }

    const nextConversation =
      remainingConversations[0];

    if (nextConversation) {
      await openConversation(
        nextConversation.id,
      );

      return;
    }

    startNewConversation();
  }

  async function ensureConversation(
    firstMessage: string,
  ): Promise<string> {
    if (activeConversationId) {
      return activeConversationId;
    }

    const result =
      await createConversation({
        title:
          createConversationTitle(
            firstMessage,
          ),
      });

    if (!result.success) {
      throw new Error(result.message);
    }

    setActiveConversationId(
      result.conversation.id,
    );

    putConversationFirst(
      result.conversation,
    );

    return result.conversation.id;
  }

  async function persistUserMessage(
    conversationId: string,
    temporaryMessage: ChatMessage,
  ) {
    const result = await saveMessage({
      conversationId,
      role: "user",
      content:
        temporaryMessage.content,
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    replaceMessageId(
      temporaryMessage.id,
      result.message,
    );
  }

  async function persistAssistantMessage(
    conversationId: string,
    temporaryMessageId: string,
    content: string,
  ) {
    const result = await saveMessage({
      conversationId,
      role: "assistant",
      content,
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    replaceMessageId(
      temporaryMessageId,
      result.message,
    );
  }

  async function persistInteractionId(
    conversationId: string,
    interactionId: string,
  ) {
    const result =
      await updateConversation({
        conversationId,
        geminiInteractionId:
          interactionId,
      });

    if (!result.success) {
      console.error(result.message);
      return;
    }

    setPreviousInteractionId(
      interactionId,
    );

    putConversationFirst(
      result.conversation,
    );
  }

  async function submitMessage() {
    const trimmedInput =
      input.trim();

    if (
      !trimmedInput ||
      isSubmitting ||
      isLoadingHistory
    ) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedInput,
    };

    const assistantMessageId =
      createMessageId();

    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setMessages(
      (currentMessages) => [
        ...currentMessages,
        userMessage,
        assistantMessage,
      ],
    );

    setInput("");
    setErrorMessage("");
    setIsSubmitting(true);
    setIsSaved(false);

    const abortController =
      new AbortController();

    abortControllerRef.current =
      abortController;

    try {
      const conversationId =
        await ensureConversation(
          trimmedInput,
        );

      await persistUserMessage(
        conversationId,
        userMessage,
      );

      const response = await fetch(
        "/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: trimmedInput,
            previousInteractionId,
          }),
          signal:
            abortController.signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
          ),
        );
      }

      if (!response.body) {
        throw new Error(
          "Browser tidak menerima stream jawaban.",
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";
      let accumulatedText = "";
      let interactionId = "";

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          },
        );

        const lines =
          buffer.split("\n");

        buffer =
          lines.pop() ?? "";

        for (const line of lines) {
          const trimmedLine =
            line.trim();

          if (!trimmedLine) {
            continue;
          }

          const streamEvent =
            parseStreamEvent(
              trimmedLine,
            );

          if (!streamEvent) {
            continue;
          }

          if (
            streamEvent.type === "metadata"
          ) {
            interactionId =
              streamEvent.interactionId;

            setPreviousInteractionId(
              interactionId,
            );

            continue;
          }

          if (
            streamEvent.type === "error"
          ) {
            throw new Error(
              streamEvent.message,
            );
          }

          if (
            streamEvent.type === "text"
          ) {
            accumulatedText +=
              streamEvent.content;

            updateAssistantMessage(
              assistantMessageId,
              accumulatedText,
            );
          }

          updateAssistantMessage(
            assistantMessageId,
            accumulatedText,
          );
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        const streamEvent =
          parseStreamEvent(
            buffer.trim(),
          );

        if (
          streamEvent?.type ===
          "metadata"
        ) {
          interactionId =
            streamEvent.interactionId;

          setPreviousInteractionId(
            interactionId,
          );
        }

        if (
          streamEvent?.type === "error"
        ) {
          throw new Error(
            streamEvent.message,
          );
        }

        if (
          streamEvent?.type === "text"
        ) {
          accumulatedText +=
            streamEvent.content;

          updateAssistantMessage(
            assistantMessageId,
            accumulatedText,
          );
        }
      }

      if (!accumulatedText.trim()) {
        throw new Error(
          "Gemini tidak mengembalikan jawaban.",
        );
      }

      await persistAssistantMessage(
        conversationId,
        assistantMessageId,
        accumulatedText,
      );

      if (interactionId) {
        await persistInteractionId(
          conversationId,
          interactionId,
        );
      }

      setIsSaved(true);
    } catch (error: unknown) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        removeMessage(
          assistantMessageId,
        );

        return;
      }

      console.warn(
        "Submit persistent chat failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Pesan gagal dikirim.",
      );

      removeMessage(
        assistantMessageId,
      );
    } finally {
      abortControllerRef.current = null;
      setIsSubmitting(false);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void submitMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (
        isSubmitting ||
        isLoadingHistory ||
        !input.trim()
      ) {
        return;
      }

      void submitMessage();
    }
  }

  const canSend =
    input.trim().length > 0 &&
    !isSubmitting &&
    !isLoadingHistory;

  const hasMemory =
    previousInteractionId !== null;

  return (
    <div className="flex min-h-[calc(100vh-10rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
      <ChatHistorySidebar
        conversations={conversations}
        activeConversationId={
          activeConversationId
        }
        isLoading={isLoadingHistory}
        onSelectConversation={
          openConversation
        }
        onNewConversation={
          startNewConversation
        }
        onRenameConversation={
          handleRenameConversation
        }
        onDeleteConversation={
          handleDeleteConversation
        }
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
          <div className="lg:hidden">
            <ChatHistorySidebar
              conversations={
                conversations
              }
              activeConversationId={
                activeConversationId
              }
              isLoading={
                isLoadingHistory
              }
              onSelectConversation={
                openConversation
              }
              onNewConversation={
                startNewConversation
              }
              onRenameConversation={
                handleRenameConversation
              }
              onDeleteConversation={
                handleDeleteConversation
              }
            />
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-5 text-primary" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-semibold">
              Duratu AI Assistant
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                Gemini dan Supabase
              </span>

              {hasMemory ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                  <Brain className="size-3" />
                  Memory aktif
                </span>
              ) : null}

              {isSaved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                  <Save className="size-3" />
                  Tersimpan
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <main
          aria-live="polite"
          className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6"
        >
          {isLoadingHistory ? (
            <div className="flex min-h-60 items-center justify-center text-sm text-muted-foreground">
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Memuat percakapan...
            </div>
          ) : (
            messages.map((message) => {
              const isAssistant =
                message.role ===
                "assistant";

              const isStreamingMessage =
                isAssistant &&
                isSubmitting &&
                !message.content;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isAssistant
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  {isAssistant ? (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="size-4" />
                    </div>
                  ) : null}

                  <div
                    className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[78%] ${
                      isAssistant
                        ? "rounded-tl-sm bg-muted"
                        : "rounded-tr-sm bg-primary text-primary-foreground"
                    }`}
                  >
                    {isStreamingMessage ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <LoaderCircle className="size-4 animate-spin" />
                        Duratu AI sedang berpikir...
                      </span>
                    ) : isAssistant ? (
                      <ChatMarkdown
                        content={
                          message.content
                        }
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>

                  {!isAssistant ? (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-4" />
                    </div>
                  ) : null}
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </main>

        <footer className="border-t bg-background p-4 sm:p-6">
          {errorMessage ? (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            >
              <p className="text-sm text-destructive">
                {errorMessage}
              </p>
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              value={input}
              rows={2}
              maxLength={2_000}
              placeholder={
                isLoadingHistory
                  ? "Memuat percakapan..."
                  : isSubmitting
                    ? "Duratu AI sedang menjawab..."
                    : "Tanyakan sesuatu tentang bisnis kafe..."
              }
              aria-label="Pesan untuk Duratu AI"
              className="min-h-12 flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => {
                setInput(
                  event.target.value,
                );

                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              onKeyDown={
                handleKeyDown
              }
            />

            <button
              type="submit"
              aria-label="Kirim pesan"
              className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground ${
                canSend
                  ? "cursor-pointer hover:bg-primary/90"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              {isSubmitting ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </button>
          </form>

          <div className="mt-2 flex justify-between gap-4 text-xs text-muted-foreground">
            <p>
              Enter untuk mengirim.
            </p>

            <p>
              {input.length}/2000
            </p>
          </div>
        </footer>
      </section>
    </div>
  );
}
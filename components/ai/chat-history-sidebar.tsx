"use client";

import {
  type FormEvent,
  useState,
} from "react";
import {
  Check,
  LoaderCircle,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import type { ChatConversation } from "@/features/ai/types/chat";

type ChatHistorySidebarProps = {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelectConversation: (
    conversationId: string,
  ) => void;
  onNewConversation: () => void;
  onRenameConversation: (
    conversationId: string,
    title: string,
  ) => Promise<void>;
  onDeleteConversation: (
    conversationId: string,
  ) => Promise<void>;
};

function formatConversationDate(
  value: string,
): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
    },
  ).format(date);
}

export function ChatHistorySidebar({
  conversations,
  activeConversationId,
  isLoading,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
}: ChatHistorySidebarProps) {
  const [isMobileOpen, setIsMobileOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  function handleSelect(
    conversationId: string,
  ) {
    if (processingId) {
      return;
    }

    onSelectConversation(conversationId);
    setIsMobileOpen(false);
  }

  function startEditing(
    conversation: ChatConversation,
  ) {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function handleRename(
    event: FormEvent<HTMLFormElement>,
    conversationId: string,
  ) {
    event.preventDefault();

    const normalizedTitle =
      editingTitle.trim();

    if (
      !normalizedTitle ||
      processingId
    ) {
      return;
    }

    setProcessingId(conversationId);

    try {
      await onRenameConversation(
        conversationId,
        normalizedTitle,
      );

      cancelEditing();
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(
    conversation: ChatConversation,
  ) {
    if (processingId) {
      return;
    }

    const confirmed = window.confirm(
      `Hapus percakapan "${conversation.title}" beserta seluruh pesannya?`,
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(conversation.id);

    try {
      await onDeleteConversation(
        conversation.id,
      );
    } finally {
      setProcessingId(null);
    }
  }

  const sidebarContent = (
    <aside className="flex h-full min-h-0 flex-col bg-muted/20">
      <div className="border-b p-3">
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            setIsMobileOpen(false);
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageSquarePlus className="size-4" />

          Percakapan Baru
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            <LoaderCircle className="mr-2 size-4 animate-spin" />

            Memuat riwayat...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground" />

            <p className="text-sm font-medium">
              Belum ada percakapan
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Kirim pesan untuk membuat
              percakapan pertama.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(
              (conversation) => {
                const isActive =
                  conversation.id ===
                  activeConversationId;

                const isEditing =
                  editingId ===
                  conversation.id;

                const isProcessing =
                  processingId ===
                  conversation.id;

                if (isEditing) {
                  return (
                    <form
                      key={conversation.id}
                      onSubmit={(event) =>
                        void handleRename(
                          event,
                          conversation.id,
                        )
                      }
                      className="rounded-lg border bg-background p-2"
                    >
                      <input
                        value={editingTitle}
                        maxLength={100}
                        autoFocus
                        aria-label="Judul percakapan"
                        className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        onChange={(event) =>
                          setEditingTitle(
                            event.target.value,
                          )
                        }
                      />

                      <div className="mt-2 flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label="Batalkan perubahan judul"
                          onClick={cancelEditing}
                          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
                        >
                          <X className="size-4" />
                        </button>

                        <button
                          type="submit"
                          aria-label="Simpan judul"
                          className={`inline-flex size-8 items-center justify-center rounded-md ${
                            isProcessing ||
                            !editingTitle.trim()
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-muted"
                          }`}
                        >
                          {isProcessing ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={conversation.id}
                    className={`group flex items-center rounded-lg ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSelect(
                          conversation.id,
                        )
                      }
                      className="min-w-0 flex-1 px-3 py-2 text-left"
                    >
                      <p className="truncate text-sm font-medium">
                        {conversation.title}
                      </p>

                      <p
                        className={`mt-0.5 text-xs ${
                          isActive
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatConversationDate(
                          conversation.updatedAt,
                        )}
                      </p>
                    </button>

                    <div
                      className={`mr-1 flex shrink-0 items-center ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 transition-opacity group-hover:opacity-100"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Ubah judul ${conversation.title}`}
                        onClick={() =>
                          startEditing(
                            conversation,
                          )
                        }
                        className={`inline-flex size-8 items-center justify-center rounded-md ${
                          isActive
                            ? "hover:bg-primary-foreground/10"
                            : "hover:bg-background"
                        }`}
                      >
                        <Pencil className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        aria-label={`Hapus ${conversation.title}`}
                        onClick={() =>
                          void handleDelete(
                            conversation,
                          )
                        }
                        className={`inline-flex size-8 items-center justify-center rounded-md ${
                          isActive
                            ? "hover:bg-primary-foreground/10"
                            : "hover:bg-background"
                        }`}
                      >
                        {isProcessing ? (
                          <LoaderCircle className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Buka riwayat percakapan"
        onClick={() =>
          setIsMobileOpen(true)
        }
        className="inline-flex size-10 items-center justify-center rounded-lg border bg-background lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden h-full min-h-0 w-72 shrink-0 border-r lg:block">
        {sidebarContent}
      </div>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup riwayat percakapan"
            onClick={() =>
              setIsMobileOpen(false)
            }
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative h-full w-[85%] max-w-sm bg-background shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <h2 className="font-semibold">
                Riwayat Percakapan
              </h2>

              <button
                type="button"
                aria-label="Tutup sidebar"
                onClick={() =>
                  setIsMobileOpen(false)
                }
                className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="h-[calc(100%-3.5rem)]">
              {sidebarContent}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
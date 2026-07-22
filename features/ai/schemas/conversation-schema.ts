import { z } from "zod";

export const createConversationSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        1,
        "Judul percakapan tidak boleh kosong.",
      )
      .max(
        100,
        "Judul percakapan maksimal 100 karakter.",
      )
      .optional(),
  });

export const saveMessageSchema = z.object({
  conversationId: z
    .string()
    .uuid("ID percakapan tidak valid."),

  role: z.enum([
    "user",
    "assistant",
  ]),

  content: z
    .string()
    .trim()
    .min(
      1,
      "Isi pesan tidak boleh kosong.",
    )
    .max(
      20_000,
      "Isi pesan terlalu panjang.",
    ),
});

export const updateConversationSchema =
  z.object({
    conversationId: z
      .string()
      .uuid("ID percakapan tidak valid."),

    title: z
      .string()
      .trim()
      .min(
        1,
        "Judul tidak boleh kosong.",
      )
      .max(
        100,
        "Judul maksimal 100 karakter.",
      )
      .optional(),

    geminiInteractionId: z
      .string()
      .trim()
      .min(1)
      .nullable()
      .optional(),
  });

export const conversationIdSchema =
  z.object({
    conversationId: z
      .string()
      .uuid("ID percakapan tidak valid."),
  });

export const renameConversationSchema =
  z.object({
    conversationId: z
      .string()
      .uuid("ID percakapan tidak valid."),

    title: z
      .string()
      .trim()
      .min(
        1,
        "Judul tidak boleh kosong.",
      )
      .max(
        100,
        "Judul maksimal 100 karakter.",
      ),
  });
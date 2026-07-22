import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong.")
    .max(2_000, "Pesan maksimal 2.000 karakter."),

  previousInteractionId: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional(),
});

export type ChatMessageInput = z.input<
  typeof chatMessageSchema
>;

export type ChatMessageValues = z.output<
  typeof chatMessageSchema
>;
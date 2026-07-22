import "server-only";

import { gemini } from "@/lib/ai/gemini";
import { AI_MODEL } from "@/lib/ai/models";

export async function generateText(prompt: string) {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Prompt tidak boleh kosong.");
  }

  const response = await gemini.models.generateContent({
    model: AI_MODEL,
    contents: cleanPrompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini tidak menghasilkan jawaban.");
  }

  return text;
}
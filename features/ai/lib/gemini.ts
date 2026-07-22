import "server-only";

import { GoogleGenAI } from "@google/genai";

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum tersedia di file .env.local.",
    );
  }

  return apiKey;
}

export function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: getGeminiApiKey(),
  });
}

export function getGeminiModel(): string {
  return (
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-3.5-flash"
  );
}
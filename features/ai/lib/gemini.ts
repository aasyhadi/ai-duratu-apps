import "server-only";

import { GoogleGenAI } from "@google/genai";

import { serverEnv } from "@/lib/env.server";

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: serverEnv.geminiApiKey,
    });
  }

  return geminiClient;
}

export function getGeminiModel(): string {
  return serverEnv.geminiModel;
}

export const gemini = getGeminiClient();
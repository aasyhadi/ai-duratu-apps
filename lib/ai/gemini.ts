import "server-only";

import { GoogleGenAI } from "@google/genai";

import { serverEnv } from "@/lib/env.server";

export const gemini = new GoogleGenAI({
  apiKey: serverEnv.geminiApiKey,
});
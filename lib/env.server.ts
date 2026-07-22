import "server-only";

const geminiApiKey =
  process.env.GEMINI_API_KEY;

const geminiModel =
  process.env.GEMINI_MODEL ??
  "gemini-2.5-flash";

const aiProvider =
  process.env.AI_PROVIDER ??
  "gemini";

const appTimeZone =
  process.env.APP_TIME_ZONE ??
  "Asia/Jakarta";

if (!geminiApiKey) {
  throw new Error(
    "Environment variable GEMINI_API_KEY belum tersedia.",
  );
}

if (aiProvider !== "gemini") {
  throw new Error(
    `AI_PROVIDER "${aiProvider}" belum didukung. Gunakan "gemini".`,
  );
}

export const serverEnv = {
  geminiApiKey,
  geminiModel,
  aiProvider,
  appTimeZone,
} as const;
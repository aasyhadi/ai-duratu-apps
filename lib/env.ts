const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL;
const aiProvider = process.env.AI_PROVIDER ?? "gemini";

if (!supabaseUrl) {
  throw new Error(
    "Environment variable NEXT_PUBLIC_SUPABASE_URL belum tersedia.",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Environment variable NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum tersedia.",
  );
}

if (!geminiApiKey) {
  throw new Error(
    "Environment variable GEMINI_API_KEY belum tersedia.",
  );
}

if (!geminiModel) {
  throw new Error(
    "Environment variable GEMINI_MODEL belum tersedia.",
  );
}

if (aiProvider !== "gemini") {
  throw new Error(
    `AI_PROVIDER "${aiProvider}" belum didukung. Gunakan "gemini".`,
  );
}

export const env = {
  supabaseUrl,
  supabasePublishableKey,
  geminiApiKey,
  geminiModel,
  aiProvider,
};
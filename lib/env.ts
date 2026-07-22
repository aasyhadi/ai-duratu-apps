const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

export const env = {
  supabaseUrl,
  supabasePublishableKey,
} as const;
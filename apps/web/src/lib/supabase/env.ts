export function getSupabasePublicEnv(): {
  url: string;
  anonKey: string;
  googleEnabled: boolean;
} {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    googleEnabled: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true",
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv();
  return /^https?:\/\//.test(url) && anonKey.length > 20 && anonKey !== "replace-me";
}

export function isGoogleAuthEnabled(): boolean {
  return isSupabaseConfigured() && getSupabasePublicEnv().googleEnabled;
}

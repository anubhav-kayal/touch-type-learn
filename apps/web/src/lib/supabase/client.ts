import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv, isSupabaseConfigured } from "./env";
import type { Database } from "./database.types";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}

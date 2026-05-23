import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "demo-anon-key";

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseServiceClient() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRole) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

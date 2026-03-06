/**
 * Public env values used in the client bundle.
 * Must use direct property access so Next can inline them.
 *
 * During static export / prerendering the env vars are not available,
 * so we allow them to be undefined.  The Supabase client is created as
 * `null` in that case and every consumer already handles null.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
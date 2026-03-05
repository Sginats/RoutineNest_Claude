/**
 * Validates required environment variables at module load time.
 * Import this module once (e.g. from supabaseClient.ts) so the check
 * runs as early as possible and produces a clear error instead of a
 * silent misconfiguration.
 */

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy .env.local.example to .env.local and fill in your Supabase project values.`,
    );
  }
}

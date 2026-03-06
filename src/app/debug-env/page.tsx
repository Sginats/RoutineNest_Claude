"use client";

/**
 * Debug environment page.
 *
 * PRODUCTION SAFETY: This page renders a harmless "not available" message
 * in production builds. Environment details are only shown in development
 * to avoid leaking deployment configuration publicly.
 *
 * The page is included in the static export (cannot be removed without
 * breaking the build for dynamic routes), but its content is safe in
 * production.
 */
export default function DebugEnv() {
  if (process.env.NODE_ENV !== "development") {
    return (
      <div style={{ padding: 24 }}>
        <p>This page is not available in production.</p>
      </div>
    );
  }

  return (
    <pre style={{ padding: 24 }}>
      {JSON.stringify(
        {
          NODE_ENV: process.env.NODE_ENV,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? "(set)"
            : "(not set)",
          hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          hasBillingUrl: Boolean(process.env.NEXT_PUBLIC_BILLING_URL),
        },
        null,
        2,
      )}
    </pre>
  );
}

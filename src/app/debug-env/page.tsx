export default function DebugEnv() {
  return (
    <pre style={{ padding: 24 }}>
      {JSON.stringify(
        {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        },
        null,
        2
      )}
    </pre>
  );
}
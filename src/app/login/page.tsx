"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { getProfiles } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthMode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to onboarding (no profiles) or /parent
  useEffect(() => {
    if (!authLoading && user) {
      getProfiles()
        .then((profiles) => {
          router.replace(profiles.length === 0 ? "/onboarding" : "/parent");
        })
        .catch(() => {
          router.replace("/parent");
        });
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError(
        "Supabase is not configured. Copy .env.local.example to .env.local and add your project credentials."
      );
      return;
    }

    setLoading(true);

    if (mode === "sign-up") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(
          "Account created! Check your email to confirm, then sign in."
        );
        setMode("sign-in");
      }
      setLoading(false);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        // Check if user has profiles — if not, go to onboarding
        try {
          const profiles = await getProfiles();
          router.replace(profiles.length === 0 ? "/onboarding" : "/parent");
        } catch {
          router.replace("/parent");
        }
      }
    }
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
      <span className="text-5xl" role="img" aria-label="Lock">
        🔒
      </span>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold">
            {mode === "sign-in" ? "Parent Login" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {mode === "sign-in"
              ? "Sign in with your email and password"
              : "Create a new parent/caregiver account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mode toggle */}
          <div className="flex gap-2 mb-4" role="tablist" aria-label="Authentication mode">
            <Button
              type="button"
              variant={mode === "sign-in" ? "default" : "outline"}
              size="sm"
              className="flex-1 rounded-xl font-bold"
              role="tab"
              aria-selected={mode === "sign-in"}
              aria-controls="auth-form"
              onClick={() => { setMode("sign-in"); setError(null); setSuccess(null); }}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={mode === "sign-up" ? "default" : "outline"}
              size="sm"
              className="flex-1 rounded-xl font-bold"
              role="tab"
              aria-selected={mode === "sign-up"}
              aria-controls="auth-form"
              onClick={() => { setMode("sign-up"); setError(null); setSuccess(null); }}
            >
              Create Account
            </Button>
          </div>

          <form id="auth-form" onSubmit={handleSubmit} className="flex flex-col gap-4" role="tabpanel">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                required
                minLength={mode === "sign-up" ? 6 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-success font-medium" role="status">
                {success}
              </p>
            )}

            <Button type="submit" size="lg" className="rounded-xl text-base font-bold" disabled={loading}>
              {loading
                ? mode === "sign-up"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "sign-up"
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

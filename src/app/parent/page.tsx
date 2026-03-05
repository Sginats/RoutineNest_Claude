"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export default function ParentPage() {
  const [sessionResult, setSessionResult] = useState<string | null>(null);

  async function handleCheckSession() {
    if (!supabase) {
      setSessionResult(
        "Supabase is not configured. Copy .env.local.example to .env.local and add your project credentials."
      );
      return;
    }
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setSessionResult(`Error: ${error.message}`);
      } else {
        setSessionResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setSessionResult(
        `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Parent Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Manage your child&apos;s daily routine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full">
              Edit Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Talk Board</CardTitle>
            <CardDescription>
              Customize AAC communication buttons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full">
              Edit Talk Board
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
            <CardDescription>
              Set up rewards and track stars
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full">
              Manage Rewards
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure app preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" className="w-full">
              Open Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Supabase session check */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
          <CardDescription>
            Check your current Supabase auth session
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button size="lg" variant="outline" onClick={handleCheckSession}>
            Check Supabase Session
          </Button>
          {sessionResult !== null && (
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 text-sm">
              {sessionResult}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import type { AuthFormState } from "@/app/actions/auth";
import { isGoogleAuthEnabled, isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useActionState } from "react";

interface AuthFormProps {
  title: string;
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  switchHref: string;
  switchLabel: string;
}

export function AuthForm({
  title,
  action,
  submitLabel,
  switchHref,
  switchLabel,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const configured = isSupabaseConfigured();
  const googleEnabled = isGoogleAuthEnabled();

  async function continueWithGoogle() {
    if (!googleEnabled) {
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div>
        <p className="font-mono text-xs tracking-[0.22em] text-legend uppercase">Keypath</p>
        <h1 className="mt-2 font-display text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-legend">
          Save your course on this account. Or continue as a guest — progress stays in this
          browser until you sign up.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-2xl bg-keycap px-4 py-3 text-sm text-legend">
          Accounts are not configured on this machine yet. Copy .env.example to
          apps/web/.env.local and start Supabase when you want sign-in.
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-xs tracking-[0.18em] text-legend uppercase">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="rounded-xl bg-keycap px-4 py-3 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-xs tracking-[0.18em] text-legend uppercase">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            minLength={8}
            required
            className="rounded-xl bg-keycap px-4 py-3 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
          />
        </label>
        {state.error ? (
          <p className="text-sm text-incorrect" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.info ? (
          <p className="text-sm text-correct" role="status">
            {state.info}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || !configured}
          className="rounded-full bg-ink px-6 py-3 font-display text-desk disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
        >
          {pending ? "Working…" : submitLabel}
        </button>
      </form>

      {googleEnabled ? (
        <button
          type="button"
          onClick={() => void continueWithGoogle()}
          className="rounded-full bg-keycap px-6 py-3 font-display text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
        >
          Continue with Google
        </button>
      ) : null}

      <div className="flex flex-col gap-2 text-sm">
        <Link href="/learn" className="text-legend underline-offset-4 hover:text-ink hover:underline">
          Continue as guest
        </Link>
        <Link href={switchHref} className="text-legend underline-offset-4 hover:text-ink hover:underline">
          {switchLabel}
        </Link>
      </div>
    </div>
  );
}

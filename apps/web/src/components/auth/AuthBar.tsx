"use client";

import { signOut } from "@/app/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AuthBar() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) {
      return;
    }
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setEmail(session?.user?.email ?? null);
      },
    );
    return () => data.subscription.unsubscribe();
  }, [configured]);

  if (!ready) {
    return <span className="font-mono text-xs text-legend">…</span>;
  }

  if (email) {
    return (
      <form action={signOut} className="flex items-center gap-3">
        <span className="hidden max-w-[12rem] truncate font-mono text-xs text-legend sm:inline">
          {email}
        </span>
        <button
          type="submit"
          className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
        >
          Sign out
        </button>
      </form>
    );
  }

  return (
    <Link
      href="/login"
      className="font-mono text-xs tracking-[0.18em] text-legend uppercase hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
    >
      Sign in
    </Link>
  );
}

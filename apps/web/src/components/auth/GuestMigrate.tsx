"use client";

import { getMyProgress, migrateGuestProgress } from "@/app/actions/progress";
import {
  clearGuestSnapshot,
  guestHasUnmigratedWork,
  overlayAccountProgress,
  readGuestSnapshot,
} from "@/lib/guest-progress";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { useEffect } from "react";

export function GuestMigrate() {
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function syncForUser() {
      const guest = readGuestSnapshot();
      if (guestHasUnmigratedWork(guest)) {
        const migrated = await migrateGuestProgress(guest);
        if (cancelled) {
          return;
        }
        if (migrated.ok) {
          clearGuestSnapshot();
          overlayAccountProgress(migrated);
          return;
        }
      }
      const remote = await getMyProgress();
      if (!cancelled && remote.ok) {
        overlayAccountProgress(remote);
      }
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        void syncForUser();
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") {
        void syncForUser();
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return null;
}

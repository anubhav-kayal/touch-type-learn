"use client";

import { getMyProgressStars, migrateGuestProgress } from "@/app/actions/progress";
import {
  clearGuestSnapshot,
  guestSnapshotIsEmpty,
  overlayStars,
  readGuestSnapshot,
} from "@/lib/guest-progress";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
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
      if (!guestSnapshotIsEmpty(guest)) {
        const migrated = await migrateGuestProgress(guest);
        if (cancelled) {
          return;
        }
        if (migrated.ok) {
          clearGuestSnapshot();
          if (migrated.stars) {
            overlayStars(migrated.stars);
          }
          return;
        }
      }
      const remote = await getMyProgressStars();
      if (!cancelled && remote.ok) {
        overlayStars(remote.stars);
      }
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        void syncForUser();
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event) => {
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

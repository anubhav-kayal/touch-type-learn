"use client";

import { useEffect, useState } from "react";

export function KeyboardNeededNotice() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!coarse) {
    return null;
  }

  return (
    <p
      className="max-w-sm text-center text-sm text-legend"
      data-testid="keyboard-needed"
    >
      This lesson needs a physical keyboard. Progress is still saved if you
      continue on a computer.
    </p>
  );
}

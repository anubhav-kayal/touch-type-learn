"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { getContinueTarget } from "@/lib/continue-target";
import { useLessonStars } from "@/hooks/use-lesson-stars";

interface ContinueLinkProps {
  className: string;
  children: ReactNode;
}

export function ContinueLink({ className, children }: ContinueLinkProps) {
  const stars = useLessonStars();
  const { href } = getContinueTarget(stars);

  return (
    <Link href={href} className={className} data-testid="continue-cta">
      {children}
    </Link>
  );
}

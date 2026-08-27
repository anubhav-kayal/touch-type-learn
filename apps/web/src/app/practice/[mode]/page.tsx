import { PracticePlayer } from "@/components/practice/PracticePlayer";
import { getPracticeMode, listPracticeModes } from "@keypath/curriculum";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PracticeModePageProps {
  params: Promise<{ mode: string }>;
}

export function generateStaticParams() {
  return listPracticeModes().map((mode) => ({ mode: mode.id }));
}

export async function generateMetadata({ params }: PracticeModePageProps): Promise<Metadata> {
  const { mode } = await params;
  const catalog = getPracticeMode(mode);
  return {
    title: catalog ? `${catalog.title} · Practice · Keypath` : "Practice · Keypath",
  };
}

export default async function PracticeModePage({ params }: PracticeModePageProps) {
  const { mode } = await params;
  const catalog = getPracticeMode(mode);
  if (!catalog) {
    notFound();
  }
  return <PracticePlayer mode={catalog} />;
}

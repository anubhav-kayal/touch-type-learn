import { PracticePlayer } from "@/components/practice/PracticePlayer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice · Keypath",
};

export default function PracticePage() {
  return <PracticePlayer />;
}

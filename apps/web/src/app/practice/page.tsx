import { PracticeHub } from "@/components/practice/PracticeHub";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice · Keypath",
};

export default function PracticePage() {
  return <PracticeHub />;
}

import { WordRainView } from "@/components/play/WordRainView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Rain · Keypath",
};

export default function PlayPage() {
  return <WordRainView />;
}

import { StatsView } from "@/components/stats/StatsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats · Keypath",
};

export default function StatsPage() {
  return <StatsView />;
}

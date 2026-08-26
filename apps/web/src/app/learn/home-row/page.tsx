import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home row · Keypath",
  description: "Practice the home row without looking at the keyboard.",
};

export default function HomeRowLessonPage() {
  return <LessonPlayer />;
}

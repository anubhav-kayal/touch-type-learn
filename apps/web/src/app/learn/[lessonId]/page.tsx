import { LessonGate } from "@/components/lesson/LessonGate";
import {
  getLesson,
  listPlayableLessons,
  getWorlds,
} from "@keypath/curriculum";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export function generateStaticParams() {
  const playable = listPlayableLessons(getWorlds());
  return [{ lessonId: "home-row" }, ...playable.map((lesson) => ({ lessonId: lesson.id }))];
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  return {
    title: lesson ? `${lesson.title} · Keypath` : "Lesson · Keypath",
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  if (lessonId === "home-row") {
    redirect("/learn/w1-home-fj");
  }
  const lesson = getLesson(lessonId);
  if (!lesson) {
    notFound();
  }
  return <LessonGate lesson={lesson} />;
}

import { CourseMapView } from "@/components/learn/CourseMapView";
import { ProgressHud } from "@/components/learn/ProgressHud";
import { AppHeader } from "@/components/shell/AppHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course map · Keypath",
};

export default function LearnMapPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <AppHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-6 pb-16">
        <h1 className="mb-4 font-display text-4xl">Course map</h1>
        <ProgressHud />
        <CourseMapView />
      </main>
    </div>
  );
}

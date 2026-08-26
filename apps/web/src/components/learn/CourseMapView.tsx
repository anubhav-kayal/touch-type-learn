"use client";

import { getWorlds } from "@keypath/curriculum";
import { useLessonStars } from "@/hooks/use-lesson-stars";
import { CourseMap } from "./CourseMap";

export function CourseMapView() {
  const stars = useLessonStars();
  return <CourseMap worlds={getWorlds()} stars={stars} />;
}

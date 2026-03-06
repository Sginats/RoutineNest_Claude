import { SEED_LESSONS } from "@/lib/studySeedData";
import LessonActivitiesClient from "./LessonActivitiesClient";

export function generateStaticParams() {
  return SEED_LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function LessonActivitiesPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonActivitiesClient lessonId={lessonId} />;
}

import { SEED_SUBJECT_AREAS } from "@/lib/studySeedData";
import SubjectModulesClient from "./SubjectModulesClient";

export function generateStaticParams() {
  return SEED_SUBJECT_AREAS.map((s) => ({ subjectId: s.id }));
}

export default async function SubjectModulesPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;
  return <SubjectModulesClient subjectId={subjectId} />;
}

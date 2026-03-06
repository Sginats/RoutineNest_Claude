import { SEED_MODULES } from "@/lib/studySeedData";
import ModuleLessonsClient from "./ModuleLessonsClient";

export function generateStaticParams() {
  return SEED_MODULES.map((m) => ({ moduleId: m.id }));
}

export default async function ModuleLessonsPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  return <ModuleLessonsClient moduleId={moduleId} />;
}

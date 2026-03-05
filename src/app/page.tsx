import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">RoutineNest</h1>
      <p className="text-muted-foreground">
        Routines + AAC communication for children
      </p>
      <Button size="lg">Get Started</Button>
    </div>
  );
}

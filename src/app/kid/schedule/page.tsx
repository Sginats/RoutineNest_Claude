import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">My Schedule</h1>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Routine</CardTitle>
          <CardDescription>
            Follow your daily tasks step by step
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            No tasks scheduled yet. A parent can add tasks for you!
          </p>
          <Button size="lg" className="w-full sm:w-auto">
            View All Tasks
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

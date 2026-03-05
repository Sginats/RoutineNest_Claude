import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RewardsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">My Rewards</h1>

      <Card>
        <CardHeader>
          <CardTitle>Stars Earned</CardTitle>
          <CardDescription>
            Complete tasks to earn stars!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-6xl">⭐ 0</p>
          <p className="text-muted-foreground">
            Finish your routine to earn your first star!
          </p>
          <Button size="lg" className="w-full sm:w-auto">
            View Rewards
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

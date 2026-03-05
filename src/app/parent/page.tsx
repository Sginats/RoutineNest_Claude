import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ParentPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Parent Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Manage your child&apos;s daily routine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full">
              Edit Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Talk Board</CardTitle>
            <CardDescription>
              Customize AAC communication buttons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full">
              Edit Talk Board
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
            <CardDescription>
              Set up rewards and track stars
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full">
              Manage Rewards
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure app preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" className="w-full">
              Open Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TalkPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Talk Board</h1>

      <Card>
        <CardHeader>
          <CardTitle>AAC Communication</CardTitle>
          <CardDescription>
            Tap a button to speak
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button size="lg" variant="outline" className="h-20 w-32 text-lg">
            Yes
          </Button>
          <Button size="lg" variant="outline" className="h-20 w-32 text-lg">
            No
          </Button>
          <Button size="lg" variant="outline" className="h-20 w-32 text-lg">
            Help
          </Button>
          <Button size="lg" variant="outline" className="h-20 w-32 text-lg">
            More
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

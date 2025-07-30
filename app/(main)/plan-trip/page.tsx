import TripInputForm from "@/components/trip-planning/TripInputForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanTripPage() {
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Plan Your Next Adventure</CardTitle>
                <CardDescription>
                    Tell us your plans, and our AI will craft the perfect itinerary for you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TripInputForm />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
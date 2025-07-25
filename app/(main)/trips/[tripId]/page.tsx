import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient, Suggestion } from '@prisma/client';
import SuggestionCard from '@/components/trip-planning/SuggestionCard';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    tripId: string;
  };
}

export default async function TripDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const trip = await prisma.trip.findUnique({
    where: { id: params.tripId },
    include: {
      suggestions: true,
    },
  });

  if (!trip || trip.userId !== session.user.id) {
    return <p className="text-center mt-10">Trip not found or you do not have permission to view it.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Your Personalized Itineraries</h1>
            <p className="mt-2 text-gray-600">
                For your trip from {new Date(trip.travelStartDate).toLocaleDateString()} to {new Date(trip.travelEndDate).toLocaleDateString()}
            </p>
        </div>
        {trip.suggestions.map((suggestion: Suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}
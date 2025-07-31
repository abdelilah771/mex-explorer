import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const prisma = new PrismaClient();

export default async function MyTripsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  // --- THIS IS THE CORRECTED QUERY ---
  // Find trips where the 'members' list contains the current user's ID
  const trips = await prisma.trip.findMany({
    where: { 
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="mt-2 text-muted-foreground">View your planned trips and saved itineraries.</p>
        </div>
        <div className="space-y-6">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <Link href={`/trips/${trip.id}`} key={trip.id}>
                <div className="block rounded-xl border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1">
                  <h2 className="font-bold text-primary">{trip.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trip.travelStartDate).toLocaleDateString()} - {new Date(trip.travelEndDate).toLocaleDateString()}
                  </p>
                  <p className="mt-2">Destination: {trip.destination}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>You haven't planned any trips yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
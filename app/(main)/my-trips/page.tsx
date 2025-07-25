import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function MyTripsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
          <p className="mt-2 text-gray-600">View your planned trips and saved itineraries.</p>
        </div>
        <div className="space-y-6">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <Link href={`/trips/${trip.id}`} key={trip.id}>
                <div className="block rounded-xl border bg-white p-6 shadow-lg transition-transform hover:-translate-y-1">
                  <h2 className="font-bold text-indigo-600">Trip to Marrakech</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(trip.travelStartDate).toLocaleDateString()} - {new Date(trip.travelEndDate).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-gray-800">Budget: ${trip.budget}</p>
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
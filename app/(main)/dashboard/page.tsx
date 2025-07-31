import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import DashboardClient from '@/components/dashboard/DashboardClient';

const prisma = new PrismaClient();

async function getDashboardData(userId: string) {
  const [userWithCounts, trips, feedPosts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { friends: true, tripMemberships: true },
        },
      },
    }),
    // --- THIS IS THE CORRECTED QUERY ---
    prisma.trip.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
        travelStartDate: { gte: new Date() }, // Only upcoming trips
      },
      orderBy: { travelStartDate: 'asc' },
      take: 1, // Get only the next upcoming trip
    }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        author: {
          select: { name: true, image: true, email: true },
        },
      },
    }),
  ]);

  // The DashboardClient component expects a `trips` count, but our schema now provides `tripMemberships`.
  // We'll remap the property here to avoid changing the client component.
  const user = userWithCounts
    ? {
        ...userWithCounts,
        _count: {
          friends: userWithCounts._count.friends,
          trips: userWithCounts._count.tripMemberships,
        },
      }
    : null;

  const upcomingTrip = trips[0] || null;

  return { user, upcomingTrip, feedPosts };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
        <DashboardClient {...data} />
    </div>
  );
}
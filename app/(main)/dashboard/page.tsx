import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import DashboardClient from '@/components/dashboard/DashboardClient';

const prisma = new PrismaClient();

async function getDashboardData(userId: string) {
  // Use Promise.all to fetch everything at once for better performance
  const [user, trips, feedPosts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.trip.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3, // Get the 3 most recent posts from the feed
      include: {
        author: {
          select: { name: true, image: true, email: true },
        },
      },
    }),
  ]);

  const currentTrip = trips[0] || null;
  const pastTrips = trips.slice(1);

  return { user, currentTrip, pastTrips, feedPosts };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <DashboardClient {...data} />
      </div>
    </div>
  );
}
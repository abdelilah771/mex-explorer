import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import DashboardClient from '@/components/dashboard/DashboardClient';

const prisma = new PrismaClient();

async function getDashboardData(userId: string) {
  const [user, trips, feedPosts] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId },
      include: {
        _count: {
          select: { friends: true, trips: true }
        }
      } 
    }),
    prisma.trip.findMany({
      where: { 
        userId: userId,
        travelStartDate: { gte: new Date() } // Only upcoming trips
      },
      orderBy: { travelStartDate: 'asc' },
      take: 1, // Get only the next upcoming trip
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
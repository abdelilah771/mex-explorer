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
          select: { trips: true, following: true, followedBy: true }
        }
      } 
    }),
    prisma.trip.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4, 
      include: {
        author: {
          select: { name: true, image: true, email: true },
        },
      },
    }),
  ]);

  return { user, trips, feedPosts };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
        <DashboardClient {...data} />
    </div>
  );
}
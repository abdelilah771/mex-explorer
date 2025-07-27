import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import UserProfileClient from '@/components/profile/UserProfileClient';

const prisma = new PrismaClient();

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  // Fetch all data for the profile in one go
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      posts: { 
        orderBy: { createdAt: 'desc' }, 
        take: 6 
      },
      trips: { 
        orderBy: { travelStartDate: 'asc' },
        where: { travelStartDate: { gte: new Date() } }, // Only upcoming trips
        take: 3,
      },
      achievements: true, // <-- This line was missing
      _count: { 
        select: { trips: true, following: true, followedBy: true } 
      },
    },
  });

  if (!user) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  // Check if the current logged-in user is following this profile
  const currentUser = session?.user?.id ? await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { following: { where: { id: params.userId } } }
  }) : null;

  const isFollowing = !!currentUser?.following?.length;

  return (
    <UserProfileClient 
      user={user} 
      isOwnProfile={user.id === session?.user?.id}
      isFollowing={isFollowing}
    />
  );
}
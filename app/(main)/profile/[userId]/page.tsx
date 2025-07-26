import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import UserProfileClient from '@/components/profile/UserProfileClient';

const prisma = new PrismaClient();

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      posts: { orderBy: { createdAt: 'desc' } },
      trips: { orderBy: { createdAt: 'desc' } },
      _count: {
        select: { trips: true, following: true, followedBy: true },
      },
    },
  });

  if (!user) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  const currentUser = session?.user?.id ? await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { following: { where: { id: params.userId } } }
  }) : null;

  const isFollowing = !!currentUser?.following?.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <UserProfileClient 
        user={user} 
        isOwnProfile={user.id === session?.user?.id}
        isFollowing={isFollowing}
      />
    </div>
  );
}
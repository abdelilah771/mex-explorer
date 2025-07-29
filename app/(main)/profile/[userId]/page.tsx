import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import UserProfileClient from '@/components/profile/UserProfileClient';
import { UserProfile } from '@/lib/types';

const prisma = new PrismaClient();

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

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
        where: { travelStartDate: { gte: new Date() } },
        take: 3,
      },
      achievements: true,
      friends: {
        where: { id: currentUserId } // Check if the current user is in the friends list
      },
      _count: { 
        select: { trips: true, following: true, followedBy: true } 
      },
    },
  });

  if (!user) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  // Determine the friendship status
  let friendshipStatus: 'none' | 'sent' | 'received' | 'friends' = 'none';
  if (user.friends.length > 0) {
    friendshipStatus = 'friends';
  } else if (currentUserId && currentUserId !== user.id) {
    const friendRequest = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                { fromUserId: currentUserId, toUserId: user.id },
                { fromUserId: user.id, toUserId: currentUserId },
            ],
            status: 'PENDING'
        }
    });
    if (friendRequest) {
        friendshipStatus = friendRequest.fromUserId === currentUserId ? 'sent' : 'received';
    }
  }

  return (
    <UserProfileClient 
      user={user as UserProfile}
      isOwnProfile={user.id === currentUserId}
      friendshipStatus={friendshipStatus}
    />
  );
}
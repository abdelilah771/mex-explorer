import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import UserProfileClient from '@/components/profile/UserProfileClient';
import { UserProfile } from '@/lib/types';

const prisma = new PrismaClient();

export default async function ProfilePage(props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

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
      // This section fetches a preview of the user's friends
      friends: {
        take: 9, 
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        }
      },
      _count: { 
        select: { 
          trips: true, 
          friends: true,
          friendsOf: true,
        } 
      },
    },
  });

  if (!user) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  // Determine the friendship status between the current user and the profile being viewed
  let friendshipStatus: 'none' | 'sent' | 'received' | 'friends' = 'none';
  if (currentUserId && currentUserId !== user.id) {
    // Check if they are already friends by seeing if the current user is in the friends list
    const areFriends = await prisma.user.findFirst({
        where: { id: user.id, friends: { some: { id: currentUserId } } }
    });

    if (areFriends) {
        friendshipStatus = 'friends';
    } else {
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
  }

  return (
    <UserProfileClient 
      user={user as UserProfile}
      isOwnProfile={user.id === currentUserId}
      friendshipStatus={friendshipStatus}
    />
  );
}
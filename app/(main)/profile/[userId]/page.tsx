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

  // --- Calculate Mutual Friends ---
  let mutualFriendsCount = 0;
  if (currentUserId && currentUserId !== user.id) {
    // 1. Get the list of IDs for the current user's friends
    const currentUserFriends = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { friends: { select: { id: true } } },
    });
    const currentUserFriendIds = new Set(currentUserFriends?.friends.map(f => f.id));

    // 2. Get the list of IDs for the profile user's friends
    const profileUserFriends = await prisma.user.findUnique({
      where: { id: user.id },
      select: { friends: { select: { id: true } } },
    });
    const profileUserFriendIds = new Set(profileUserFriends?.friends.map(f => f.id));

    // 3. Find the intersection of the two sets
    mutualFriendsCount = [...currentUserFriendIds].filter(id => profileUserFriendIds.has(id)).length;
  }

  // Determine the friendship status
  let friendshipStatus: 'none' | 'sent' | 'received' | 'friends' = 'none';
  if (currentUserId && currentUserId !== user.id) {
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
      mutualFriendsCount={mutualFriendsCount}
    />
  );
}
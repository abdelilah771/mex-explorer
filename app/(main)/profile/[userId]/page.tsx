import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UserProfileClient from '@/components/profile/UserProfileClient';
import { UserProfile } from '@/lib/types';
import { notFound } from 'next/navigation';

// Define the correct type for the page's props
interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      posts: { 
        orderBy: { createdAt: 'desc' }, 
        take: 6 
      },
      tripMemberships: {
        orderBy: { trip: { travelStartDate: 'asc' } },
        include: {
            trip: true
        }
      },
      achievements: true,
      friends: {
        take: 9, 
        select: { id: true, name: true, image: true }
      },
      _count: { 
        select: { 
          tripMemberships: true,
          friends: true,
        } 
      },
    },
  });

  if (!user) {
    notFound();
  }
  
  const trips = user.tripMemberships.map(membership => membership.trip);
  
  const userForClient = {
      ...user,
      trips,
      _count: {
          friends: user._count.friends,
          trips: user._count.tripMemberships,
      }
  };

  // --- Server-Side Logic for Friendship Status ---
  let friendshipStatus: 'none' | 'sent' | 'received' | 'friends' = 'none';
  let mutualFriendsCount = 0;

  if (currentUserId && currentUserId !== user.id) {
    const areFriends = await prisma.user.findFirst({
        where: { id: user.id, friends: { some: { id: currentUserId } } }
    });

    if (areFriends) {
        friendshipStatus = 'friends';
        const currentUserFriends = await prisma.user.findUnique({ 
            where: { id: currentUserId }, 
            select: { friends: { select: { id: true } } } 
        });
        const profileUserFriendIds = new Set(user.friends.map(f => f.id));
        if (currentUserFriends) {
            mutualFriendsCount = currentUserFriends.friends.filter(f => profileUserFriendIds.has(f.id)).length;
        }
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
      user={userForClient as UserProfile}
      isOwnProfile={user.id === currentUserId}
      friendshipStatus={friendshipStatus}
      mutualFriendsCount={mutualFriendsCount}
    />
  );
}
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UserProfileClient from '@/components/profile/UserProfileClient';
import { UserProfile } from '@/lib/types';

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  // This is the corrected, complete query
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      posts: { 
        orderBy: { createdAt: 'desc' }, 
        take: 6 
      },
      // --- THIS IS THE CORRECT WAY TO FETCH TRIPS ---
      tripMemberships: {
        orderBy: { trip: { travelStartDate: 'asc' } },
        take: 3,
        include: {
            trip: true // Include the actual trip data from the membership
        }
      },
      achievements: true,
      friends: {
        take: 9, 
        select: { id: true, name: true, image: true, email: true }
      },
      _count: { 
        select: { 
          tripMemberships: true, // Count memberships instead of trips
          friends: true,
          friendsOf: true,
        } 
      },
    },
  });

  if (!user) {
    return <div className="p-8 text-center">User not found.</div>;
  }
  
  // Transform the data for the client component
  const trips = user.tripMemberships.map(membership => membership.trip);
  const userForClient = {
      ...user,
      trips, // Add the cleaned trips array
      _count: {
          ...user._count,
          trips: user._count.tripMemberships,
      }
  };

  // Determine friendship status
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
  
  // Calculate Mutual Friends
  let mutualFriendsCount = 0;
  if (currentUserId && currentUserId !== user.id) {
    const currentUserFriends = await prisma.user.findUnique({ where: { id: currentUserId }, select: { friends: { select: { id: true } } } });
    const profileUserFriendIds = new Set(user.friends.map(f => f.id));
    if (currentUserFriends) {
        mutualFriendsCount = currentUserFriends.friends.filter(f => profileUserFriendIds.has(f.id)).length;
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
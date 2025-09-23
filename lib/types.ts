// lib/types.ts

import { Prisma, Trip, User , Post, Achievement} from '@prisma/client';


// This will be our single source of truth for the user profile shape
// Generate type that matches your exact Prisma query
export type UserProfile = Prisma.UserGetPayload<{
  include: {
    posts: { orderBy: { createdAt: 'desc' }, take: 6 };
    tripMemberships: {
      include: { trip: true };
      orderBy: { trip: { travelStartDate: 'asc' } };
    };
    achievements: true;
    friends: {
      take: 9;
      select: { id: true; name: true; image: true };
    };
    _count: {
      select: {
        tripMemberships: true;
        friends: true;
      };
    };
  };
}> & {
  trips: Prisma.TripGetPayload<{}>[];
  _count: {
    friends: number;
    trips: number;
  };
};
// 1. A validator that EXACTLY matches your prisma query in page.tsx
const profileQueryValidator = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    posts: { 
      orderBy: { createdAt: 'desc' }, 
      take: 6 
    },
    // This now correctly reflects that we fetch memberships to get to the trips
    tripMemberships: {
      orderBy: { trip: { travelStartDate: 'asc' } },
      take: 3,
      include: {
          trip: true
      }
    },
    achievements: true,
    // This now correctly uses 'select' to only get specific friend fields
    friends: {
      take: 9, 
      select: { id: true, name: true, image: true, email: true }
    },
    _count: { 
      select: { 
        tripMemberships: true,
        friends: true,
        friendsOf: true,
      } 
    },
  },
});

// 2. This type represents the RAW data returned from Prisma
type PrismaProfilePayload = Prisma.UserGetPayload<typeof profileQueryValidator>;

// 3. This is the final, CLEAN type for your client component props
// We extend the raw type but replace tripMemberships with a clean trips array

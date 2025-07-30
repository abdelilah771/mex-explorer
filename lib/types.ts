import { Prisma } from '@prisma/client';

// This Prisma validator automatically creates a type based on our query
const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    posts: true,
    trips: true,
    achievements: true,
    friends: true, // This was already here, which is great
    _count: {
      select: { 
        trips: true, 
        friends: true,
        friendsOf: true,
      },
    },
  },
});

export type UserProfile = Prisma.UserGetPayload<typeof userWithRelations>;
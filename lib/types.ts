import { Prisma } from '@prisma/client';

const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    posts: { orderBy: { createdAt: 'desc' } },
    trips: { orderBy: { createdAt: 'desc' } },
    achievements: true,
    _count: {
      select: { trips: true, following: true, followedBy: true },
    },
  },
});

export type UserProfile = Prisma.UserGetPayload<typeof userWithRelations>;
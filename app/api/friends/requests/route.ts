import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        toUserId: currentUserId,
        status: 'PENDING',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(friendRequests);
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
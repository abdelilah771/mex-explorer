import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ requests: [], count: 0 }); // Return empty if not logged in
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return both the list and the count in the response
    return NextResponse.json({
        requests: friendRequests,
        count: friendRequests.length
    });

  } catch (error) {
    console.error("Failed to fetch friend requests:", error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
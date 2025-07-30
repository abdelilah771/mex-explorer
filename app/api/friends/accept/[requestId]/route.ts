import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { requestId: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: params.requestId },
    });

    if (!friendRequest || friendRequest.toUserId !== currentUserId) {
      return NextResponse.json({ message: 'Invalid friend request' }, { status: 404 });
    }

    // Use a transaction to update the request and create the friendship
    await prisma.$transaction([
      // 1. Mark the request as ACCEPTED
      prisma.friendRequest.update({
        where: { id: params.requestId },
        data: { status: 'ACCEPTED' },
      }),
      // 2. Add each user to the other's friends list
      prisma.user.update({
        where: { id: friendRequest.fromUserId },
        data: { friends: { connect: { id: currentUserId } } },
      }),
      prisma.user.update({
        where: { id: currentUserId },
        data: { friends: { connect: { id: friendRequest.fromUserId } } },
      }),
    ]);

    return NextResponse.json({ message: 'Friend request accepted' });
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
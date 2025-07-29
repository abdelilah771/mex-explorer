import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const targetUserId = params.userId;

  if (!currentUserId || currentUserId === targetUserId) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    // Check if a request already exists between these two users
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromUserId: currentUserId, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: currentUserId },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json({ message: 'A friend request already exists.' }, { status: 409 });
    }

    // Create the new friend request
    await prisma.friendRequest.create({
      data: {
        fromUserId: currentUserId,
        toUserId: targetUserId,
      },
    });

    return NextResponse.json({ message: 'Friend request sent' });
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
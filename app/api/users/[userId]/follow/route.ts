import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: { userId: string };
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const targetUserId = params.userId;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  if (currentUserId === targetUserId) {
    return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
  }

  try {
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: currentUserId,
        following: { some: { id: targetUserId } },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.user.update({
        where: { id: currentUserId },
        data: { following: { disconnect: { id: targetUserId } } },
      });
      return NextResponse.json({ message: 'User unfollowed' });
    } else {
      // Follow
      await prisma.user.update({
        where: { id: currentUserId },
        data: { following: { connect: { id: targetUserId } } },
      });
      return NextResponse.json({ message: 'User followed' });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
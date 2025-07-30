import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const targetUserId = params.userId;

  if (!currentUserId || currentUserId === targetUserId) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    // Use a transaction to remove the friendship from both sides
    await prisma.$transaction([
      prisma.user.update({
        where: { id: currentUserId },
        data: { friends: { disconnect: { id: targetUserId } } },
      }),
      prisma.user.update({
        where: { id: targetUserId },
        data: { friends: { disconnect: { id: currentUserId } } },
      }),
    ]);

    return NextResponse.json({ message: 'Friend removed' });
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
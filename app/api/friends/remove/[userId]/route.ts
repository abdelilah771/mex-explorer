import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const targetUserId = params.userId;

  if (!currentUserId || currentUserId === targetUserId) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    // Use a transaction to perform all actions together
    await prisma.$transaction(async (tx) => {
      // 1. Remove the friendship from both users
      await tx.user.update({
        where: { id: currentUserId },
        data: { friends: { disconnect: { id: targetUserId } } },
      });
      await tx.user.update({
        where: { id: targetUserId },
        data: { friends: { disconnect: { id: currentUserId } } },
      });

      // 2. Find and delete the original friend request
      const friendRequest = await tx.friendRequest.findFirst({
        where: {
          OR: [
            { fromUserId: currentUserId, toUserId: targetUserId },
            { fromUserId: targetUserId, toUserId: currentUserId },
          ],
        },
      });

      if (friendRequest) {
        await tx.friendRequest.delete({
          where: { id: friendRequest.id },
        });
      }
    });

    return NextResponse.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error("UNFRIEND_ERROR", error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
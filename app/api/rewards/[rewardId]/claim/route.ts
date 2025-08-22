import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, props: { params: Promise<{ rewardId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const rewardId = params.rewardId;

  if (!userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });

      if (!user || !reward) {
        throw new Error('User or Reward not found.');
      }
      
      if (user.points < reward.pointsRequired) {
        throw new Error('Not enough points to claim this reward.');
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: reward.pointsRequired,
          },
          unlockedRewards: {
            connect: { id: rewardId },
          },
        },
      });

      return updatedUser;
    });

    return NextResponse.json({ message: 'Reward claimed successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('REWARD_CLAIM_ERROR', error);
    return NextResponse.json({ message: error.message || 'Error claiming reward' }, { status: 400 });
  }
}
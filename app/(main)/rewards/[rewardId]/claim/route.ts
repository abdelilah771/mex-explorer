import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: {
    rewardId: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const rewardId = params.rewardId;

  if (!userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    console.log("--- Claim Reward API Started ---");
    console.log(`Attempting to claim reward: ${rewardId} for user: ${userId}`);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });

      if (!user || !reward) {
        console.log("Error: User or Reward not found.");
        throw new Error('User or Reward not found.');
      }
      
      console.log(`User points from DB: ${user.points}`);
      console.log(`Reward points required: ${reward.pointsRequired}`);
      
      if (user.points < reward.pointsRequired) {
        console.log("Error: Check failed. User does not have enough points.");
        throw new Error('Not enough points to claim this reward.');
      }

      console.log("Check passed. User has enough points. Proceeding with claim...");
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

    console.log("--- Claim Reward API Successful ---");
    return NextResponse.json({ message: 'Reward claimed successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('REWARD_CLAIM_ERROR', error);
    return NextResponse.json({ message: error.message || 'Error claiming reward' }, { status: 400 });
  }
}
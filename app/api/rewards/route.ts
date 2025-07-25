import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      // Order rewards by the points required, from lowest to highest
      orderBy: {
        pointsRequired: 'asc',
      },
    });
    return NextResponse.json(rewards, { status: 200 });
  } catch (error) {
    console.error('REWARDS_FETCH_ERROR', error);
    return NextResponse.json({ message: 'Error fetching rewards' }, { status: 500 });
  }
}
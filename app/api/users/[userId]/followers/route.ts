import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: { userId: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        // This fetches the list of users who are following the user
        followedBy: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true, // For avatar fallback
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.followedBy, { status: 200 });
  } catch (error) {
    console.error('FETCH_FOLLOWERS_ERROR', error);
    return NextResponse.json({ message: 'Error fetching followers' }, { status: 500 });
  }
}
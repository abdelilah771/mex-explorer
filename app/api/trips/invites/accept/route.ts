import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const { tripId } = await request.json();

  if (!currentUserId || !tripId) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    await prisma.tripMembership.update({
      where: {
        tripId_userId: {
          tripId: tripId,
          userId: currentUserId,
        },
      },
      data: { status: 'ACCEPTED' },
    });
    return NextResponse.json({ message: 'Invitation accepted' });
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
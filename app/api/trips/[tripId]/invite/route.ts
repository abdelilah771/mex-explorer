import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TripRole } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { friendIds } = await request.json();
    if (!friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
      return NextResponse.json({ message: 'Friend IDs must be a non-empty array' }, { status: 400 });
    }

    const tripMembership = await prisma.tripMembership.findFirst({
      where: {
        tripId: params.tripId,
        userId: currentUserId,
        role: TripRole.OWNER,
      },
    });

    if (!tripMembership) {
      return NextResponse.json({ message: 'Only the trip owner can invite members' }, { status: 403 });
    }

    const newMembersData = friendIds.map((friendId: string) => ({
      tripId: params.tripId,
      userId: friendId,
      role: TripRole.MEMBER,
    }));

    await prisma.tripMembership.createMany({
      data: newMembersData,
      skipDuplicates: true,
    });

    return NextResponse.json({ message: 'Friends invited successfully' });
  } catch (error) {
    console.error('TRIP_INVITE_ERROR', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
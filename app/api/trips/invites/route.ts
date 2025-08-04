import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient, TripRole, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: { tripId: string };
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { friendIds } = await request.json(); // Expect an array of friend IDs
    if (!friendIds || !Array.isArray(friendIds)) {
      return NextResponse.json({ message: 'Friend IDs must be an array' }, { status: 400 });
    }

    // 1. First, verify that the current user is the OWNER of the trip
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

    // 2. Prepare the new membership data
    const newMembersData: Prisma.TripMembershipCreateManyInput[] = friendIds.map((friendId: string) => ({
      tripId: params.tripId,
      userId: friendId,
      role: TripRole.MEMBER,
    }));

    // 3. Add the new members to the trip
    // `skipDuplicates` will prevent errors if a user is already a member
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
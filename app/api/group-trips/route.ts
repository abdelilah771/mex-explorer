import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TripRole } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      destination,
      travelStartDate,
      travelEndDate,
      budget,
      friendIds,
    } = body;

    if (!name || !destination || !travelStartDate || !travelEndDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newTrip = await prisma.trip.create({
      data: {
        name,
        destination,
        travelStartDate: new Date(travelStartDate),
        travelEndDate: new Date(travelEndDate),
        budget: budget ? parseFloat(budget) : null,
      },
    });

    // --- THIS IS THE FIX ---
    // We explicitly define the type for the array here
    const membersToCreate: { tripId: string; userId: string; role: TripRole }[] = [
      {
        tripId: newTrip.id,
        userId: currentUserId,
        role: TripRole.OWNER,
      },
    ];

    if (friendIds && Array.isArray(friendIds)) {
      friendIds.forEach((friendId: string) => {
        membersToCreate.push({
          tripId: newTrip.id,
          userId: friendId,
          role: TripRole.MEMBER,
        });
      });
    }

    await prisma.tripMembership.createMany({
      data: membersToCreate,
    });

    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error('GROUP_TRIP_CREATION_ERROR', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
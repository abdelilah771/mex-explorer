import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TripRole, MembershipStatus } from '@prisma/client';

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

    // Use a transaction to ensure all database operations succeed or fail together
    const newTrip = await prisma.$transaction(async (tx) => {
      // 1. Create the new Trip
      const trip = await tx.trip.create({
        data: {
          name,
          destination,
          travelStartDate: new Date(travelStartDate),
          travelEndDate: new Date(travelEndDate),
          budget: budget ? parseFloat(budget) : null,
        },
      });

      // 2. Create the owner's membership with ACCEPTED status
      await tx.tripMembership.create({
        data: {
          tripId: trip.id,
          userId: currentUserId,
          role: TripRole.OWNER,
          status: MembershipStatus.ACCEPTED, // Set status to ACCEPTED
        }
      });
      
      // 3. Create PENDING invitations for invited friends
      if (friendIds && Array.isArray(friendIds) && friendIds.length > 0) {
        const membersToCreate = friendIds.map((friendId: string) => ({
          tripId: trip.id,
          userId: friendId,
          role: TripRole.MEMBER,
          status: MembershipStatus.PENDING, // Status is PENDING for invites
        }));
        await tx.tripMembership.createMany({
          data: membersToCreate,
        });
      }
      
      return trip;
    });

    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error('GROUP_TRIP_CREATION_ERROR', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
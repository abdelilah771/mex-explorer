// app/api/trips/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// --- 1. Importer MembershipStatus ---
import { PrismaClient, TripRole, MembershipStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name, destination, travelStartDate, travelEndDate, budget } = await request.json();

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
        members: {
          create: {
            userId: currentUserId,
            role: TripRole.OWNER,
            // --- 2. Ajouter cette ligne pour définir le statut ---
            status: MembershipStatus.ACCEPTED,
          },
        },
      },
    });

    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error('TRIP_CREATION_ERROR', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
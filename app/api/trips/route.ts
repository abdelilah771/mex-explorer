import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { travelStartDate, travelEndDate, budget, souvenirType } = body;

    const newTrip = await prisma.trip.create({
      data: {
        travelStartDate: new Date(travelStartDate),
        travelEndDate: new Date(travelEndDate),
        budget,
        souvenirType,
        userId: session.user.id, // Link the trip to the logged-in user
      },
    });

    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error('TRIP_CREATION_ERROR', error);
    return NextResponse.json({ message: 'Error creating trip' }, { status: 500 });
  }
}
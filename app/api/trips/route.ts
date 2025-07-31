import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient, TripRole } from '@prisma/client'; // 1. Import the TripRole enum

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, destination, travelStartDate, travelEndDate } = body;

    if (!name || !destination || !travelStartDate || !travelEndDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create the trip and add the current user as the OWNER
    const newTrip = await prisma.trip.create({
      data: {
        name,
        destination,
        travelStartDate: new Date(travelStartDate),
        travelEndDate: new Date(travelEndDate),
        members: {
          create: {
            userId: currentUserId,
            role: TripRole.OWNER, // 2. Use the enum here
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
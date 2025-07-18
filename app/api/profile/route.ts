import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  // 1. Get the user's session to make sure they are logged in
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    // 2. Get the quiz data from the request body
    const body = await request.json();
    const { interests, travelStyle, activityLevel } = body;

    // 3. Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        interests,
        travelStyle,
        activityLevel,
        profileComplete: true, // Set the profile as complete
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('PROFILE_UPDATE_ERROR', error);
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MembershipStatus } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const { tripId } = await request.json();

  if (!currentUserId || !tripId) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    // Find the membership record to make sure it's a PENDING invite
    const membership = await prisma.tripMembership.findUnique({
        where: {
            tripId_userId: { tripId, userId: currentUserId },
        }
    });

    if (!membership || membership.status !== MembershipStatus.PENDING) {
        return NextResponse.json({ message: 'Invitation not found or already responded to.' }, { status: 404 });
    }

    // Update the status to ACCEPTED
    await prisma.tripMembership.update({
      where: {
        tripId_userId: { tripId, userId: currentUserId },
      },
      data: { status: MembershipStatus.ACCEPTED },
    });
    return NextResponse.json({ message: 'Invitation accepted' });
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
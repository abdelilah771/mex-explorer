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
     // Find the membership record to make sure it exists
    const membership = await prisma.tripMembership.findUnique({
        where: {
            tripId_userId: { tripId, userId: currentUserId },
        }
    });

    if (!membership) {
        return NextResponse.json({ message: 'Invitation not found.' }, { status: 404 });
    }
    
    // Declining an invitation will delete the membership record
    await prisma.tripMembership.delete({
      where: {
        tripId_userId: {
          tripId: tripId,
          userId: currentUserId,
        },
      },
    });
    return NextResponse.json({ message: 'Invitation declined' });
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
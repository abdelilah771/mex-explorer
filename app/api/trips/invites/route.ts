import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MembershipStatus } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ invites: [], count: 0 });
  }

  try {
    const invitations = await prisma.tripMembership.findMany({
      where: {
        userId: currentUserId,
        status: MembershipStatus.PENDING,
      },
      include: {
        trip: { 
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
        invites: invitations,
        count: invitations.length
    });

  } catch (error) {
    console.error("Failed to fetch trip invitations:", error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
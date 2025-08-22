import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request, props: { params: Promise<{ requestId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: params.requestId },
    });

    if (!friendRequest || friendRequest.toUserId !== currentUserId) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 404 });
    }

    // Change the action from 'update' to 'delete'
    await prisma.friendRequest.delete({
      where: { id: params.requestId },
    });

    return NextResponse.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error("REJECT_REQUEST_ERROR", error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Handles saving the initial profile quiz
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { interests, travelStyle, activityLevel } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        interests,
        travelStyle,
        activityLevel,
        profileComplete: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('PROFILE_QUIZ_UPDATE_ERROR', error);
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}

// Handles partial updates from the "Edit Profile" form
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, bio, image, documentUrl, coverImage, dob, nationality } = body;

    // Check if a new document is being uploaded to set the status
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const isNewDocument = documentUrl && user?.documentUrl !== documentUrl;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        image,
        coverImage,
        documentUrl,
        dob: dob ? new Date(dob) : null,
        nationality,
        // If a new document is uploaded, set status to PENDING and reset verification
        verificationStatus: isNewDocument ? 'PENDING' : user?.verificationStatus,
        identityVerified: isNewDocument ? false : user?.identityVerified,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('PROFILE_EDIT_ERROR', error);
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
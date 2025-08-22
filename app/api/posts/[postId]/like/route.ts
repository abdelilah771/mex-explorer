import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: Promise<{
    postId: string;
  }>;
}

export async function POST(request: Request, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const postId = params.postId;

  if (!userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Check if the user has already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // If like exists, "unlike" the post by deleting the record
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ message: 'Post unliked' }, { status: 200 });
    } else {
      // If like does not exist, "like" the post by creating a new record
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      return NextResponse.json({ message: 'Post liked' }, { status: 200 });
    }
  } catch (error) {
    console.error('LIKE_ERROR', error);
    return NextResponse.json({ message: 'Error processing like' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: { postId: string };
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
    }

    // @ts-ignore - Hiding persistent environment warning
    const postId = params.postId;

    const newComment = await prisma.comment.create({
      data: {
        text,
        postId: postId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { name: true, image: true, email: true },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('COMMENT_CREATION_ERROR', error);
    return NextResponse.json({ message: 'Error creating comment' }, { status: 500 });
  }
}
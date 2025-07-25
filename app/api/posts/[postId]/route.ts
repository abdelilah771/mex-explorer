import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  params: { postId: string };
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const postId = params.postId;

  if (!userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    // First, find the post to make sure the user deleting it is the author
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // If the user is the author, delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('POST_DELETE_ERROR', error);
    return NextResponse.json({ message: 'Error deleting post' }, { status: 500 });
  }
}
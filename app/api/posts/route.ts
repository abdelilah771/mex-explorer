import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const POINTS_PER_POST = 10;

// Handler for creating a new post and awarding points
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { content, imageUrl } = await request.json();
    if (!content) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const [newPost, updatedUser] = await prisma.$transaction([
      prisma.post.create({
        data: {
          content,
          imageUrl,
          authorId: userId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: POINTS_PER_POST,
          },
        },
      }),
    ]);

    return NextResponse.json({ ...newPost, pointsAwarded: POINTS_PER_POST }, { status: 201 });

  } catch (error) {
    console.error('POST_CREATION_ERROR', error);
    return NextResponse.json({ message: 'Error creating post' }, { status: 500 });
  }
}

// Handler for fetching all posts for the feed
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true, // This is required for the delete button logic
            name: true,
            image: true,
            email: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { name: true, image: true, email: true },
            },
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('POST_FETCH_ERROR', error);
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
  }
}
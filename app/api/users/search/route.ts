import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        // Search for users where the name OR email contains the query
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        // Exclude the current user from the search results
        NOT: {
          id: currentUserId,
        },
      },
      select: { // Only return the necessary public data
        id: true,
        name: true,
        image: true,
        email: true,
      },
      take: 10, // Limit the results to 10 to prevent large queries
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("USER_SEARCH_ERROR", error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
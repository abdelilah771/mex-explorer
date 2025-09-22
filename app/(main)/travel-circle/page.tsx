import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TravelCircleClient from "@/components/feed/TravelCircleClient";

export default async function TravelCirclePage() {
  const session = await getServerSession(authOptions);

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      comments: {
        include: {
          author: true,
        },
      },
      likes: true,
      _count: { // Add this _count object
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return <TravelCircleClient posts={posts} session={session} />;
}
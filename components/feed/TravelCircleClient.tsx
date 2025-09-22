"use client";

import { Post, User, Like, Comment } from "@prisma/client";
import { Session } from "next-auth";
import CreatePostForm from "./CreatePostForm";
import PostCard from "./PostCard";
import { Separator } from "@/components/ui/separator";

// This type defines the complete shape of a post object, including all related data.
type PostWithRelations = Post & {
  author: User;
  likes: Like[];
  comments: (Comment & { author: User })[];
  _count: {
    likes: number;
    comments: number;
  };
};

interface TravelCircleClientProps {
  posts: PostWithRelations[];
  session: Session | null;
}

export default function TravelCircleClient({
  posts,
  session,
}: TravelCircleClientProps) {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Travel Circle</h1>
      <p className="text-muted-foreground mb-6">
        Share your travel stories and connect with fellow explorers.
      </p>

      {/* The form to create a new post, shown only if the user is logged in */}
      {session?.user && <CreatePostForm user={session.user} />}

      <Separator className="my-8" />

      {/* The feed of posts */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} session={session} />
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No posts yet. Be the first to share an adventure!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
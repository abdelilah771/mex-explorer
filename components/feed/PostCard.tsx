"use client";

import { Post, User, Like, Comment } from "@prisma/client";
import { Session } from "next-auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, ThumbsUp, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define the complete post type, including relations
export type PostWithRelations = Post & {
  author: User;
  likes: Like[];
  comments: (Comment & { author: User })[];
  _count: {
    likes: number;
    comments: number;
  };
};

// Define the props for the PostCard component
interface PostCardProps {
  post: PostWithRelations;
  session: Session | null;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return "U";
  const names = name.split(" ");
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : "");
};

export default function PostCard({ post, session }: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(
    !!session?.user?.id && post.likes.some((like) => like.userId === session.user.id)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    if (!session) {
      toast.error("You must be logged in to like a post.");
      return;
    }

    // Immediately update the UI for a better user experience
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });
      router.refresh(); // Re-fetch server data to ensure consistency
    } catch (error) {
      toast.error("Something went wrong.");
      // Revert the UI changes if the API call fails
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
        toast.error("You must be logged in to comment.");
        return;
    }
    if (!commentText.trim()) return;

    try {
        const res = await fetch(`/api/posts/${post.id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: commentText }),
        });

        if (!res.ok) throw new Error("Failed to submit comment");
        
        setCommentText("");
        toast.success("Comment posted!");
        router.refresh();
    } catch (error) {
        toast.error("Something went wrong with your comment.");
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={post.author.image || ""} alt={post.author.name || ""} />
          <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={handleLike}>
            <ThumbsUp
              className={`mr-2 h-4 w-4 ${
                isLiked ? "text-blue-500 fill-current" : ""
              }`}
            />
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              {post._count.comments} {post._count.comments === 1 ? 'Comment' : 'Comments'}
            </Button>
          </CollapsibleTrigger>
        </div>
      </CardFooter>
      <CollapsibleContent>
        <Separator />
        <div className="p-4 space-y-4">
          {session && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
                className="resize-none"
              />
              <Button type="submit">Post</Button>
            </form>
          )}
          <div className="space-y-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 text-sm">
                <Avatar className="w-6 h-6">
                    <AvatarImage src={comment.author.image || ''} />
                    <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-2 rounded-lg">
                    <p className="font-semibold">{comment.author.name}</p>
                    <p>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Card>
  );
}
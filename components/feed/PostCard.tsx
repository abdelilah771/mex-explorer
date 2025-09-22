'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/legacy/image';
import { Session } from 'next-auth';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { MediaType } from '@prisma/client';

// Type definitions
interface Author {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
}
interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: Author;
}
interface Post {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  createdAt: string;
  author: Author;
  comments: Comment[];
  _count: {
    likes: number;
    comments: number;
  };
  likes: { userId: string }[];
}

interface PostCardProps {
  post: Post;
  session: Session | null;
}

export default function PostCard({ post, session }: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const isAuthor = post.author.id === session?.user?.id;

  useEffect(() => {
    setLikeCount(post._count.likes);
    // THE FIX IS HERE: Use optional chaining (?.)
    setIsLiked(post.likes?.length > 0);
  }, [post]);

  const handleLike = async () => {
    if (!session?.user?.id) {
        toast.error("You must be logged in to like a post.");
        return;
    }
    const originalLiked = isLiked;
    const originalLikeCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (!response.ok) {
        setIsLiked(originalLiked);
        setLikeCount(originalLikeCount);
        toast.error('Failed to update like status.');
      }
    } catch (error) {
      setIsLiked(originalLiked);
      setLikeCount(originalLikeCount);
      toast.error('An unexpected error occurred.');
    }
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Post deleted!');
        router.refresh();
      } else {
        toast.error('Failed to delete post.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the post.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      if (response.ok) {
        setCommentText('');
        toast.success('Comment posted!');
        router.refresh();
      } else {
        toast.error('Failed to post comment.');
      }
    } catch (error) {
      toast.error('An error occurred while commenting.');
    } finally {
      setIsCommenting(false);
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={post.author.image || undefined} />
          <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{post.author.name}</p>
          <p className="text-xs text-slate-500">{timeAgo}</p>
        </div>
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-2">
        <p className="text-sm text-slate-800 whitespace-pre-wrap mb-4">{post.content}</p>
        {post.mediaUrl && (
          <div className="mt-4 w-full overflow-hidden rounded-lg border">
            {post.mediaType === 'IMAGE' ? (
              <Image src={post.mediaUrl} alt="Post media" width={800} height={600} className="w-full object-cover" />
            ) : post.mediaType === 'VIDEO' ? (
              <video src={post.mediaUrl} controls className="w-full h-auto" playsInline loop />
            ) : null}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start p-4">
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
           <p>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</p>
           <p>{post._count.comments} {post._count.comments === 1 ? 'Comment' : 'Comments'}</p>
        </div>
        <div className="w-full grid grid-cols-3 gap-2 border-t pt-2">
          <Button variant="ghost" size="sm" onClick={handleLike} className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-red-500' : 'text-slate-600'}`}>
            <Heart className={`h-5 w-5 group-hover:fill-red-200 transition-colors ${isLiked ? 'fill-red-500' : 'fill-transparent'}`} />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="h-5 w-5" /> Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Share
          </Button>
        </div>
        
        {showComments && (
          <div className="w-full mt-4 space-y-4">
            <form onSubmit={handleCommentSubmit} className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 resize-none"
                rows={1}
              />
              <Button type="submit" size="sm" disabled={isCommenting}>
                {isCommenting ? '...' : 'Post'}
              </Button>
            </form>
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 text-sm pl-10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.image || undefined} />
                  <AvatarFallback className="text-xs">{comment.author.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 rounded-lg px-3 py-2">
                  <p className="font-semibold">{comment.author.name}</p>
                  <p className="text-slate-700">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
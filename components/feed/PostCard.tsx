'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Session } from 'next-auth';
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
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Define types
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
  imageUrl: string | null;
  createdAt: string;
  author: Author;
  comments: Comment[];
  _count: {
    likes: number;
  };
}
interface PostCardProps {
  post: Post;
  session: Session | null;
}

export default function PostCard({ post, session }: PostCardProps) {
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const isAuthor = post.author.id === session?.user?.id;

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (response.ok) {
        router.refresh();
      } else {
        toast.error('Failed to like post.');
      }
    } catch (error) {
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
      toast.error('An error occurred.');
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
      toast.error('An error occurred.');
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#eef3e7] bg-white p-4">
      {/* Card Header */}
      <div className="flex w-full flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.image || `https://avatar.vercel.sh/${post.author.email}`} />
            <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-[#151b0e]">{post.author.name}</p>
            <p className="text-xs text-[#76974e]">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        {isAuthor && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      {/* Post Content */}
      <p className="my-4 text-sm text-[#151b0e]">{post.content}</p>

      {/* Image Grid */}
      {post.imageUrl && (
        <div className="mt-4 w-full overflow-hidden rounded-xl">
           <Image src={post.imageUrl} alt="Post image" width={800} height={600} className="w-full object-cover" />
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 px-4 py-2">
        <button onClick={handleLike} className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-[#76974e] hover:text-red-500" viewBox="0 0 256 256"><path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path></svg>
          <p className="text-[13px] font-bold text-[#76974e]">{post._count.likes}</p>
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-4 space-y-3 border-t border-[#eef3e7] pt-4">
        {post.comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.author.image || `https://avatar.vercel.sh/${comment.author.email}`} />
              <AvatarFallback className="text-xs">{comment.author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="rounded-lg bg-gray-100 px-3 py-2">
                <strong className="font-semibold">{comment.author.name}</strong>
                <span className="ml-2 text-gray-800">{comment.text}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2 border-t border-[#eef3e7] pt-4">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 resize-none rounded-full bg-gray-100 px-4 py-2 text-sm"
          rows={1}
        />
        <Button type="submit" disabled={isCommenting} className="rounded-full">
          {isCommenting ? 'Posting...' : 'Post'}
        </Button>
      </form>
    </div>
  );
}
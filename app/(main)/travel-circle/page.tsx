import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, MapPin, Users } from 'lucide-react';

import PostCard from '@/components/feed/PostCard';
import CreatePostForm from '@/components/feed/CreatePostForm';
import { MediaType } from '@prisma/client';

// Type definition for Posts
type PostType = {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
  comments: any[];
  _count: {
    likes: number;
  };
};

// Function to fetch posts
async function getPosts(): Promise<PostType[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/posts`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

// Function to fetch user suggestions
async function getSuggestedUsers(currentUserId?: string) {
  if (!currentUserId) return [];
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { friends: { select: { id: true } } },
  });
  const friendIds = currentUser?.friends.map((friend) => friend.id) || [];
  return prisma.user.findMany({
    where: { id: { notIn: [...friendIds, currentUserId] } },
    take: 5,
    select: { id: true, name: true, image: true },
  });
}

// Main page component
export default async function TravelCirclePage() {
  const session = await getServerSession(authOptions);
  const [posts, suggestedUsers] = await Promise.all([
    getPosts(),
    getSuggestedUsers(session?.user?.id),
  ]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 sm:p-6 lg:p-8">
        {/* --- Main Content Column --- */}
        <div className="lg:col-span-3">
          <header className="mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Travel Circle
            </h1>
            <p className="mt-1 text-lg text-slate-600">
              Discover and share your Marrakech adventures.
            </p>
          </header>

          {/* NEW: Create Post Dialog Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="mb-6 hover:bg-slate-100 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={session?.user?.image ?? undefined} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-slate-500">
                    Share your experience, {session?.user?.name}...
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Create a new post</DialogTitle>
              </DialogHeader>
              {/* The form component now lives inside the Dialog */}
              <CreatePostForm />
            </DialogContent>
          </Dialog>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} session={session} />
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500">
                  No posts yet. Be the first to share your story!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- Sidebar Column --- */}
        <aside className="lg:col-span-1 space-y-6 lg:pt-20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder="Search..." className="pl-10" />
          </div>

          {/* NEW: Trending Destinations Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Trending Destinations
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">Jardin Majorelle</Badge>
              <Badge variant="secondary">Bahia Palace</Badge>
              <Badge variant="secondary">Agafay Desert</Badge>
              <Badge variant="secondary">Jemaa el-Fna</Badge>
            </CardContent>
          </Card>
          
          {/* Suggestions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                 <Users className="h-5 w-5" />
                Suggested For You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm">{user.name}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Follow
                      </Button>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-center text-slate-500 py-4">
                    No new suggestions.
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
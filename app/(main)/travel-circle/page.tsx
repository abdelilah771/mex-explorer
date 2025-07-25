import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PostCard from '@/components/feed/PostCard';
import { Button } from '@/components/ui/button';

async function getPosts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/posts`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export default async function TravelCirclePage() {
  const posts = await getPosts();
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-[#fafcf8]">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col px-4 py-5 sm:px-10">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[32px] font-bold tracking-light text-[#151b0e]">Social Feed</p>
            <p className="text-sm text-[#76974e]">Discover and share your Marrakech adventures with fellow travelers.</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 p-3">
          <Button variant="outline" className="rounded-lg bg-[#eef3e7]">Interests</Button>
          <Button variant="outline" className="rounded-lg bg-[#eef3e7]">Location</Button>
          <Button variant="outline" className="rounded-lg bg-[#eef3e7]">Travel Period</Button>
        </div>

        {/* Posts List */}
        <div className="space-y-6 py-4">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}
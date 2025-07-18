import CreatePostForm from '@/components/feed/CreatePostForm';
import PostCard from '@/components/feed/PostCard';

// Helper function to fetch posts
async function getPosts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/posts`, {
    cache: 'no-store', // Always fetch fresh data
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export default async function TravelCirclePage() {
  const posts = await getPosts();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Travel Circle</h1>
      
      {/* Form to create a new post */}
      <CreatePostForm />

      {/* List of all posts */}
      <div>
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
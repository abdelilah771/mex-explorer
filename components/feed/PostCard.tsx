'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
  };
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        // Refresh the page to show the updated like count
        router.refresh();
      } else {
        toast.error('Failed to like post.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <strong style={{ fontSize: '1.1rem' }}>{post.author.name || 'Anonymous'}</strong>
        <span style={{ color: '#888', fontSize: '0.9rem' }}>
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p>{post.content}</p>
      <div style={{ marginTop: '15px' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '1.2rem' }}>❤️</span>
          <span>{post._count.likes}</span>
        </button>
      </div>
    </div>
  );
}
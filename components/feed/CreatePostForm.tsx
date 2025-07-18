'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreatePostForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the toast to show the points awarded
        toast.success(`Post created! +${data.pointsAwarded} points awarded.`);
        setContent('');
        router.refresh();
      } else {
        toast.error('Failed to create post.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your travel experiences..."
        required
        style={{ width: '100%', minHeight: '80px', padding: '10px', marginBottom: '10px' }}
      />
      <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        {isLoading ? 'Posting...' : 'Create Post'}
      </button>
    </form>
  );
}
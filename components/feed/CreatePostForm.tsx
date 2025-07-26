'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming you added Textarea with shadcn

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
        toast.success(`Post created! +${data.pointsAwarded} points awarded.`);
        setContent('');
        router.refresh();
      } else {
        // Read the error message from the API response
        const data = await response.json();
        toast.error(data.message || 'Failed to create post.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-xl border bg-white p-6 shadow-lg">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your travel experiences..."
        required
        className="min-h-[100px]"
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading ? 'Posting...' : 'Create Post'}
      </Button>
    </form>
  );
}
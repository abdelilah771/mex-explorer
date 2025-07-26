'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
}

export default function FollowButton({ targetUserId, isFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    // Optimistically update the UI
    setIsFollowingOptimistic(!isFollowingOptimistic);

    try {
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        // If the API call fails, revert the change
        setIsFollowingOptimistic(isFollowing);
        toast.error('Something went wrong.');
      }
      router.refresh(); // Re-fetch server data to get the real count
    } catch (error) {
      setIsFollowingOptimistic(isFollowing);
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleFollow} disabled={isLoading} variant={isFollowingOptimistic ? 'secondary' : 'default'}>
      {isLoading ? '...' : (isFollowingOptimistic ? 'Unfollow' : 'Follow')}
    </Button>
  );
}
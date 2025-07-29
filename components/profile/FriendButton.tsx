'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus, Clock, UserCheck } from 'lucide-react';

interface FriendButtonProps {
  targetUserId: string;
  friendshipStatus: 'none' | 'sent' | 'received' | 'friends';
}

export default function FriendButton({ targetUserId, friendshipStatus }: FriendButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState(friendshipStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/friends/request/${targetUserId}`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Friend request sent!');
        setStatus('sent');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to send request.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'friends') {
    return (
      <Button variant="secondary" disabled>
        <UserCheck className="w-4 h-4 mr-2" />
        Friends
      </Button>
    );
  }

  if (status === 'sent') {
    return (
      <Button variant="outline" disabled>
        <Clock className="w-4 h-4 mr-2" />
        Request Sent
      </Button>
    );
  }
  
  if (status === 'received') {
    // We will build the logic to accept requests in the notifications dropdown later
     return (
      <Button variant="outline">Respond to Request</Button>
    );
  }

  return (
    <Button onClick={handleSendRequest} disabled={isLoading}>
      <UserPlus className="w-4 h-4 mr-2" />
      {isLoading ? 'Sending...' : 'Add Friend'}
    </Button>
  );
}
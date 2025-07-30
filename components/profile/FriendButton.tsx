'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus, Clock, UserCheck, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      const response = await fetch(`/api/friends/request/${targetUserId}`, { method: 'POST' });
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

  const handleUnfriend = async () => {
    setIsLoading(true);
     try {
      const response = await fetch(`/api/friends/remove/${targetUserId}`, { method: 'POST' });
      if (response.ok) {
        toast.success('Friend removed.');
        setStatus('none');
        router.refresh();
      } else {
        toast.error('Failed to remove friend.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };


  if (status === 'friends') {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" disabled={isLoading}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Friends
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handleUnfriend} className="text-destructive">
                    <UserX className="w-4 h-4 mr-2" />
                    Unfriend
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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
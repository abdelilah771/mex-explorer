'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Check, X } from 'lucide-react';

interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function FriendRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [count, setCount] = useState(0); // State for the notification count
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/friends/requests');
        const data = await response.json();
        setRequests(data.requests || []);
        setCount(data.count || 0); // Set the count from the API
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleResponse = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/friends/${action}/${requestId}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Request ${action}ed!`);
        // Optimistically update the UI
        setRequests(requests.filter(req => req.id !== requestId));
        setCount(prev => prev - 1);
        router.refresh();
      } else {
        toast.error('Failed to respond to request.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {count}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Friend Requests</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
            <DropdownMenuItem>Loading...</DropdownMenuItem>
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <DropdownMenuItem key={req.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={req.fromUser.image || ''} />
                  <AvatarFallback>{getInitials(req.fromUser.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{req.fromUser.name}</span>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleResponse(req.id, 'accept')}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleResponse(req.id, 'reject')}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem>No new requests</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
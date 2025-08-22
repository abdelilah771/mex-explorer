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
import { Plane, Check, X } from 'lucide-react';
import { Trip } from '@prisma/client';

interface TripInvitation {
  tripId: string;
  trip: {
    id: string;
    name: string;
  }
}

export default function TripInvitations() {
  const router = useRouter();
  const [invites, setInvites] = useState<TripInvitation[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const response = await fetch('/api/trips/invites');
        const data = await response.json();
        setInvites(data.invites || []);
        setCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch trip invitations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvites();
  }, []);

  const handleResponse = async (tripId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/trips/invites/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });

      if (response.ok) {
        toast.success(`Invitation ${action}ed!`);
        setInvites(invites.filter(inv => inv.tripId !== tripId));
        setCount(prev => prev - 1);
        router.refresh();
      } else {
        toast.error('Failed to respond to invitation.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Plane className="h-5 w-5" />
          {count > 0 && (
            <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {count}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Trip Invitations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
            <DropdownMenuItem>Loading...</DropdownMenuItem>
        ) : invites.length > 0 ? (
          invites.map((invite) => (
            <DropdownMenuItem key={invite.tripId} className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">Invite to: {invite.trip.name}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleResponse(invite.tripId, 'accept')}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleResponse(invite.tripId, 'decline')}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem>No new invitations</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
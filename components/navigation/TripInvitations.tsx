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


export default function TripInvitations() {
  const router = useRouter();
  const [invites, setInvites] = useState<{ trip: Trip }[]>([]);

  useEffect(() => {
    // We would create a new API endpoint to fetch just pending invitations
    // For now, this is a placeholder
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
          {/* We'll add a notification count here later */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Trip Invitations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Here we would map over the fetched invitations */}
        <DropdownMenuItem>No new invitations</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Circle } from 'lucide-react';

interface InviteFriendsDialogProps {
  tripId: string;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function InviteFriendsDialog({ tripId }: InviteFriendsDialogProps) {
  const router = useRouter();
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch the user's friends list
    const fetchFriends = async () => {
      const response = await fetch('/api/friends/list');
      const data = await response.json();
      setFriends(data);
    };
    fetchFriends();
  }, []);

  const handleFriendSelect = (friendId: string) => {
    setSelectedFriendIds(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleInvite = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendIds: selectedFriendIds }),
      });
      if (!response.ok) throw new Error("Failed to send invites.");
      
      toast.success("Friends invited successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Invite Friends</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Friends to Your Trip</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-80 overflow-y-auto my-4">
          {friends.map(friend => (
            <div key={friend.id} onClick={() => handleFriendSelect(friend.id)} className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
              <div className="flex items-center gap-3">
                <Avatar><AvatarImage src={friend.image || ''} /><AvatarFallback>{getInitials(friend.name)}</AvatarFallback></Avatar>
                <span>{friend.name}</span>
              </div>
              {selectedFriendIds.includes(friend.id) ? <Check className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
            </div>
          ))}
        </div>
        <Button onClick={handleInvite} disabled={isLoading || selectedFriendIds.length === 0} className="w-full">
          {isLoading ? 'Sending Invites...' : `Invite ${selectedFriendIds.length} Friends`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
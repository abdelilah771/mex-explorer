'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { User } from '@prisma/client';
import UserCard from '@/components/profile/UserCard';
import { Loader2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export default function FindFriendsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset search when dialog closes
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        const fetchUsers = async () => {
          setIsLoading(true);
          try {
            const response = await fetch(`/api/users/search?query=${query}`);
            const data = await response.json();
            setResults(data);
          } catch (error) {
            console.error("Failed to search users:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchUsers();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Find Friends">
          <Users className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Find Friends</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="relative">
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10"
            />
            {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
          </div>

          <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto">
            {results.length > 0 ? (
              results.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              query.length > 2 && !isLoading && <p className="text-sm text-center text-muted-foreground">No users found.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
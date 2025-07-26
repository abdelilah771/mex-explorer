'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { User } from "@prisma/client";
import UserCard from "./UserCard";

interface UserListDialogProps {
  triggerText: React.ReactNode;
  title: string;
  fetchUrl: string;
}

export default function UserListDialog({ triggerText, title, fetchUrl }: UserListDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(fetchUrl);
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, fetchUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerText}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading && <p>Loading...</p>}
          {!isLoading && users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
           {!isLoading && users.length === 0 && <p className="text-muted-foreground text-sm">No users to display.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
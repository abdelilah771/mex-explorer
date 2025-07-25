'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import EditProfileForm from './EditProfileForm';
import { User } from '@prisma/client';

interface ProfileActionsProps {
  user: User;
}

export default function ProfileActions({ user }: ProfileActionsProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">Edit Profile</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Your Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <EditProfileForm user={user} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
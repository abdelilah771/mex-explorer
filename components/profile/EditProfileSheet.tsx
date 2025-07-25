'use client';

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

interface EditProfileSheetProps {
  user: User;
}

export default function EditProfileSheet({ user }: EditProfileSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full @[480px]:w-auto">Edit Profile</Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-full overflow-y-auto sm:max-w-lg">
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
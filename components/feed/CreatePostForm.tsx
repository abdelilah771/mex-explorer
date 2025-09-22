"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Session } from "next-auth"; // Import the Session type

// 1. Define the props to accept the user object from the session
interface CreatePostFormProps {
  user: Session["user"];
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return "U";
  const names = name.split(" ");
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : "");
};

// 2. Accept the props in the component's function signature
export default function CreatePostForm({ user }: CreatePostFormProps) {
  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg bg-card">
      <Avatar>
        <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <Textarea
          placeholder={`What's on your mind, ${user?.name}?`}
          className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <Button>Post</Button>
        </div>
      </div>
    </div>
  );
}
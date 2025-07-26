'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "./FollowButton";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";

// Define a type for the user data we expect
type UserWithFollowStatus = User & {
    isFollowedByCurrentUser?: boolean;
};

interface UserCardProps {
    user: UserWithFollowStatus;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function UserCard({ user }: UserCardProps) {
    const { data: session } = useSession();
    const isCurrentUser = session?.user?.id === user.id;

    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={user.image || ''} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>
            {!isCurrentUser && (
                 <FollowButton targetUserId={user.id} isFollowing={user.isFollowedByCurrentUser || false} />
            )}
        </div>
    );
}
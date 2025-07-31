'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@prisma/client";
import Link from "next/link";

interface UserCardProps {
    user: User;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function UserCard({ user }: UserCardProps) {
    return (
        <Link href={`/profile/${user.id}`}>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer">
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
                {/* We remove the FollowButton from here to keep the card as a single, clean link */}
            </div>
        </Link>
    );
}
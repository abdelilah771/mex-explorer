import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import FriendRequests from './FriendRequests';
import FindFriendsDialog from '@/components/friends/FindFriendsDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import TripInvitations from './TripInvitations'; // 1. Import the new component

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b bg-background px-4 py-3 sm:px-10">
      <div className="flex items-center gap-4 sm:gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path></svg>
          </div>
          <h2 className="hidden text-lg font-bold sm:block">MEX</h2>
        </Link>
        <div className="flex items-center gap-4 sm:gap-9">
          <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="/my-trips">My Trips</Link>
          <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="/travel-circle">Travel Circle</Link>
          <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="/rewards">Rewards</Link>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 sm:gap-4">
        {session?.user ? (
          <>
            <FindFriendsDialog />
            <FriendRequests />
            <TripInvitations /> {/* 2. Add the component here */}
            
            <Link href={`/profile/${session.user.id}`}>
              <Avatar>
                <AvatarImage src={session.user.image || ''} alt="Profile Picture" />
                <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
              </Avatar>
            </Link>

            <LogoutButton />
          </>
        ) : (
          <Link href="/login">
             <Button>Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
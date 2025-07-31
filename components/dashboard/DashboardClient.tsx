'use client';

import Link from 'next/link';
import { User, Trip, Post } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import InterestQuiz from "@/components/profile/InterestQuiz";
import { ArrowRight, Plane, Users } from 'lucide-react';

type FeedPost = Post & {
  author: { name: string | null; image: string | null; email: string | null; };
};
type UserWithCounts = User & {
    _count: { trips: number; friends: number; };
};

interface DashboardClientProps {
  user: UserWithCounts | null;
  upcomingTrip: Trip | null;
  feedPosts: FeedPost[];
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function DashboardClient({ user, upcomingTrip, feedPosts }: DashboardClientProps) {
  if (!user) return null;

  if (!user.profileComplete) {
    return (
      <div className="mx-auto max-w-2xl p-8">
         <Card>
            <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>Answer a few questions to get personalized trip suggestions.</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
                <InterestQuiz />
            </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's a look at your travel world.</p>
        </div>
        <Link href="/plan-trip">
          <Button size="lg">+ Plan a New Trip</Button>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {upcomingTrip ? (
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardHeader>
                <CardTitle>Your Next Adventure Awaits!</CardTitle>
                <CardDescription className="text-primary-foreground/80">Upcoming trip to Marrakech</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold mb-2">{new Date(upcomingTrip.travelStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                <p>Budget: ${upcomingTrip.budget}</p>
                <Link href={`/trips/${upcomingTrip.id}`} className="mt-4 block">
                  <Button variant="secondary">View Itinerary <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>No Upcoming Trips</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">You haven't planned any new trips yet. Ready for your next adventure?</p></CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader><CardTitle>Community Feed</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {feedPosts.map(post => (
                <div key={post.id} className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border">
                      <AvatarImage src={post.author.image || ''} />
                      <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="text-sm font-medium">{post.author.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                  </div>
                </div>
              ))}
              <Link href="/travel-circle" className="mt-4 block">
                <Button variant="outline" className="w-full">View Full Feed</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3"><Users className="h-5 w-5 text-muted-foreground" /><div><p className="font-semibold">{user._count.friends}</p><p className="text-xs text-muted-foreground">Friends</p></div></div>
              <div className="flex items-center gap-3"><Plane className="h-5 w-5 text-muted-foreground" /><div><p className="font-semibold">{user._count.trips}</p><p className="text-xs text-muted-foreground">Trips Planned</p></div></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Navigation</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href={`/profile/${user.id}`}><Button variant="ghost" className="w-full justify-start">My Profile</Button></Link>
              <Link href="/my-trips"><Button variant="ghost" className="w-full justify-start">My Trips</Button></Link>
              <Link href="/rewards"><Button variant="ghost" className="w-full justify-start">Rewards</Button></Link>
              {/* "Find Friends" link has been removed from this navigation card */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
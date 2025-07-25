'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, Trip, Post, Comment } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import InterestQuiz from '@/components/profile/InterestQuiz';

// Define a more complete Post type for the feed preview
type FeedPost = Post & {
  author: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
};

interface DashboardClientProps {
  user: User | null;
  currentTrip: Trip | null;
  pastTrips: Trip[];
  feedPosts: FeedPost[];
}

export default function DashboardClient({
  user,
  currentTrip,
  pastTrips,
  feedPosts,
}: DashboardClientProps) {
  if (!user) return null;

  // Show the quiz if the user's profile is not complete
  if (!user.profileComplete) {
    return (
      <div className="mx-auto max-w-4xl">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello {user.name?.split(' ')[0]}, welcome back!</h1>
          <p className="text-muted-foreground">Here's a look at your travel world.</p>
        </div>
        <Link href="/plan-trip">
          <Button>+ Create a new trip</Button>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (Current Trip & Past Trips) */}
        <div className="space-y-8 lg:col-span-2">
          {currentTrip && (
            <Card>
              <CardHeader>
                <CardTitle>Current Trip</CardTitle>
                <CardDescription>
                  Your upcoming trip to Marrakech from {new Date(currentTrip.travelStartDate).toLocaleDateString()} to {new Date(currentTrip.travelEndDate).toLocaleDateString()}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-lg bg-gray-200">
                  {/* Placeholder for a map component */}
                  <Image src="/placeholder.svg" alt="Map" width={800} height={450} className="rounded-lg object-cover" />
                </div>
                <Link href={`/trips/${currentTrip.id}`} className="mt-4">
                  <Button className="w-full">View Trip Itinerary</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Past Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastTrips.length > 0 ? (
                  pastTrips.map(trip => (
                    <Link href={`/trips/${trip.id}`} key={trip.id} className="block rounded-lg border p-4 hover:bg-gray-50">
                      <p className="font-semibold">Trip to Marrakech</p>
                      <p className="text-sm text-muted-foreground">{new Date(trip.travelStartDate).toLocaleDateString()}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">You have no past trips.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Community Feed) */}
        <div className="space-y-8 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Community Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {feedPosts.map(post => (
                  <div key={post.id} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                       <AvatarImage src={post.author.image || `https://avatar.vercel.sh/${post.author.email}`} />
                       <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{post.author.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/travel-circle" className="mt-4">
                <Button variant="outline" className="w-full">View Full Feed</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from "react"
import { User, Trip, Post } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Plane } from "lucide-react"
import Link from "next/link";
import InterestQuiz from "../profile/InterestQuiz";

type FeedPost = Post & {
  author: { name: string | null; image: string | null; email: string | null; };
};

// --- THIS IS THE CORRECTED TYPE DEFINITION ---
type UserWithCounts = User & {
    _count: { 
        trips: number; 
        friends: number; // Use 'friends'
    };
};

interface DashboardClientProps {
  user: UserWithCounts | null;
  trips: Trip[];
  feedPosts: FeedPost[];
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

const travelStats = [
  { month: "Jan", trips: 2 }, { month: "Feb", trips: 1 }, { month: "Mar", trips: 3 },
  { month: "Apr", trips: 2 }, { month: "May", trips: 4 }, { month: "Jun", trips: 3 },
];

export default function DashboardClient({ user, trips, feedPosts }: DashboardClientProps) {
  if (!user) return null;

  if (!user.profileComplete) {
    return (
      <div className="mx-auto max-w-4xl p-8">
         <Card><CardHeader><CardTitle>Complete Your Profile</CardTitle><CardDescription>Answer a few questions to get personalized trip suggestions.</CardDescription></CardHeader><div className="p-6 pt-0"><InterestQuiz /></div></Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                    <AvatarImage src={user.image || ''} alt={user.name || ''} />
                    <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.bio || 'Explorer of new horizons.'}</p>
                    <div className="flex items-center gap-6 mt-4 text-sm">
                        <span><strong>{user._count.friends}</strong> friends</span>
                        <span><strong>{user._count.trips}</strong> trips</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/profile/${user.id}`}><Button variant="outline">View Profile</Button></Link>
                    <Link href="/plan-trip"><Button>+ New Trip</Button></Link>
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader><CardTitle>Travel Statistics</CardTitle><CardDescription>Your activity over the past 6 months</CardDescription></CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%"><BarChart data={travelStats}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} /><Bar dataKey="trips" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Upcoming Trips</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {trips.map((trip) => (
                                <Link href={`/trips/${trip.id}`} key={trip.id}>
                                    <div className="flex gap-3 p-3 rounded-lg border hover:shadow-md transition-shadow">
                                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center"><Plane /></div>
                                        <div>
                                            <h4 className="font-medium">Trip to Marrakech</h4>
                                            <p className="text-sm text-muted-foreground">{new Date(trip.travelStartDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Community Feed</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {feedPosts.map(post => (
                                <div key={post.id} className="flex items-start gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={post.author.image || ''} />
                                        <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{post.author.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
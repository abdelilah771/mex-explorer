"use client"

import { useState, useEffect } from "react"
import { User, Trip, Post, Achievement } from '@prisma/client';
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Trophy, Plane, CheckCircle2, Globe, Cake } from "lucide-react"
import EditProfileSheet from "./EditProfileSheet";
import FollowButton from "./FollowButton";
import UserListDialog from "./UserListDialog";
import { UserProfile } from "@/lib/types";

interface UserProfileClientProps {
  user: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

interface ChartData {
  month: string;
  trips: number;
}

export default function UserProfileClient({ user, isOwnProfile, isFollowing }: UserProfileClientProps) {
    const [travelStats, setTravelStats] = useState<ChartData[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                const response = await fetch(`/api/stats/${user.id}`);
                const data = await response.json();
                setTravelStats(data);
            } catch (error) {
                console.error("Failed to fetch travel stats:", error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [user.id]);

    const nextRewardPoints = Math.ceil((user.points + 1) / 500) * 500;
    const pointsPercentage = (user.points / nextRewardPoints) * 100;

    return (
        <div className="min-h-screen bg-muted/40">
            {/* Header Section */}
            <div className="relative h-40 md:h-56 bg-muted">
                {user.coverImage && <Image src={user.coverImage} alt="Cover" layout="fill" objectFit="cover" />}
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="relative -mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
                            <AvatarImage src={user.image || ''} alt={user.name || ''} />
                            <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold truncate">{user.name}</h1>
                            <p className="text-sm text-muted-foreground">{user.bio || 'Explorer of new horizons.'}</p>
                        </div>
                        <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            {isOwnProfile ? (<EditProfileSheet user={user} />) : (<FollowButton targetUserId={user.id} isFollowing={isFollowing} />)}
                        </div>
                    </div>
                </div>
                
                {/* Stats Bar */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <UserListDialog
                        title="Followers"
                        fetchUrl={`/api/users/${user.id}/followers`}
                        triggerText={
                            <Card className="hover:bg-muted cursor-pointer"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{user._count.followedBy}</p><p className="text-sm text-muted-foreground">Followers</p></CardContent></Card>
                        }
                    />
                     <UserListDialog
                        title="Following"
                        fetchUrl={`/api/users/${user.id}/following`}
                        triggerText={
                            <Card className="hover:bg-muted cursor-pointer"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{user._count.following}</p><p className="text-sm text-muted-foreground">Following</p></CardContent></Card>
                        }
                    />
                    <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{user._count.trips}</p><p className="text-sm text-muted-foreground">Trips</p></CardContent></Card>
                </div>

                {/* Main Content */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                         {isOwnProfile && (
                            <Card>
                                <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
                                <CardContent>
                                     {user.verificationStatus === 'VERIFIED' ? (
                                        <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-5 h-5" /><p className="font-semibold">Verified</p></div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Not verified.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Nationality:</span>
                                    <span className="text-muted-foreground">{user.nationality || 'Not set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Cake className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Birthday:</span>
                                    <span className="text-muted-foreground">{user.dob ? new Date(user.dob).toLocaleDateString() : 'Not set'}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Points & Achievements</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-2"><p className="text-sm font-medium">Next Reward</p><p className="text-sm font-bold">{user.points} / {nextRewardPoints}</p></div>
                                <Progress value={pointsPercentage} />
                                <h4 className="font-semibold mt-6 mb-2 text-sm">Achievements</h4>
                                <div className="flex flex-wrap gap-2">
                                    {user.achievements.map(ach => <Badge key={ach.id}>🏆 {ach.name}</Badge>)}
                                    {user.achievements.length === 0 && <p className="text-xs text-muted-foreground">No achievements yet.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content Area (Tabs) */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="activity">
                            <TabsList className="mb-4">
                                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                                <TabsTrigger value="trips">Upcoming Trips</TabsTrigger>
                                <TabsTrigger value="stats">Statistics</TabsTrigger>
                            </TabsList>
                            <TabsContent value="activity">
                                <Card>
                                    <CardHeader><CardTitle>Recent Posts</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        {user.posts.length > 0 ? user.posts.map(post => (
                                            <div key={post.id} className="flex gap-3 text-sm"><p className="text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}:</p><p>{post.content}</p></div>
                                        )) : <p className="text-sm text-muted-foreground">No posts yet.</p>}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="trips">
                                <Card>
                                    <CardHeader><CardTitle>Upcoming Trips</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                         {user.trips.map((trip) => (
                                            <Link href={`/trips/${trip.id}`} key={trip.id}>
                                                <div className="flex gap-3 p-3 rounded-lg border hover:shadow-md transition-shadow">
                                                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center"><Plane /></div>
                                                    <div><h4 className="font-medium">Trip to Marrakech</h4><p className="text-sm text-muted-foreground">{new Date(trip.travelStartDate).toLocaleDateString()}</p></div>
                                                </div>
                                            </Link>
                                        ))}
                                        {user.trips.length === 0 && <p className="text-sm text-muted-foreground">No upcoming trips.</p>}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="stats">
                                <Card>
                                    <CardHeader><CardTitle>Travel Statistics</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="h-[300px] w-full">
                                            {isLoadingStats ? <div className="flex items-center justify-center h-full text-muted-foreground">Loading stats...</div> :
                                            <ResponsiveContainer width="100%" height="100%"><BarChart data={travelStats}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} /><Bar dataKey="trips" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
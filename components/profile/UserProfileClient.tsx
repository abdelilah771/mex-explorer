"use client"

import { useState, useEffect } from "react"
import { User, Trip, Post, Achievement } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { MapPin, Calendar, Settings, Download, Share2, Edit3, Trophy, Plane, Globe, UserPlus, UserCheck, CheckCircle2 } from "lucide-react"
import Image from "next/image";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EditProfileSheet from "./EditProfileSheet";
import FollowButton from "./FollowButton";
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

// Placeholder data for the chart
const travelStats = [
  { month: "Jan", trips: 2 }, { month: "Feb", trips: 1 }, { month: "Mar", trips: 3 },
];

export default function UserProfileClient({ user, isOwnProfile, isFollowing }: UserProfileClientProps) {
    const nextRewardPoints = Math.ceil((user.points + 1) / 500) * 500;
    const pointsPercentage = (user.points / nextRewardPoints) * 100;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Cover Image */}
            <div className="relative h-48 bg-muted rounded-b-lg overflow-hidden">
                {user.coverImage && <Image src={user.coverImage} alt="Cover" layout="fill" objectFit="cover" />}
                <div className="absolute top-4 right-4 flex gap-2">
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Create Portfolio</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                    <Button variant="secondary" size="sm"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="relative -mt-16 mb-8">
                    <Card className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                                <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <p className="text-muted-foreground mb-3">{user.bio || 'Explorer of new horizons.'}</p>
                                <div className="flex justify-center sm:justify-start items-center gap-6 text-sm">
                                    <span><strong>{user._count.followedBy}</strong> followers</span>
                                    <span><strong>{user._count.following}</strong> following</span>
                                    <span><strong>{user._count.trips}</strong> trips</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {isOwnProfile ? (<EditProfileSheet user={user} />) : (<FollowButton targetUserId={user.id} isFollowing={isFollowing} />)}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>Travel Map</CardTitle></CardHeader>
                            <CardContent>
                                <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">[Interactive Map Placeholder]</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Travel Statistics</CardTitle></CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%"><BarChart data={travelStats}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} /><Bar dataKey="trips" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-8">
                        {isOwnProfile && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identity Verification</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.verificationStatus === 'VERIFIED' ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <p className="font-semibold">Verified</p>
                                        </div>
                                    ) : user.verificationStatus === 'PENDING' ? (
                                        <div className="flex items-center gap-2 text-yellow-600">
                                            <p className="font-semibold">Pending Review</p>
                                        </div>
                                    ) : user.verificationStatus === 'REJECTED' ? (
                                        <div className="flex flex-col gap-2">
                                            <p className="font-semibold text-destructive">Verification Rejected</p>
                                            <p className="text-sm text-muted-foreground">Please upload a new document in the edit profile section.</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Upload your ID or Passport to get verified in the "Edit Profile" section.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader><CardTitle>Points & Achievements</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-2"><p className="text-sm font-medium">Next Reward</p><p className="text-sm font-bold">{user.points} / {nextRewardPoints}</p></div>
                                <Progress value={pointsPercentage} />
                                <h4 className="font-semibold mt-6 mb-2 text-sm">Achievements</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge>🏆 First Trip</Badge>
                                    <Badge>🌍 Globetrotter</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between"><Label htmlFor="profile-visibility">Profile is Public</Label><Switch id="profile-visibility" checked={user.isProfilePublic} /></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
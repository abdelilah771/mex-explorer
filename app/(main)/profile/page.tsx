import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from "@/components/ui/progress";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import EditProfileSheet from '@/components/profile/EditProfileSheet';

const prisma = new PrismaClient();

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { trips: true, following: true, followedBy: true } },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const nextRewardPoints = 2000; // Placeholder
  const pointsPercentage = (user.points / nextRewardPoints) * 100;

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* 1. Personal Details & Header */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={user.image || ''} />
            <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex-grow" />
          <div className="flex gap-2">
            <Button variant="outline">Export Portfolio</Button>
            <EditProfileSheet user={user} />
          </div>
        </div>

        {/* 2. Social Stats */}
        <Card>
            <CardContent className="flex justify-around p-4">
              <div className="text-center">
                <p className="text-xl font-bold">{user._count.followedBy}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{user._count.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{user._count.trips}</p>
                <p className="text-xs text-muted-foreground">Trips</p>
              </div>
            </CardContent>
          </Card>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Trip Locations</CardTitle></CardHeader>
              <CardContent>
                <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">[Interactive Map Placeholder]</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Travel Statistics</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48 w-full bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">[Charts/Graphs Placeholder]</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader><CardTitle>Points & Achievements</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Next Reward</p>
                  <p className="text-sm font-bold">{user.points} / {nextRewardPoints}</p>
                </div>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-visibility">Profile is Public</Label>
                  <Switch id="profile-visibility" defaultChecked={user.isProfilePublic} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="trip-sharing">Share Trips Publicly</Label>
                  <Switch id="trip-sharing" defaultChecked={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
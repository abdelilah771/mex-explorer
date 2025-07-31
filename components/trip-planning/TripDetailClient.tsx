'use client';

import { Trip, Suggestion, TripMembership, User } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, FileText, Settings } from 'lucide-react';
import InviteFriendsDialog from './InviteFriendsDialog';
import SuggestionCard from './SuggestionCard';
import UserCard from '@/components/profile/UserCard';
import TripMap from './TripMap';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type FullTrip = Trip & {
  suggestions: Suggestion[];
  members: (TripMembership & { user: User })[];
};

interface TripDetailClientProps {
  trip: FullTrip;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function TripDetailClient({ trip }: TripDetailClientProps) {
  const handleGenerateSuggestions = async () => {
    alert("This will generate suggestions using the recommendation microservice!");
  };

  const owner = trip.members.find(m => m.role === 'OWNER')?.user;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Trip organised by {owner?.name}</p>
          <h1 className="text-4xl font-bold tracking-tight">{trip.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{trip.destination}</span>
          </div>
        </div>

        {/* Map and Members Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <TripMap suggestions={trip.suggestions} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Trip Members ({trip.members.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center -space-x-2">
                    {trip.members.map(member => (
                        <Avatar key={member.userId} className="border-2 border-background">
                            <AvatarImage src={member.user.image || ''} />
                            <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                <InviteFriendsDialog tripId={trip.id} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Itinerary and Details */}
        <Card>
          <Tabs defaultValue="itinerary">
            <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="itinerary"><FileText className="mr-2 h-4 w-4" /> Itinerary</TabsTrigger>
                    <TabsTrigger value="members"><Users className="mr-2 h-4 w-4" /> Members</TabsTrigger>
                    <TabsTrigger value="details"><Settings className="mr-2 h-4 w-4" /> Details</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                <TabsContent value="itinerary" className="mt-4">
                    <div className="space-y-6">
                    {trip.suggestions.length > 0 ? (
                        trip.suggestions.map((suggestion) => (
                        <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">No suggestions have been generated yet.</p>
                            <Button onClick={handleGenerateSuggestions}>Generate AI Suggestions</Button>
                        </div>
                    )}
                    </div>
                </TabsContent>

                <TabsContent value="members" className="mt-4">
                    <div className="space-y-4">
                        {trip.members.map(member => (
                        <UserCard key={member.userId} user={member.user} />
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="details" className="mt-4">
                    <div className="space-y-2 text-sm">
                        <p><strong>Dates:</strong> {new Date(trip.travelStartDate).toLocaleDateString()} - {new Date(trip.travelEndDate).toLocaleDateString()}</p>
                        <p><strong>Budget:</strong> ${trip.budget}</p>
                    </div>
                </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
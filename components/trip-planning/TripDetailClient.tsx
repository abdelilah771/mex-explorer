'use client';

import { Trip, Suggestion, TripMembership, User } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Settings, Trash2, MapPin, Calendar, DollarSign, Sparkles } from 'lucide-react';
import InviteFriendsDialog from './InviteFriendsDialog';
import SuggestionCard from './SuggestionCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TripMap from './TripMap';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const { data: session } = useSession();
  const router = useRouter();
  const owner = trip.members.find(m => m.role === 'OWNER')?.user;
  const isOwner = session?.user?.id === owner?.id;

  const handleGenerateSuggestions = async () => {
    alert("This will generate suggestions using the recommendation microservice!");
  };

  const handleDeleteTrip = async () => {
    const toastId = toast.loading("Deleting trip...");
    try {
        const response = await fetch(`/api/trips/${trip.id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete trip.");
        }
        toast.success("Trip deleted successfully.", { id: toastId });
        router.push('/my-trips');
        router.refresh();
    } catch (error: any) {
        toast.error(error.message, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">{trip.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{trip.destination}</span>
              </div>
            </div>
            {isOwner && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Trip
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this trip and all its data for everyone involved. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteTrip}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content (Itinerary) */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI-Generated Itinerary
                        </CardTitle>
                        <CardDescription>
                            Here are the personalized suggestions for your trip.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {trip.suggestions.length > 0 ? (
                            <div className="space-y-6">
                            {trip.suggestions.map((suggestion) => (
                                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                            ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 rounded-lg border-2 border-dashed">
                                <p className="text-muted-foreground mb-4">No suggestions have been generated yet.</p>
                                <Button onClick={handleGenerateSuggestions}>Generate AI Suggestions</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(trip.travelStartDate).toLocaleDateString()} - {new Date(trip.travelEndDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>Budget: ${trip.budget}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Trip Members ({trip.members.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center -space-x-2 overflow-hidden">
                            {trip.members.map(member => (
                                <Avatar key={member.userId} className="border-2 border-background h-10 w-10">
                                    <AvatarImage src={member.user.image || ''} />
                                    <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        {isOwner && <InviteFriendsDialog tripId={trip.id} />}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
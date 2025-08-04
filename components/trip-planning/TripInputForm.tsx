'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ArrowRight, ArrowLeft, Users, Check, Circle } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { User } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Step Indicator Component
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex justify-center items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold ${currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>1</div>
            <span className="text-sm font-medium">Details</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold ${currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>2</div>
            <span className="text-sm font-medium">Invite</span>
        </div>
    </div>
);

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function TripInputForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [budget, setBudget] = useState('');
  
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (step === 2 && friends.length === 0) {
      const fetchFriends = async () => {
        const response = await fetch('/api/friends/list');
        const data = await response.json();
        setFriends(data);
      };
      fetchFriends();
    }
  }, [step, friends.length]);

  const handleFriendSelect = (friendId: string) => {
    setSelectedFriendIds(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date && isBefore(date, startOfDay(new Date()))) {
      toast.error("The start date cannot be in the past.");
      return;
    }
    setStartDate(date);
    if (endDate && date && date > endDate) {
      setEndDate(undefined);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- THIS IS THE CORRECTED LOGIC ---
    const isGroupTrip = selectedFriendIds.length > 0;
    const endpoint = isGroupTrip ? '/api/group-trips' : '/api/trips';
    const body = {
        name,
        destination,
        travelStartDate: startDate?.toISOString(),
        travelEndDate: endDate?.toISOString(),
        budget,
        friendIds: isGroupTrip ? selectedFriendIds : [], // Only include friendIds for group trips
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create trip.');
      }
      
      const newTrip = await response.json();
      toast.success('Trip created successfully!');
      router.push(`/trips/${newTrip.id}`);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <StepIndicator currentStep={step} />
        {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Trip Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Morocco Adventure 2025" required /></div>
                    <div className="space-y-2"><Label>Destination</Label><Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Marrakech, Morocco" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={handleStartDateSelect} fromDate={new Date()} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => date < (startDate || new Date())} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="budget">Estimated Budget ($)</Label>
                    <Input id="budget" type="number" placeholder="e.g., 1500" value={budget} onChange={(e) => setBudget(e.target.value)} />
                </div>
                <Button type="button" onClick={nextStep} disabled={!name || !destination || !startDate || !endDate} className="w-full">Next Step <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
        )}
        
        {step === 2 && (
             <div className="space-y-6 animate-in fade-in">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> Invite Friends (Optional)</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                        {friends.length > 0 ? friends.map(friend => (
                            <div key={friend.id} onClick={() => handleFriendSelect(friend.id)} className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8"><AvatarImage src={friend.image || ''} /><AvatarFallback>{getInitials(friend.name)}</AvatarFallback></Avatar>
                                    <span className="font-medium">{friend.name}</span>
                                </div>
                                {selectedFriendIds.includes(friend.id) ? <Check className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                            </div>
                        )) : <p className="text-sm text-center text-muted-foreground p-4">You have no friends to invite yet.</p>}
                    </div>
                </div>
                <div className="flex justify-between gap-4">
                    <Button type="button" variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Creating Trip...' : 'Create Trip'}</Button>
                </div>
            </div>
        )}
    </form>
  );
}
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import SuggestionCard from './SuggestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Suggestions {
  proposals: any[];
}

// Step Indicator Component
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex justify-center items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>1</div>
            <span className="text-sm font-medium">Dates</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>2</div>
            <span className="text-sm font-medium">Details</span>
        </div>
    </div>
);


export default function TripInputForm() {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [budget, setBudget] = useState('');
  const [souvenir, setSouvenir] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
        toast.error("Please select both a start and end date.");
        return;
    }
    setIsLoading(true);
    setSuggestions(null);

    try {
      const tripResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelStartDate: startDate.toISOString(),
          travelEndDate: endDate.toISOString(),
          budget: parseFloat(budget),
          souvenirType: souvenir,
        }),
      });

      if (!tripResponse.ok) throw new Error('Failed to save trip.');
      const createdTrip = await tripResponse.json();
      const toastId = toast.loading('Trip saved! Generating AI suggestions...');
      
      const suggestionsResponse = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: createdTrip.id }),
      });

      if (!suggestionsResponse.ok) throw new Error('Failed to generate suggestions.');
      
      toast.success('Suggestions generated!', { id: toastId });
      const suggestionsData = await suggestionsResponse.json();
      setSuggestions(suggestionsData);

    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (suggestions) {
    return (
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold">Here are your personalized trip proposals!</h2>
        {suggestions.proposals.map((proposal, index) => (
          <SuggestionCard key={index} proposal={proposal} />
        ))}
        <Button onClick={() => { setSuggestions(null); setStep(1); }} variant="secondary" className="w-full">
          Plan Another Trip
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <StepIndicator currentStep={step} />
        {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Trip Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>Trip End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => date < (startDate || new Date())} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button onClick={nextStep} disabled={!startDate || !endDate} className="w-full">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )}
        
        {step === 2 && (
             <div className="space-y-4 animate-in fade-in">
                <div className="space-y-2">
                    <Label htmlFor="budget">Estimated Budget ($)</Label>
                    <Input id="budget" type="number" placeholder="e.g., 1500" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="souvenir">Type of Souvenir? (Optional)</Label>
                    <Input id="souvenir" type="text" placeholder="e.g., Leather goods, Spices" value={souvenir} onChange={(e) => setSouvenir(e.target.value)} />
                </div>
                <div className="flex justify-between gap-4">
                    <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Generating...' : 'Generate AI Suggestions'}
                    </Button>
                </div>
            </div>
        )}
    </form>
  );
}
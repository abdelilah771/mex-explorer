'use client';

import React from 'react';
import { Suggestion } from '@prisma/client';

// The props now accept either a `suggestion` or a `proposal`
interface SuggestionCardProps {
  suggestion?: Suggestion;
  proposal?: any;
}

export default function SuggestionCard({ suggestion, proposal }: SuggestionCardProps) {
  // Use the data from whichever prop is provided
  const data = suggestion || proposal;
  
  if (!data) return null;

  // Ensure itinerary is an array, whether from JSON or direct object
  const itinerary = Array.isArray(data.itinerary) ? data.itinerary : [];

  return (
    <div className="rounded-xl border bg-gray-50 p-6 dark:bg-gray-800/50">
      <h3 className="text-xl font-bold">{data.title}</h3>
      <p className="my-3 text-muted-foreground">{data.summary}</p>
      <div className="space-y-4">
        {itinerary.map((day: any) => (
          <div key={day.day} className="border-t pt-4">
            <h4 className="font-semibold">Day {day.day}: {day.theme}</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li><strong>Morning:</strong> {day.morning}</li>
              <li><strong>Afternoon:</strong> {day.afternoon}</li>
              <li><strong>Evening:</strong> {day.evening}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
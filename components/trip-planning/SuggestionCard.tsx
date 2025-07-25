'use client';

import React from 'react';
import { Suggestion } from '@prisma/client'; // Import the type from Prisma

// The props now expect a 'suggestion' object of type Suggestion
interface SuggestionCardProps {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  // Cast the itinerary from JsonValue to a specific type
  const itinerary = suggestion.itinerary as Array<{
    day: number;
    theme: string;
    morning: string;
    afternoon: string;
    evening: string;
  }>;

  return (
    <div className="rounded-xl border bg-gray-50 p-6">
      <h3 className="text-xl font-bold text-gray-900">{suggestion.title}</h3>
      <p className="my-3 text-gray-600">{suggestion.summary}</p>
      <div className="space-y-4">
        {itinerary.map((day) => (
          <div key={day.day} className="border-t pt-4">
            <h4 className="font-semibold text-gray-800">Day {day.day}: {day.theme}</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
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
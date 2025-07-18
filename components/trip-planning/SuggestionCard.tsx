'use client';

import React from 'react';

// Define a type for a single itinerary item
interface ItineraryItem {
  day: number;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
}

// Define a type for a single proposal
interface Proposal {
  title: string;
  summary: string;
  itinerary: ItineraryItem[];
}

interface SuggestionCardProps {
  proposal: Proposal;
}

export default function SuggestionCard({ proposal }: SuggestionCardProps) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{proposal.title}</h3>
      <p style={{ margin: '10px 0', color: '#555' }}>{proposal.summary}</p>
      <div>
        {proposal.itinerary.map((day) => (
          <div key={day.day} style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <h4 style={{ fontWeight: 'bold' }}>Day {day.day}: {day.theme}</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '5px' }}>
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
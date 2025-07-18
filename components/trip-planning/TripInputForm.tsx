'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import SuggestionCard from './SuggestionCard';

interface Suggestions {
  proposals: any[];
}

export default function TripInputForm() {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [souvenir, setSouvenir] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    // If the new start date is after the current end date, clear the end date
    if (endDate && newStartDate > endDate) {
      setEndDate('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuggestions(null);

    try {
      const tripResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelStartDate: startDate,
          travelEndDate: endDate,
          budget: parseFloat(budget),
          souvenirType: souvenir,
        }),
      });

      if (!tripResponse.ok) throw new Error('Failed to save trip.');
      const createdTrip = await tripResponse.json();
      toast.success('Trip saved! Generating AI suggestions...');
      
      const suggestionsResponse = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: createdTrip.id }),
      });

      if (!suggestionsResponse.ok) throw new Error('Failed to generate suggestions.');
      const suggestionsData = await suggestionsResponse.json();
      setSuggestions(suggestionsData);

    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (suggestions) {
    // ... (display suggestions code remains the same)
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Here are your personalized trip proposals!</h2>
        {suggestions.proposals.map((proposal, index) => (
          <SuggestionCard key={index} proposal={proposal} />
        ))}
        <button onClick={() => setSuggestions(null)} style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
          Plan Another Trip
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Trip Start Date</label>
        <input type="date" value={startDate} onChange={handleStartDateChange} required style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Trip End Date</label>
        {/* The 'min' attribute prevents selecting an earlier date */}
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={startDate} style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Estimated Budget ($)</label>
        <input type="number" placeholder="e.g., 1500" value={budget} onChange={(e) => setBudget(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Type of Souvenir? (Optional)</label>
        <input type="text" placeholder="e.g., Leather goods, Spices" value={souvenir} onChange={(e) => setSouvenir(e.target.value)} style={{ width: '100%', padding: '8px' }} />
      </div>
      <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        {isLoading ? 'Generating...' : 'Generate AI Suggestions'}
      </button>
    </form>
  );
}
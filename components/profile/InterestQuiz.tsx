'use client';

import React, { useState } from 'react';
import { TravelStyle, ActivityLevel } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const allInterests = ["History", "Food", "Shopping", "Art", "Nature", "Nightlife", "Sports"];

export default function InterestQuiz() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInterestChange = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const profileData = {
      interests: selectedInterests,
      travelStyle,
      activityLevel,
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success('Profile saved successfully!');
        router.refresh(); // Refresh the page to show the updated dashboard
      } else {
        toast.error('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        {/* ... The rest of your form questions ... */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Complete Your Profile</h2>
      
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>What are your interests?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {allInterests.map((interest) => (
              <label key={interest} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '20px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedInterests.includes(interest)} onChange={() => handleInterestChange(interest)} />
                {interest}
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>What is your preferred travel style?</label>
          <div style={{ display: 'flex', gap: '15px' }}>
            {Object.values(TravelStyle).map(style => (<label key={style}><input type="radio" name="travelStyle" value={style} onChange={() => setTravelStyle(style)} /> {style}</label>))}
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Desired activity level?</label>
          <div style={{ display: 'flex', gap: '15px' }}>
            {Object.values(ActivityLevel).map(level => (<label key={level}><input type="radio" name="activityLevel" value={level} onChange={() => setActivityLevel(level)} /> {level}</label>))}
          </div>
        </div>

        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
    </form>
  );
}
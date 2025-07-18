'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
}

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export default function RewardCard({ reward, userPoints }: RewardCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const canClaim = userPoints >= reward.pointsRequired;

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/rewards/${reward.id}/claim`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Reward claimed successfully!');
        router.refresh(); // Refresh the page to update points
      } else {
        toast.error(data.message || 'Failed to claim reward.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ border: `1px solid ${canClaim ? '#28a745' : '#ddd'}`, borderRadius: '8px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{reward.name}</h3>
        <p style={{ color: '#555', margin: '5px 0' }}>{reward.description}</p>
        <p style={{ fontWeight: 'bold', color: '#0070f3' }}>{reward.pointsRequired} Points</p>
      </div>
      <button onClick={handleClaim} disabled={!canClaim || isLoading} style={{ padding: '10px 20px', backgroundColor: canClaim ? '#0070f3' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', cursor: (canClaim && !isLoading) ? 'pointer' : 'not-allowed' }}>
        {isLoading ? 'Claiming...' : 'Claim'}
      </button>
    </div>
  );
}
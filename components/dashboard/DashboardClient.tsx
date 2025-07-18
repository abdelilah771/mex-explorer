'use client';

import Link from 'next/link';
import InterestQuiz from '@/components/profile/InterestQuiz';
import { User } from '@prisma/client';

interface DashboardClientProps {
  user: User | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Welcome to your Dashboard, {user?.name}!</h1>
      
      {user?.profileComplete ? (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link href="/plan-trip">
            <button style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              + Plan a New Trip
            </button>
          </Link>
          <Link href="/travel-circle">
            <button style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Go to Travel Circle
            </button>
          </Link>
          <Link href="/rewards">
            <button style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              View Rewards ({user.points} Points)
            </button>
          </Link>
        </div>
      ) : (
        <InterestQuiz />
      )}
    </div>
  );
}
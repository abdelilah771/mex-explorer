import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import RewardCard from '@/components/rewards/RewardCard';

const prisma = new PrismaClient();

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetches user and rewards data directly
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  const rewards = await prisma.reward.findMany({
    orderBy: { pointsRequired: 'asc' },
  });

  const userPoints = user?.points || 0;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem' }}>Rewards</h1>
        <p style={{ fontSize: '1.2rem', color: '#555' }}>You have <strong style={{ color: '#0070f3' }}>{userPoints}</strong> points.</p>
      </div>
      <div>
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} userPoints={userPoints} />
        ))}
      </div>
    </div>
  );
}
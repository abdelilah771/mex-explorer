import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import DashboardClient from '@/components/dashboard/DashboardClient'; // Import the new component

const prisma = new PrismaClient();

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userData = await getUserData(session.user.id);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <DashboardClient user={userData} />
    </div>
  );
}
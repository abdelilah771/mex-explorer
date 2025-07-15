// app/(main)/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Protect the route on the server
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>Hello, {session.user?.name}</p>
      <p>Your email is: {session.user?.email}</p>
    </div>
  );
}
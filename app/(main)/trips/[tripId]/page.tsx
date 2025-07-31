import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import TripDetailClient from '@/components/trip-planning/TripDetailClient';

interface PageProps {
  params: {
    tripId: string;
  };
}

export default async function TripDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const trip = await prisma.trip.findFirst({
    where: { 
      id: params.tripId,
      members: { some: { userId: session.user.id } },
    },
    include: {
      suggestions: true,
      members: {
        include: {
          user: true
        }
      }
    },
  });

  if (!trip) {
    return <p className="text-center mt-10">Trip not found or you do not have permission to view it.</p>;
  }

  return (
    <TripDetailClient trip={trip} />
  );
}
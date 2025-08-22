import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  try {
    // 1. Trouver d'abord l'adhésion pour vérifier si l'utilisateur est le propriétaire
    const membership = await prisma.tripMembership.findFirst({
      where: {
        tripId: params.tripId,
        userId: currentUserId,
      },
    });

    if (!membership) {
      return NextResponse.json({ message: "Vous n'êtes pas membre de ce voyage." }, { status: 403 });
    }

    // 2. Seul le propriétaire peut supprimer le voyage
    if (membership.role !== 'OWNER') {
      return NextResponse.json({ message: 'Seul le propriétaire peut supprimer ce voyage.' }, { status: 403 });
    }

    // 3. Si tout est correct, supprimer le voyage
    // Grâce à `onDelete: Cascade` dans notre schéma, toutes les adhésions et suggestions seront aussi supprimées.
    await prisma.trip.delete({
      where: { id: params.tripId },
    });

    return NextResponse.json({ message: 'Voyage supprimé avec succès.' });
  } catch (error) {
    console.error('TRIP_DELETE_ERROR', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}
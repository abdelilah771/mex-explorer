import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Create a VerificationSession on Stripe's servers
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_id: session.user.id, // Pass our user ID to link them in the webhook
      },
    });

    // Send the secret back to the client
    return NextResponse.json({
      clientSecret: verificationSession.client_secret,
    });
  } catch (error) {
    console.error('STRIPE_IDENTITY_ERROR', error);
    return NextResponse.json({ message: 'Error creating verification session' }, { status: 500 });
  }
}
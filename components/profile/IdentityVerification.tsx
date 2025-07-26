'use client';

import { Button } from "@/components/ui/button";
import { loadStripe } from '@stripe/stripe-js';
import { useState } from "react";
import { toast } from "sonner";

// Initialize Stripe.js with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function IdentityVerification() {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Initializing verification...");

    try {
      // 1. Call our backend to create a verification session and get the client secret
      const response = await fetch('/api/identity', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initialize session.');
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Invalid client secret received.');
      }

      // 2. Open the Stripe verification modal
      toast.dismiss(toastId);
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load.');
      }

      const { error } = await stripe.verifyIdentity(clientSecret);

      if (error) {
        toast.error(error.message || "An error occurred with Stripe.");
      }
      
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleVerification} disabled={isLoading}>
      {isLoading ? "Initializing..." : "Verify Identity"}
    </Button>
  );
}
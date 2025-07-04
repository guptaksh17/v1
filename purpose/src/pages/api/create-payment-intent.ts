import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil', // Use the latest API version
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'inr' } = req.body;

    // Validate the amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Add any additional metadata here
        integration_check: 'accept_a_payment',
      },
    });

    // Send publishable key and PaymentIntent client_secret to client
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error creating payment intent:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}

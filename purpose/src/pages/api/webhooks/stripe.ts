import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

// Stripe requires the raw body to verify the webhook signature
export const config = {
  api: {
    bodyParser: false,
  },
};

// Webhook secret from Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

async function handleStripeWebhook(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return res.status(500).json({ error: 'Error processing webhook' });
  }
}

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('PaymentIntent was successful!', paymentIntent.id);
  
  // Extract order details from paymentIntent metadata
  const metadata = paymentIntent.metadata || {};
  const product_id = metadata.product_id;
  const user_id = metadata.user_id || null; // optional
  const quantity = parseInt(metadata.quantity, 10) || 1;
  const price = parseFloat(metadata.price) || 0;
  const product_category = metadata.product_category || null;
  const product_name = metadata.product_name || null;

  // Insert order into Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        product_id,
        user_id,
        quantity,
        price,
        order_timestamp: new Date().toISOString(),
        product_category,
        product_name,
      },
    ]);
  if (error) {
    console.error('Error inserting order into Supabase:', error);
  } else {
    console.log('Order inserted into Supabase:', data);
  }
  
  // Here you would typically:
  // 1. Update your database to mark the order as paid
  // 2. Send a confirmation email to the customer
  // 3. Update inventory, etc.
  
  // Example:
  // await updateOrderStatus(paymentIntent.id, 'paid');
  // await sendConfirmationEmail(paymentIntent.metadata.customerEmail);
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('PaymentIntent failed!', paymentIntent.id);
  
  // Here you would typically:
  // 1. Update your database to reflect the failed payment
  // 2. Notify the customer
  
  // Example:
  // await updateOrderStatus(paymentIntent.id, 'payment_failed');
  // await sendPaymentFailedEmail(paymentIntent.metadata.customerEmail);
}

// Handle refund
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge was refunded!', charge.id);
  
  // Here you would typically:
  // 1. Update your database to reflect the refund
  // 2. Restock items if needed
  
  // Example:
  // await updateOrderStatus(charge.payment_intent as string, 'refunded');
  // await restockItems(charge.metadata.orderId);
}

export default handleStripeWebhook;

const express = require('express');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({
  origin: 'http://localhost:8081', // or 'http://localhost:8080' if that's your Vite port
  credentials: true
}));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server-side inserts
);

// Webhook route FIRST, before express.json()
app.post('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Extract order details from paymentIntent.metadata
    const metadata = paymentIntent.metadata || {};
    console.log('PaymentIntent metadata:', metadata);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            product_id: metadata.product_id,
            user_id: metadata.user_id || null,
            quantity: parseInt(metadata.quantity, 10) || 1,
            price: parseFloat(metadata.price) || 0,
            order_timestamp: new Date().toISOString(),
            product_category: metadata.product_category || null,
            product_name: metadata.product_name || null,
          },
        ])
        .select();
      if (error) {
        console.error('Error inserting order into Supabase:', error);
      } else {
        console.log('Order inserted into Supabase:', data);
        // Decrement product stock directly
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', metadata.product_id)
          .single();
        if (!fetchError && product) {
          const newStock = product.stock - (parseInt(metadata.quantity, 10) || 1);
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', metadata.product_id);
          if (stockError) {
            console.error('Error updating product stock:', stockError);
          } else {
            console.log('Product stock updated for product_id:', metadata.product_id);
          }
        } else if (fetchError) {
          console.error('Error fetching product stock:', fetchError);
        }
      }
    } catch (err) {
      console.error('Supabase insert error:', err);
    }
    console.log('PaymentIntent succeeded:', paymentIntent.id);
  }

  res.json({ received: true });
});

// All other routes AFTER
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', ...metadata } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001')); 
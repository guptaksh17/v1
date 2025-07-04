import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { useUser } from '@supabase/auth-helpers-react';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart, isProcessing, setIsProcessing } = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const user = useUser();
  const userId = user ? user.id : null;
  
  // Calculate order values
  const subtotal = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
    [items]
  );
  
  const tax = useMemo(() => subtotal * 0.18, [subtotal]);
  const shipping = useMemo(() => (subtotal > 0 ? 50 : 0), [subtotal]);
  const orderTotal = useMemo(() => subtotal + tax + shipping, [subtotal, tax, shipping]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    
    // Basic form validation
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!email || !name || !address || !city || !postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // Create order data with payment info
      const orderData = {
        paymentIntentId: paymentIntent.id,
        customer: { email, name },
        shipping: { address, city, postalCode, country },
        items,
        total: orderTotal,
        subtotal,
        tax,
        shippingCost: shipping,
        status: 'paid' as const
      };
      
      console.log('Order data with payment:', orderData);
      
      // Here you would typically send this data to your backend
      // For now, we'll just show success and clear the cart
      toast.success('Payment successful! Order placed.');
      clearCart();
      
      // Redirect to order confirmation
      navigate('/order-confirmation', {
        state: {
          orderId: `ORDER-${Date.now()}`,
          ...orderData
        }
      });

    } catch (error) {
      console.error('Order processing error:', error);
      toast.error('Order processing failed. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="your@email.com"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="John Doe"
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="123 Main St"
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input 
                      id="postalCode" 
                      value={postalCode} 
                      onChange={(e) => setPostalCode(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    required 
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="max-w-md mx-auto w-full">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover rounded" 
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div>₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mt-6 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6">
                <Elements stripe={stripePromise} options={{
                  mode: 'payment',
                  amount: Math.round(orderTotal * 100),
                  currency: 'inr',
                  appearance: {
                    theme: 'stripe',
                  },
                }}>
                  <StripeCheckoutForm 
                    amount={orderTotal}
                    onSuccess={handlePaymentSuccess}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    items={items}
                    userId={userId}
                  />
                </Elements>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 
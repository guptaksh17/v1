import React, { useState, useMemo, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { Gift, CheckCircle } from 'lucide-react';

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
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [appliedRewards, setAppliedRewards] = useState<any[]>([]);
  const user = useUser();
  const userId = user ? user.id : null;
  
  // Fetch user's redeemed rewards
  useEffect(() => {
    const fetchUserRewards = async () => {
      if (!userId) return;
      
      try {
        const { data: redeemedRewards, error } = await supabase
          .from('reward_redemptions')
          .select('reward_id, created_at')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching rewards:', error);
          return;
        }

        // Map reward IDs to reward details
        const rewardDetails = redeemedRewards?.map(redemption => {
          switch (redemption.reward_id) {
            case 'free-shipping':
              return { id: 'free-shipping', name: 'Free Shipping', type: 'shipping', discount: 50 };
            case 'discount-10':
              return { id: 'discount-10', name: '10% Discount', type: 'percentage', discount: 10 };
            case 'discount-20':
              return { id: 'discount-20', name: '20% Discount', type: 'percentage', discount: 20 };
            default:
              return null;
          }
        }).filter(Boolean);

        setAvailableRewards(rewardDetails || []);
      } catch (error) {
        console.error('Error fetching user rewards:', error);
      }
    };

    fetchUserRewards();
  }, [userId]);

  // Calculate order values with rewards
  const subtotal = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
    [items]
  );
  
  const tax = useMemo(() => subtotal * 0.18, [subtotal]);
  const baseShipping = useMemo(() => (subtotal > 0 ? 50 : 0), [subtotal]);

  // Apply rewards
  const appliedRewardsData = useMemo(() => {
    const rewards = [];
    let shippingDiscount = 0;
    let percentageDiscount = 0;

    // Check for free shipping
    const freeShippingReward = availableRewards.find(r => r.id === 'free-shipping');
    if (freeShippingReward && appliedRewards.includes('free-shipping')) {
      shippingDiscount = baseShipping;
      rewards.push({ ...freeShippingReward, amount: shippingDiscount });
    }

    // Check for percentage discounts (apply highest one)
    const percentageRewards = availableRewards.filter(r => r.type === 'percentage' && appliedRewards.includes(r.id));
    if (percentageRewards.length > 0) {
      const highestDiscount = Math.max(...percentageRewards.map(r => r.discount));
      const selectedReward = percentageRewards.find(r => r.discount === highestDiscount);
      percentageDiscount = (subtotal * highestDiscount) / 100;
      rewards.push({ ...selectedReward, amount: percentageDiscount });
    }

    return { rewards, shippingDiscount, percentageDiscount };
  }, [availableRewards, appliedRewards, subtotal, baseShipping]);

  const finalShipping = Math.max(0, baseShipping - appliedRewardsData.shippingDiscount);
  const finalSubtotal = subtotal - appliedRewardsData.percentageDiscount;
  const finalTax = finalSubtotal * 0.18;
  const orderTotal = finalSubtotal + finalTax + finalShipping;

  const handleApplyReward = (rewardId: string) => {
    setAppliedRewards(prev => [...prev, rewardId]);
    toast.success('Reward applied successfully!');
  };

  const handleRemoveReward = (rewardId: string) => {
    setAppliedRewards(prev => prev.filter(id => id !== rewardId));
    toast.success('Reward removed');
  };

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
        finalSubtotal,
        tax,
        finalTax,
        shippingCost: finalShipping,
        appliedRewards: appliedRewardsData.rewards,
        rewardSavings: appliedRewardsData.rewards.reduce((sum, r) => sum + r.amount, 0),
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contact & Shipping */}
          <div className="space-y-6">
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

            {/* Rewards Section */}
            {availableRewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    Available Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableRewards.map((reward) => {
                      const isApplied = appliedRewards.includes(reward.id);
                      return (
                        <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {isApplied ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Gift className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium">{reward.name}</div>
                              <div className="text-sm text-gray-500">
                                {reward.type === 'shipping' ? 'Free shipping on this order' : `${reward.discount}% off your order`}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={isApplied ? "outline" : "default"}
                            size="sm"
                            onClick={() => isApplied ? handleRemoveReward(reward.id) : handleApplyReward(reward.id)}
                          >
                            {isApplied ? 'Remove' : 'Apply'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary & Payment */}
          <div className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Order Summary & Payment</CardTitle>
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
                  
                  {/* Applied Rewards */}
                  {appliedRewardsData.rewards.length > 0 && (
                    <>
                      {appliedRewardsData.rewards.map((reward) => (
                        <div key={reward.id} className="flex justify-between text-green-600">
                          <span className="flex items-center gap-1">
                            <Gift className="w-4 h-4" />
                            {reward.name}
                          </span>
                          <span>-₹{reward.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>₹{finalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{finalShipping > 0 ? `₹${finalShipping.toFixed(2)}` : 'Free'}</span>
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
    </div>
  );
};

export default Checkout; 
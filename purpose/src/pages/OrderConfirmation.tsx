import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Clock, MapPin, Mail, CreditCard, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { addPoints, calculatePoints } from '@/lib/gamification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  orderId: string;
  paymentIntentId: string;
  customer: {
    name: string;
    email: string;
  };
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: string;
  date: string;
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state as OrderData | undefined;

  useEffect(() => {
    // If no order data is available, redirect to home
    if (!orderData) {
      navigate('/');
      return;
    }

    // Award points for the purchase
    const awardPoints = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const points = calculatePoints.purchase(orderData.total, true); // Assuming all products are eco-friendly
          await addPoints(user.id, points, `Purchase: Order #${orderData.orderId}`);
          toast.success(`🎉 You earned ${points} points for your purchase!`);
        }
      } catch (error) {
        console.error('Error awarding points:', error);
      }
    };

    awardPoints();
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase, {orderData.customer.name}!
          </p>
          <p className="text-gray-500 mt-2">
            Your order #{orderData.orderId} has been placed successfully.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(orderData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatCurrency(orderData.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatCurrency(orderData.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-4 border-t border-gray-200 text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(orderData.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">Order Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Placed</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(orderData.date || new Date().toISOString())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="capitalize">{orderData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span>Credit Card</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <address className="not-italic">
                  <div className="space-y-1">
                    <p className="font-medium">{orderData.customer.name}</p>
                    <p>{orderData.shipping.address}</p>
                    <p>
                      {orderData.shipping.city}, {orderData.shipping.postalCode}
                    </p>
                    <p>{orderData.shipping.country}</p>
                  </div>
                </address>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{orderData.customer.name}</p>
                  <p className="text-gray-600">{orderData.customer.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Payment Method</p>
                  <p className="text-gray-600">Credit / Debit Card</p>
                  <p className="text-sm text-gray-500 mt-2">
                    A confirmation email has been sent to {orderData.customer.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Section */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg text-green-800">Rewards Earned!</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-green-700">
                    +{Math.floor(orderData.total / 100) * 2} Points
                  </div>
                  <p className="text-sm text-green-600">
                    You earned points for your sustainable purchase!
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => navigate('/rewards')}
                  >
                    View Rewards Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button
                className="w-full bg-[#0071CE] hover:bg-blue-700"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

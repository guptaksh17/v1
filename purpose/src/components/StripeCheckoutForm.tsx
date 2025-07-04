import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CreditCard } from 'lucide-react';

// Add proper type for payment intent response
interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey?: string;
  error?: {
    message: string;
  };
}

interface StripeCheckoutFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  items: any[];
  userId: string;
}

export const StripeCheckoutForm = ({
  amount,
  onSuccess,
  isProcessing,
  setIsProcessing,
  items,
  userId
}: StripeCheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please try again.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      // For now, use the first item in the cart for metadata
      const item = items && items.length > 0 ? items[0] : {};
      const response = await fetch('http://localhost:3001/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          // Stripe expects amount in the smallest currency unit (e.g., paise for INR, cents for USD)
          amount: Math.round(amount * 100), // e.g., ₹10.00 becomes 1000 paise
          currency: 'inr',
          product_id: item.id,
          user_id: userId, // set this if available
          quantity: item.quantity,
          price: item.price,
          product_category: item.category,
          product_name: item.name
        }),
      });
      const responseData = await response.json() as PaymentIntentResponse;
      if (!response.ok) {
        console.error('Payment intent error:', responseData);
        throw new Error(responseData.error?.message || 'Failed to process payment');
      }
      const { clientSecret } = responseData;
      if (!clientSecret) {
        throw new Error('Unable to initialize payment');
      }
      // 2. Get the card number element
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('Card number element not found');
      }
      // 3. Confirm the payment with the card details
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          // billing_details can be added here if needed
        },
      });
      if (stripeError) {
        console.error('Stripe error:', stripeError);
        throw new Error(stripeError.message || 'Payment failed');
      }
      // 4. Handle successful payment
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Payment error:', err);
      setError(errorMessage);
      toast.error(`Payment failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-lg p-6 bg-gray-50 shadow-sm flex flex-col gap-2 w-full max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          <span className="font-semibold text-lg">Card Details</span>
        </div>
        <div className="bg-white rounded-md px-3 py-2 border border-gray-200 focus-within:border-blue-500 transition-colors min-w-[320px] w-full" style={{ minWidth: 320 }}>
          <label className="block text-sm text-gray-600 mb-1">Card Number</label>
          <CardNumberElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1a1f36',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#e53e3e',
                  iconColor: '#e53e3e',
                },
              },
            }}
            className="mb-3"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Expiry</label>
              <CardExpiryElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1a1f36',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#e53e3e',
                      iconColor: '#e53e3e',
                    },
                  },
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">CVC</label>
              <CardCvcElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1a1f36',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#e53e3e',
                      iconColor: '#e53e3e',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400 flex items-center">
          <img src="https://stripe.com/img/v3/home/twitter.png" alt="Stripe" className="w-4 h-4 mr-1" />
          Powered by Stripe
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-[#0071CE] hover:bg-blue-700 mt-2"
      >
        {isProcessing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

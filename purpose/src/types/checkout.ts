export interface CheckoutFormData {
  // Customer Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Shipping Address
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Payment Information (for demo purposes - in production, use Stripe Elements or similar)
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
  
  // Additional Information
  notes?: string;
  
  // Order Information
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  error?: string;
  redirectUrl?: string;
}

// For demonstration purposes - in a real app, this would be handled by Stripe or another payment processor
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_action';
  client_secret?: string;
}

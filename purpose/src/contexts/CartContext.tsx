
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { CheckoutResponse } from '@/types/checkout';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  processCheckout: () => Promise<CheckoutResponse>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'retail_purpose_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === newItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const processCheckout = async (): Promise<CheckoutResponse> => {
    if (items.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }

    setIsProcessing(true);
    
    try {
      // Get the auth token from localStorage if it exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : null;
      
      // Mock API call - in a real app, this would be a real API endpoint
      console.log('Making checkout request with items:', items);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      const mockResponse = {
        success: true,
        orderId: `ORDER-${Date.now()}`,
        message: 'Order placed successfully',
        items,
        total: calculateTotal(),
        timestamp: new Date().toISOString()
      };
      
      console.log('Checkout successful:', mockResponse);
      
      // Clear cart on successful checkout
      clearCart();
      
      // Return the mock response
      return mockResponse;
      
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during checkout';
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        orderId: null
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      total: calculateTotal(),
      isProcessing,
      setIsProcessing,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      processCheckout,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

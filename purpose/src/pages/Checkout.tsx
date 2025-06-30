import React from 'react';
import Header from '../components/Header';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-12">Your cart is empty.</div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">${item.price} x {item.quantity}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span>{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => removeFromCart(item.id)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex justify-between w-full text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-[#0071CE] hover:bg-blue-700" disabled={items.length === 0}>
              Pay with Stripe
            </Button>
            <Button variant="outline" className="w-full" onClick={clearCart} disabled={items.length === 0}>
              Clear Cart
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Checkout; 
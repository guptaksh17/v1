import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import MyImpact from "./pages/MyImpact";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
import AdminForecast from "./pages/AdminForecast";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import React from "react";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Rewards from "./pages/Rewards";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/my-impact" element={<MyImpact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/forecast" element={<AdminForecast />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;

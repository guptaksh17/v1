import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, LogOut, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from './CartDrawer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useUserRole } from '@/hooks/useUserRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { isAdmin, isLoading } = useUserRole(user);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-[#0071CE] hover:text-blue-700 transition-colors">
              Retail with Purpose
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0071CE] focus:border-transparent transition-all duration-200"
                placeholder="Search sustainable products..."
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-[#0071CE]' : 'text-gray-700 hover:text-[#0071CE]'
              }`}
            >
              Home
            </Link>
            {/* Only show these links if not admin */}
            {(!isAdmin && !isLoading) && <>
              <Link 
                to="/shop" 
                className={`font-medium transition-colors ${
                  isActive('/shop') ? 'text-[#0071CE]' : 'text-gray-700 hover:text-[#0071CE]'
                }`}
              >
                Shop
              </Link>
              <Link 
                to="/my-impact" 
                className={`font-medium transition-colors ${
                  isActive('/my-impact') ? 'text-[#0071CE]' : 'text-gray-700 hover:text-[#0071CE]'
                }`}
              >
                My Impact
              </Link>
              {user && (
                <Link 
                  to="/rewards" 
                  className={`font-medium transition-colors flex items-center gap-1 ${
                    isActive('/rewards') ? 'text-[#0071CE]' : 'text-gray-700 hover:text-[#0071CE]'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  Rewards
                </Link>
              )}
            </>}
            {user && isAdmin && !isLoading && (
              <Link 
                to="/admin" 
                className={`font-medium transition-colors ${
                  isActive('/admin') ? 'text-[#0071CE]' : 'text-gray-700 hover:text-[#0071CE]'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Auth & Cart Icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-gray-600 hover:text-[#0071CE] transition-colors">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
                  <DropdownMenuItem className="text-gray-700">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-gray-600 hover:text-[#0071CE] transition-colors">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="w-full">
                      Register
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="w-full">
                      Login
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Remove Globe icon button */}
            {/* <button className="p-2 text-gray-600 hover:text-[#0071CE] transition-colors">
              <Globe className="h-5 w-5" />
            </button> */}
            {/* Only show cart if not admin */}
            {(!isAdmin && !isLoading) && (
              <CartDrawer>
                <button className="p-2 text-gray-600 hover:text-[#0071CE] transition-colors relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#8BC34A] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </CartDrawer>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

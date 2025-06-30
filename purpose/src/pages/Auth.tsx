
import React, { useState } from 'react';
import { User, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(loginEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Attempting login with email:', loginEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.toLowerCase().trim(),
        password: loginPassword,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
        });

        // Redirect based on login type
        if (loginType === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!isValidEmail(registerEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "You must accept the terms and conditions to register.",
        variant: "destructive",
      });
      return;
    }

    if (!fullName.trim()) {
      toast({
        title: "Full Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!dateOfBirth) {
      toast({
        title: "Date of Birth Required",
        description: "Please enter your date of birth.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Attempting registration with email:', registerEmail);

    try {
      const cleanEmail = registerEmail.toLowerCase().trim();
      console.log('Clean email for registration:', cleanEmail);
      
      // Register with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            date_of_birth: dateOfBirth,
          }
        }
      });

      console.log('Registration response:', { data, error });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      // Check if user was created and auto-confirmed
      if (data.user) {
        console.log('Registration successful for user:', data.user.id);
        
        // If user is already confirmed (email confirmation disabled), redirect immediately
        if (data.user.email_confirmed_at || data.session) {
          toast({
            title: "Registration Successful!",
            description: "Welcome! You have been logged in automatically.",
          });
          
          // Redirect to home page
          window.location.href = '/';
        } else {
          // If email confirmation is still required
          toast({
            title: "Registration Successful!",
            description: "Please check your email to verify your account.",
          });
        }

        // Reset form
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        setFullName('');
        setDateOfBirth('');
        setTermsAccepted(false);
      }

    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center mb-6 text-[#0071CE] hover:text-blue-700">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          {authMode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        
        <div className="flex justify-center space-x-4 mb-6">
          <Button
            variant={authMode === 'login' ? 'default' : 'outline'}
            onClick={() => setAuthMode('login')}
            className={authMode === 'login' ? 'bg-[#0071CE] hover:bg-blue-700' : ''}
          >
            Login
          </Button>
          <Button
            variant={authMode === 'register' ? 'default' : 'outline'}
            onClick={() => setAuthMode('register')}
            className={authMode === 'register' ? 'bg-[#8BC34A] hover:bg-green-500' : ''}
          >
            Register
          </Button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {authMode === 'login' 
                ? 'Choose your account type and enter your credentials' 
                : 'Sign up for a new user account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authMode === 'login' ? (
              <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'user' | 'admin')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="user" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email Address</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-password">Password</Label>
                      <Input
                        id="user-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#0071CE] hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In as User"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="Enter admin email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Admin Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In as Admin"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email Address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the <span className="text-[#0071CE] underline cursor-pointer">Terms and Conditions</span>
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#8BC34A] hover:bg-green-500"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

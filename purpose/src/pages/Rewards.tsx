import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import GamificationDashboard from '../components/GamificationDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Rewards: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <GamificationDashboard userId={user.id} />
    </div>
  );
};

export default Rewards; 
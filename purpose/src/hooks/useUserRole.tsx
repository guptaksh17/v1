import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// List of admin emails that should have admin access
const ADMIN_EMAILS = [
  'admin@retailwithpurpose.com', // This email gets admin role automatically from database
  // Add your email here to get admin access
  // 'your-email@example.com',
];

export const useUserRole = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // First, check if user's email is in the admin list
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        console.log('User is admin based on email');
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      try {
        // Try to check user_roles table if it exists
        const { data, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) {
          console.warn('Error checking user_roles table, falling back to email check:', roleError);
          // Fall back to email check if there's an error
          setIsAdmin(user.email ? ADMIN_EMAILS.includes(user.email) : false);
        } else {
          setIsAdmin(!!data || (user.email ? ADMIN_EMAILS.includes(user.email) : false));
        }
      } catch (error) {
        console.warn('Error in useUserRole, falling back to email check:', error);
        // Fall back to email check if there's an error
        setIsAdmin(user.email ? ADMIN_EMAILS.includes(user.email) : false);
        setError('Failed to check user role');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  return { isAdmin, isLoading, error };
};

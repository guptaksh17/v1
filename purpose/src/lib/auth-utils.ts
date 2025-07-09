import { supabase } from '@/integrations/supabase/client';

// Add a retry wrapper for network issues
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};

// Enhanced operation wrapper with session refresh
export const authenticatedOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  try {
    return await retryOperation(operation, maxRetries);
  } catch (error: any) {
    // If we get a 401 error, try to refresh the session
    if (error?.status === 401 || error?.message?.includes('401')) {
      console.log('Session expired, attempting to refresh...');
      
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Session refresh failed:', refreshError);
          // Redirect to login if refresh fails
          window.location.href = '/auth';
          throw new Error('Session expired. Please log in again.');
        }
        
        if (data.session) {
          console.log('Session refreshed successfully, retrying operation...');
          // Retry the original operation with fresh session
          return await retryOperation(operation, 1);
        }
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
        window.location.href = '/auth';
        throw new Error('Session expired. Please log in again.');
      }
    }
    
    throw error;
  }
}; 
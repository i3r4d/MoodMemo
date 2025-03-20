
// This file is used to interact with Supabase
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables or use defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dxolkbecfzspmoiszyvg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4b2xrYmVjZnpzcG1vaXN6eXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzk3NzcsImV4cCI6MjA1NzcxNTc3N30.4VzeavkdeFa4fpyqYvNYKtswcVufVbO1ZW-Tv2qKwok';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if user is premium
export const isPremiumUser = async (userId: string) => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .rpc('is_premium_user', { user_id: userId });
    
    if (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Exception checking premium status:', error);
    return false;
  }
};

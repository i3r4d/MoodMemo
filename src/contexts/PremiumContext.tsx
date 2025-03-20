
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isLoading: true,
  checkPremiumStatus: async () => {},
});

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const checkPremiumStatus = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would check with your backend/database
      // For now, we'll just simulate a check
      if (user) {
        // Simulate API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For testing, we'll set isPremium to false
        // In a real app, this would be based on the API response
        setIsPremium(false);
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    } else {
      setIsPremium(false);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, checkPremiumStatus }}>
      {children}
    </PremiumContext.Provider>
  );
};

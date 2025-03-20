
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type PremiumContextType = {
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => void;
};

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        return;
      }

      // For demo purposes, we're setting a random premium status
      // In a real app, you would check this against a database
      const premiumStatus = localStorage.getItem(`premium_${user.id}`);
      setIsPremium(premiumStatus === 'true');
    };

    checkPremiumStatus();
  }, [user]);

  const setPremiumStatus = (status: boolean) => {
    setIsPremium(status);
    if (user) {
      localStorage.setItem(`premium_${user.id}`, status.toString());
    }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, setPremiumStatus }}>
      {children}
    </PremiumContext.Provider>
  );
};

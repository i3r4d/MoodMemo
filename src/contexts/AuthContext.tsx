
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Profile {
  id: string;
  username?: string;
  is_premium?: boolean;
  premium_expires_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check if there's a user in localStorage (demo purposes)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Create a demo profile for the user
      const demoProfile = {
        id: parsedUser.id,
        username: parsedUser.name || parsedUser.email.split('@')[0],
        is_premium: isPremium
      };
      setProfile(demoProfile);
    }
    setIsLoading(false);
  }, [isPremium]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a demo implementation
      const demoUser = {
        id: '123',
        email,
        name: 'Demo User'
      };
      setUser(demoUser);
      
      // Create a demo profile
      const demoProfile = {
        id: demoUser.id,
        username: demoUser.name,
        is_premium: false
      };
      setProfile(demoProfile);
      
      localStorage.setItem('user', JSON.stringify(demoUser));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      // This is a demo implementation
      const demoUser = {
        id: '123',
        email,
        name: name || 'Demo User'
      };
      setUser(demoUser);
      
      // Create a demo profile
      const demoProfile = {
        id: demoUser.id,
        username: demoUser.name,
        is_premium: false
      };
      setProfile(demoProfile);
      
      localStorage.setItem('user', JSON.stringify(demoUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
      signUp,
      isPremium
    }}>
      {children}
    </AuthContext.Provider>
  );
};

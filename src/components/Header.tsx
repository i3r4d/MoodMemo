
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { UserIcon, LogOutIcon, SettingsIcon, HomeIcon, BookIcon, PlusIcon, BrainCircuitIcon } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { isAuthenticated, signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const getPageTitle = () => {
    switch (path) {
      case '/':
        return 'Home';
      case '/journal':
        return 'Journal';
      case '/insights':
        return 'Insights';
      case '/exercises':
        return 'Exercises';
      case '/settings':
        return 'Settings';
      case '/my-account':
        return 'My Account';
      default:
        return 'MoodMemo';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="md:block">
              <Logo />
            </div>
          </Link>
          
          <motion.h1 
            className="text-xl font-semibold tracking-tight"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {getPageTitle()}
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated && path === '/journal' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "rounded-full p-2",
                "bg-primary text-white shadow-md",
                "hover:bg-primary/90 focus-ring"
              )}
              aria-label="New Journal Entry"
              onClick={() => navigate('/journal')}
            >
              <PlusIcon className="h-5 w-5" />
            </motion.button>
          )}
          
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "rounded-full p-2",
                    "bg-secondary text-secondary-foreground",
                    "hover:bg-secondary/80 focus-ring"
                  )}
                  aria-label="Account"
                >
                  <UserIcon className="h-5 w-5" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/my-account')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>My Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {!isAuthenticated && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="text-sm"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-1.5">
    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary flex items-center justify-center">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-primary rounded-full"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }}
      />
      <span className="relative text-white font-semibold text-sm">M</span>
    </div>
    <span className="font-medium">MoodMemo</span>
  </Link>
);

// Import Button component
import { Button } from "@/components/ui/button";

export default Header;

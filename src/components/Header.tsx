
import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  const getPageTitle = () => {
    switch (path) {
      case '/':
        return 'Home';
      case '/journal':
        return 'Journal';
      case '/dashboard':
        return 'Insights';
      case '/exercises':
        return 'Exercises';
      case '/settings':
        return 'Settings';
      default:
        return 'MoodMemo';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <Logo />
          </div>
          
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
          {path === '/journal' && (
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </motion.button>
          )}
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "rounded-full p-2",
              "bg-secondary text-secondary-foreground",
              "hover:bg-secondary/80 focus-ring"
            )}
            aria-label="Help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <path d="M12 17h.01"></path>
            </svg>
          </motion.button>
        </div>
      </div>
    </header>
  );
};

const Logo: React.FC = () => (
  <div className="flex items-center gap-1.5">
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
  </div>
);

export default Header;

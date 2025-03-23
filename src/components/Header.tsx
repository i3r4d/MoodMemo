
import React from 'react';
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
import { Button } from "@/components/ui/button";
import { 
  UserIcon, 
  LogOutIcon, 
  SettingsIcon, 
  HomeIcon, 
  BookIcon, 
  PlusIcon, 
  Menu,
  LightbulbIcon
  DumbbellIcon
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  scrollY?: number;
}

const Header: React.FC<HeaderProps> = ({ scrollY = 0 }) => {
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
    <header 
      className={cn(
        "sticky top-0 z-30 w-full transition-all duration-300",
        scrollY > 50 
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-border" 
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <motion.div 
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <motion.span>M</motion.span>
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2,
                }}
              />
            </div>
            <span className="font-semibold text-xl">MoodMemo</span>
          </Link>
          
          <motion.h1 
            className="text-xl font-semibold tracking-tight ml-2"
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="h-5 w-5" />
            </motion.button>
          )}
          
          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-2">
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
          </div>
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  className="flex items-center gap-4 px-2 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <HomeIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium">Home</span>
                </Link>
                <Link
                  to="/journal"
                  className="flex items-center gap-4 px-2 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <BookIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium">Journal</span>
                </Link>
                <Link
                  to="/insights"
                  className="flex items-center gap-4 px-2 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LightbulbIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium">Insights</span>
                </Link>
                <Link
                  to="/exercises"
                  className="flex items-center gap-4 px-2 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <DumbbellIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium">Exercises</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-4 px-2 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium">Settings</span>
                </Link>
                
                {isAuthenticated ? (
                  <Button variant="destructive" onClick={handleSignOut} className="mt-4">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/register')}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          
          {!isAuthenticated && (
            <div className="hidden md:flex gap-2">
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

export default Header;

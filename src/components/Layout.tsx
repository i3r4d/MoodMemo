import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { 
  HomeIcon, 
  BookIcon, 
  SettingsIcon, 
  Dumbbell,
  LightbulbIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: HomeIcon,
      active: location.pathname === '/'
    },
    {
      href: '/journal',
      label: 'Journal',
      icon: BookIcon,
      active: location.pathname === '/journal'
    },
    {
      href: '/insights',
      label: 'Insights',
      icon: LightbulbIcon,
      active: location.pathname === '/insights'
    },
    {
      href: '/exercises',
      label: 'Exercises',
      icon: Dumbbell,
      active: location.pathname === '/exercises'
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
      active: location.pathname === '/settings'
    }
  ];

  // Animation variants for nav items
  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header scrollY={scrollY} />
      
      <div className="flex-1 container mx-auto max-w-7xl p-4 pt-20">
        {isAuthenticated && (
          <motion.div 
            className="mb-8 md:flex justify-center"
            initial="hidden"
            animate="visible"
            variants={navContainerVariants}
          >
            <div className="flex items-center space-x-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border px-4 py-2 shadow-sm">
              {routes.map((route) => (
                <motion.button
                  key={route.href}
                  onClick={() => navigate(route.href)}
                  className={cn(
                    "flex items-center space-x-1 text-sm font-medium px-3 py-2 rounded-full transition-all duration-300",
                    route.active 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "opacity-70 hover:opacity-100 hover:bg-muted"
                  )}
                  variants={navItemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <route.icon className="h-4 w-4" />
                  <span>{route.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Add the decorative background blobs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/30 dark:bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-yellow-200/30 dark:bg-yellow-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default Layout;


import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { 
  HomeIcon, 
  BookIcon, 
  SettingsIcon, 
  DumbbellIcon,
  LightbulbIcon // Changed from BrainCircuitIcon to LightbulbIcon for Insights
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      icon: LightbulbIcon, // Changed icon here
      active: location.pathname === '/insights'
    },
    {
      href: '/exercises',
      label: 'Exercises',
      icon: DumbbellIcon,
      active: location.pathname === '/exercises'
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
      active: location.pathname === '/settings'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto max-w-7xl p-4">
        {isAuthenticated && (
          <div className="mb-8 md:flex justify-center">
            <div className="flex items-center space-x-4 bg-background/90 backdrop-blur-sm rounded-full border px-4 py-2">
              {routes.map((route) => (
                <button
                  key={route.href}
                  onClick={() => navigate(route.href)}
                  className={cn(
                    "flex items-center space-x-1 text-sm font-medium px-3 py-2 rounded-full transition-colors",
                    route.active 
                      ? "bg-primary text-primary-foreground" 
                      : "opacity-70 hover:opacity-100 hover:bg-muted"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  <span>{route.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

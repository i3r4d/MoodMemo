
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface JournalStorageNoticeProps {
  className?: string;
}

const JournalStorageNotice: React.FC<JournalStorageNoticeProps> = ({ className }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isPremium } = useAuth();

  if (isPremium) return null;

  return (
    <Alert className={cn("bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800", className)}>
      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-800 dark:text-blue-300">Local Storage Notice</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-300">
        <p className="mt-1">Your journal entries are currently stored on this device only and will not sync across devices.</p>
        {isAuthenticated ? (
          <Button 
            variant="link" 
            className="p-0 h-auto text-blue-600 dark:text-blue-400 font-medium" 
            onClick={() => navigate('/settings')}
          >
            Upgrade to premium to enable cloud sync.
          </Button>
        ) : (
          <Button 
            variant="link" 
            className="p-0 h-auto text-blue-600 dark:text-blue-400 font-medium" 
            onClick={() => navigate('/login')}
          >
            Sign in or create an account to enable cloud backup.
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default JournalStorageNotice;

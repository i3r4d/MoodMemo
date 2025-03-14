
import React from 'react';
import { motion } from 'framer-motion';
import AnimatedTransition from '@/components/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const handleReset = () => {
    toast({
      title: "Data Cleared",
      description: "All your journal entries have been reset.",
    });
  };

  const handleSubscribe = () => {
    toast({
      title: "Subscription Coming Soon",
      description: "Premium subscription options will be available soon!",
    });
  };

  return (
    <AnimatedTransition keyValue="settings">
      <div className="max-w-2xl mx-auto py-4 space-y-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="glass-morphism mood-journal-card space-y-4">
          <h2 className="text-lg font-medium">Account</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Get reminders to journal</p>
              </div>
              <div className="h-6 w-11 bg-muted relative rounded-full cursor-pointer">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-muted-foreground"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
              <div className="h-6 w-11 bg-primary relative rounded-full cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-save</p>
                <p className="text-sm text-muted-foreground">Save entries automatically</p>
              </div>
              <div className="h-6 w-11 bg-primary relative rounded-full cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-morphism mood-journal-card space-y-4">
          <h2 className="text-lg font-medium">Premium</h2>
          
          <div className="p-4 rounded-lg bg-muted/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-200 text-amber-800 font-medium px-2 py-0.5 rounded-full text-xs">FREE</span>
              <p className="font-medium">Current Plan</p>
            </div>
            <p className="text-sm text-muted-foreground">Upgrade to Premium for ad-free experience and access to all exercises.</p>
          </div>
          
          <button 
            onClick={handleSubscribe}
            className="w-full py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Upgrade to Premium
          </button>
        </div>
        
        <div className="glass-morphism mood-journal-card space-y-4">
          <h2 className="text-lg font-medium">Data</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download your journal entries</p>
              <button className="mt-2 text-sm px-3 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80">
                Export as JSON
              </button>
            </div>
            
            <div>
              <p className="font-medium text-destructive">Clear Data</p>
              <p className="text-sm text-muted-foreground">Delete all journal entries</p>
              <button 
                onClick={handleReset}
                className="mt-2 text-sm px-3 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>MoodMemo v0.1.0</p>
          <p>© 2023 MoodMemo. All rights reserved.</p>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Settings;

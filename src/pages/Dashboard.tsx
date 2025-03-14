
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MoodDashboard from '@/components/MoodDashboard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { LockIcon, ShieldIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { toast } = useToast();
  const [isPremium] = useState(false); // This would come from a user context/state in a real app
  
  // Mock entry count for demonstration
  const entryCount = 10;
  const maxFreeEntries = 14;
  const entryProgress = Math.min((entryCount / maxFreeEntries) * 100, 100);
  
  // Mock data for demonstration
  const moodDistribution = {
    joy: 5,
    calm: 8,
    neutral: 12,
    sad: 3,
    stress: 6,
    unknown: 1
  };

  const weeklyMoodData = [
    { day: 'Mon', joy: 2, calm: 1, neutral: 1, sad: 0, stress: 0 },
    { day: 'Tue', joy: 1, calm: 2, neutral: 1, sad: 0, stress: 0 },
    { day: 'Wed', joy: 0, calm: 1, neutral: 2, sad: 1, stress: 1 },
    { day: 'Thu', joy: 0, calm: 0, neutral: 1, sad: 1, stress: 2 },
    { day: 'Fri', joy: 1, calm: 1, neutral: 2, sad: 0, stress: 1 },
    { day: 'Sat', joy: 1, calm: 2, neutral: 3, sad: 0, stress: 0 },
    { day: 'Sun', joy: 0, calm: 1, neutral: 2, sad: 1, stress: 2 }
  ];

  const entriesCount = 35;
  
  const handlePremiumClick = () => {
    toast({
      title: "Premium Feature",
      description: "Upgrade to Premium for $4.99/month to access advanced insights and ad-free experience.",
    });
  };
  
  const handleCrisisResourcesClick = () => {
    toast({
      title: "Crisis Resources",
      description: "If you're in crisis, please call the National Suicide Prevention Lifeline at 988.",
      variant: "destructive",
    });
  };
  
  const handleWhyAdsClick = () => {
    toast({
      title: "Why Ads?",
      description: "Ads keep the app free for everyone. Upgrade to premium for an ad-free experience.",
    });
  };

  return (
    <AnimatedTransition keyValue="dashboard">
      <div className="max-w-3xl mx-auto py-4 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Your Mood Insights</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCrisisResourcesClick}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <AlertTriangleIcon className="h-4 w-4 mr-1" />
              Crisis Resources
            </Button>
          </div>
        </div>
        
        {!isPremium && (
          <div className="glass-morphism mood-journal-card p-4 mb-4 bg-blue-50/30 border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-primary">Journal Entry Limit</h3>
                  <span className="text-sm font-medium">{entryCount}/{maxFreeEntries} Entries</span>
                </div>
                <Progress value={entryProgress} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  You've used {entryCount} of your 14 free entries. Upgrade for unlimited journaling.
                </p>
              </div>
              <Button 
                onClick={handlePremiumClick}
                className="shrink-0 bg-gradient-to-r from-primary to-primary/80"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
        
        <div className="glass-morphism mood-journal-card p-4 mb-4 bg-amber-50/30 border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <ShieldIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Your data is secure</h3>
              <p className="text-sm text-amber-700">
                Insights are stored locally on your device. Enable additional security in Settings.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-amber-600 hover:bg-amber-100"
              onClick={() => window.location.href = '/settings'}
            >
              <LockIcon className="h-4 w-4 mr-1" />
              Secure Now
            </Button>
          </div>
        </div>
        
        {isPremium ? (
          <MoodDashboard 
            moodDistribution={moodDistribution}
            weeklyMoodData={weeklyMoodData}
            entriesCount={entriesCount}
          />
        ) : (
          <div className="glass-morphism mood-journal-card p-5 space-y-4 relative">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-lg z-10 flex flex-col items-center justify-center p-6">
              <LockIcon className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-medium text-center mb-1">Unlock Premium Insights</h3>
              <p className="text-center text-muted-foreground mb-4">
                Upgrade to see AI trends, weekly summaries, and actionable recommendations.
              </p>
              <Button
                onClick={handlePremiumClick}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                Upgrade for $4.99/month
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Less than a latte per month for better mental wellness
              </p>
            </div>
            
            {/* Blurred preview of the dashboard */}
            <div className="opacity-40 pointer-events-none">
              <MoodDashboard 
                moodDistribution={moodDistribution}
                weeklyMoodData={weeklyMoodData}
                entriesCount={entriesCount}
              />
            </div>
          </div>
        )}
        
        <div className="glass-morphism mood-journal-card border-primary/20 p-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-primary">Unlock Premium Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered therapy recommendations based on your mood patterns.
              </p>
            </div>
            <Button 
              onClick={handlePremiumClick}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              Upgrade for $4.99/mo
            </Button>
          </div>
        </div>
        
        {/* Free version ad placeholder with Why Ads tooltip */}
        {!isPremium && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 mt-6">
            <div className="flex items-center justify-between">
              <p>Free version supported by ethical ads. Go premium to remove.</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleWhyAdsClick} 
                className="text-xs h-7 px-2"
              >
                <InfoIcon className="h-3 w-3 mr-1" />
                Why Ads?
              </Button>
            </div>
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Dashboard;

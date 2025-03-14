
import React from 'react';
import { motion } from 'framer-motion';
import MoodDashboard from '@/components/MoodDashboard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { LockIcon, ShieldIcon, AlertTriangleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  
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
      description: "Upgrade to Premium for $9.99/month to access advanced insights and ad-free experience.",
    });
  };
  
  const handleCrisisResourcesClick = () => {
    toast({
      title: "Crisis Resources",
      description: "If you're in crisis, please call the National Suicide Prevention Lifeline at 988.",
      variant: "destructive",
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
        
        <MoodDashboard 
          moodDistribution={moodDistribution}
          weeklyMoodData={weeklyMoodData}
          entriesCount={entriesCount}
        />
        
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
              Upgrade for $9.99/mo
            </Button>
          </div>
        </div>
        
        {/* Free version ad placeholder */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500 mt-6">
          <p>Free version supported by ethical ads. Go premium to remove.</p>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Dashboard;

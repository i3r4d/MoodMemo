import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MoodDashboard from '@/components/MoodDashboard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { LockIcon, ShieldIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import ReportGenerator from '@/components/ReportGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MoodDistribution {
  joy: number;
  calm: number;
  neutral: number;
  sad: number;
  stress: number;
  unknown: number;
}

interface WeeklyMoodData {
  day: string;
  joy: number;
  calm: number;
  neutral: number;
  sad: number;
  stress: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [entryCount, setEntryCount] = useState(0);
  const [moodDistribution, setMoodDistribution] = useState<MoodDistribution>({
    joy: 0,
    calm: 0,
    neutral: 0,
    sad: 0,
    stress: 0,
    unknown: 0
  });
  const [weeklyMoodData, setWeeklyMoodData] = useState<WeeklyMoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const maxFreeEntries = 14;
  const entryProgress = Math.min((entryCount / maxFreeEntries) * 100, 100);
  
  useEffect(() => {
    const fetchDataForDashboard = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch count of entries
        const { count, error: countError } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (countError) {
          console.error('Error fetching entry count:', countError);
        } else if (count !== null) {
          setEntryCount(count);
        }
        
        // Fetch entries for mood distribution
        const { data: moodData, error: moodError } = await supabase
          .from('journal_entries')
          .select('mood')
          .eq('user_id', user.id);
        
        if (moodError) {
          console.error('Error fetching mood data:', moodError);
        } else if (moodData) {
          const distribution: MoodDistribution = {
            joy: 0,
            calm: 0,
            neutral: 0,
            sad: 0,
            stress: 0,
            unknown: 0
          };
          
          moodData.forEach(entry => {
            if (entry.mood) {
              distribution[entry.mood as keyof MoodDistribution]++;
            } else {
              distribution.unknown++;
            }
          });
          
          setMoodDistribution(distribution);
        }
        
        // Fetch weekly data (simplified example - in a real app you'd aggregate by day)
        // This is a simplified example - we're creating mock weekly data based on actual mood counts
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const mockWeeklyData: WeeklyMoodData[] = days.map(day => ({
          day,
          joy: Math.floor(Math.random() * (moodDistribution.joy || 1)),
          calm: Math.floor(Math.random() * (moodDistribution.calm || 1)),
          neutral: Math.floor(Math.random() * (moodDistribution.neutral || 1)),
          sad: Math.floor(Math.random() * (moodDistribution.sad || 1)),
          stress: Math.floor(Math.random() * (moodDistribution.stress || 1))
        }));
        
        setWeeklyMoodData(mockWeeklyData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDataForDashboard();
  }, [user]);
  
  const handlePremiumClick = () => {
    navigate('/settings');
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
                Insights are stored securely in your account. Enable additional security in Settings.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-amber-600 hover:bg-amber-100"
              onClick={() => navigate('/settings')}
            >
              <LockIcon className="h-4 w-4 mr-1" />
              Secure Now
            </Button>
          </div>
        </div>
        
        <ReportGenerator 
          isPremium={isPremium} 
          insightsView={true}
        />
        
        {isPremium ? (
          <MoodDashboard 
            moodDistribution={moodDistribution}
            weeklyMoodData={weeklyMoodData}
            entriesCount={entryCount}
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
            
            <div className="opacity-40 pointer-events-none">
              <MoodDashboard 
                moodDistribution={moodDistribution}
                weeklyMoodData={weeklyMoodData}
                entriesCount={entryCount}
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

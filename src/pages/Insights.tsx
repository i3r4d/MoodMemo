import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangleIcon, 
  LockIcon, 
  BarChart3, 
  HeartPulse, 
  Activity, 
  Brain,
  TrendingUp,
  ShieldIcon,
  InfoIcon,
  LightbulbIcon,
  SunIcon,
  MoonIcon,
  ZapIcon,
  ListChecksIcon,
  CalendarClockIcon,
  LineChartIcon,
  Dumbbell,
  BookOpen,
  Sparkles,
  LayoutList,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import HealthMetrics from '@/components/HealthMetrics';
import ReportGenerator from '@/components/ReportGenerator';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import MoodDashboard from '@/components/MoodDashboard';
import useJournalEntries from '@/hooks/useJournalEntries';
import { cn } from '@/lib/utils';

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

const Insights = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
  const { entries, getMoodDistribution } = useJournalEntries();
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [longestWritingStreak, setLongestWritingStreak] = useState(0);

  const maxFreeEntries = 14;
  const entryProgress = Math.min((entryCount / maxFreeEntries) * 100, 100);

  useEffect(() => {
    console.log("Insights page loaded, entries count:", entries.length);
    const fetchDataForDashboard = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        setEntryCount(entries.length);
        console.log("Setting entry count to:", entries.length);
        
        const distribution = getMoodDistribution();
        console.log("Calculated mood distribution:", distribution);
        setMoodDistribution(distribution);
        
        const daysMap: Record<string, WeeklyMoodData> = {
          'Mon': { day: 'Mon', joy: 0, calm: 0, neutral: 0, sad: 0, stress: 0 },
          'Tue': { day: 'Tue', joy: 0, calm: 0, neutral: 0, sad: 0, stress: 0 },
          'Wed': { day: 'Wed', joy: 0, calm: 0, neutral: 0, sad: 0, stress: 0 },
          'Thu': { day: 'Thu', joy: 0, calm: 0, neutral: 0, sad: 0, stress: 0 },
          'Fri': { day: 'Fri', joy: 0, calm: 0, neutral: 0, sad: 0, stress: 0 },
          'Sat': { day: 'Sat', joy: 0, calm: 0, neutral: 0, sad: 0, stress: 0 },
          'Sun': { day: 'Sun', joy: 0, calm: 0, neutral: 0, sad: 0, stress: 0 }
        };
        
        let streak = 0;
        let maxStreak = 0;
        
        if (entries.length > 0) {
          const sortedEntries = [...entries].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          let streakBroken = false;
          
          for (let i = sortedEntries.length - 1; i >= 0; i--) {
            const entryDate = new Date(sortedEntries[i].timestamp);
            const diff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (!streakBroken && (diff === 0 || diff === 1)) {
              streak++;
              currentDate = entryDate;
            } else {
              streakBroken = true;
            }
            
            if (i > 0) {
              const prevDate = new Date(sortedEntries[i-1].timestamp);
              const dateDiff = Math.floor((entryDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (dateDiff === 1) {
                maxStreak++;
              } else {
                maxStreak = Math.max(maxStreak, streak);
                streak = 1;
              }
            }
          }
        }
        
        setConsecutiveDays(streak);
        setLongestWritingStreak(Math.max(maxStreak, streak));
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        entries.forEach(entry => {
          const entryDate = new Date(entry.timestamp);
          if (entryDate >= oneWeekAgo && entry.mood) {
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][entryDate.getDay()];
            if (daysMap[dayName] && entry.mood) {
              daysMap[dayName][entry.mood as keyof Omit<WeeklyMoodData, 'day'>] += 1;
            }
          }
        });
        
        const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = orderedDays.map(day => daysMap[day]);
        
        setWeeklyMoodData(weekData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch insights data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDataForDashboard();
  }, [user, entries, toast, getMoodDistribution]);
  
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

  const getWritingTimePattern = () => {
    if (entries.length === 0) return "No data available";
    
    const morningEntries = entries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 5 && hour < 12;
    }).length;
    
    const afternoonEntries = entries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 12 && hour < 18;
    }).length;
    
    const eveningEntries = entries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 18 && hour < 24;
    }).length;
    
    const nightEntries = entries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 0 && hour < 5;
    }).length;
    
    const max = Math.max(morningEntries, afternoonEntries, eveningEntries, nightEntries);
    
    if (max === morningEntries) return "morning";
    if (max === afternoonEntries) return "afternoon";
    if (max === eveningEntries) return "evening";
    return "night";
  };

  const getMoodTrend = () => {
    if (entries.length < 2) return null;
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const moodValues = {
      'joy': 2,
      'calm': 1,
      'neutral': 0,
      'sad': -1,
      'stress': -2
    };
    
    const recentEntries = sortedEntries.slice(-5);
    let trend = 0;
    
    for (let i = 1; i < recentEntries.length; i++) {
      const prevMood = recentEntries[i-1].mood as keyof typeof moodValues;
      const currentMood = recentEntries[i].mood as keyof typeof moodValues;
      
      if (prevMood && currentMood) {
        trend += moodValues[currentMood] - moodValues[prevMood];
      }
    }
    
    if (trend > 0) return "improving";
    if (trend < 0) return "declining";
    return "stable";
  };
  
  const getMostCommonTriggers = () => {
    if (entries.length === 0) return [];
    
    const commonTriggerWords = ['work', 'stress', 'family', 'sleep', 'exercise', 'meditation', 'food', 'friends', 'social', 'weather'];
    const wordCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (entry.text) {
        const lowerContent = entry.text.toLowerCase();
        commonTriggerWords.forEach(word => {
          if (lowerContent.includes(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
  };
  
  const getRecommendedExercise = () => {
    let recommendedExercise = "Deep Breathing";
    
    if (Object.keys(moodDistribution).length > 0) {
      const dominantMood = Object.entries(moodDistribution)
        .filter(([mood]) => mood !== 'unknown')
        .sort(([, a], [, b]) => b - a)[0];
      
      if (dominantMood) {
        switch(dominantMood[0]) {
          case 'stress':
            recommendedExercise = "Progressive Muscle Relaxation";
            break;
          case 'sad':
            recommendedExercise = "Loving-Kindness Meditation";
            break;
          case 'joy':
            recommendedExercise = "Mindful Walking";
            break;
          case 'calm':
            recommendedExercise = "Body Scan Meditation";
            break;
          default:
            recommendedExercise = "Deep Breathing";
        }
      }
    }
    
    return recommendedExercise;
  };

  const getSleepInsight = () => {
    const sleepMentions = entries.filter(entry => 
      entry.text && entry.text.toLowerCase().includes("sleep")
    );
    
    if (sleepMentions.length === 0) return null;
    
    const goodSleepEntries = sleepMentions.filter(entry => 
      entry.text && 
      (entry.text.toLowerCase().includes("good sleep") || 
       entry.text.toLowerCase().includes("slept well"))
    );
    
    const goodSleepRatio = goodSleepEntries.length / sleepMentions.length;
    
    const goodSleepWithPositiveMood = goodSleepEntries.filter(entry => 
      entry.mood === "joy" || entry.mood === "calm"
    ).length;
    
    const sleepMoodCorrelation = goodSleepEntries.length > 0 ? 
      goodSleepWithPositiveMood / goodSleepEntries.length : 0;
    
    if (sleepMoodCorrelation > 0.7) {
      return "Quality sleep appears to have a strong positive impact on your mood";
    } else if (goodSleepRatio < 0.3) {
      return "You've mentioned sleep issues in several entries. Improving sleep quality may help your overall mood";
    }
    
    return "Sleep appears in your journal regularly - maintaining good sleep hygiene can benefit your mental health";
  };

  return (
    <AnimatedTransition keyValue="insights">
      <div className="max-w-3xl mx-auto py-4 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Your Health & Mood Insights</h1>
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
        
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
          className="glass-morphism mood-journal-card space-y-4"
        >
          <h3 className="text-lg font-medium flex items-center">
            <Brain className="h-5 w-5 text-primary mr-2" />
            AI Insights & Recommendations
          </h3>
          
          {entries.length === 0 ? (
            <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
              <div className="flex flex-col items-center gap-4 py-8">
                <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                <div className="text-center">
                  <h4 className="text-base font-medium mb-2">No Journal Entries Yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start journaling to receive personalized insights about your moods, habits, and emotional patterns.
                  </p>
                  <Button onClick={() => navigate('/journal/new')}>
                    Create Your First Entry
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="bg-primary/5 border border-primary/10 px-3 py-1 rounded-full text-sm flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'} analyzed
                </div>
                {consecutiveDays > 1 && (
                  <div className="bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-sm flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                    {consecutiveDays} day streak
                  </div>
                )}
                {longestWritingStreak > 3 && (
                  <div className="bg-green-50 border border-green-100 px-3 py-1 rounded-full text-sm flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    {longestWritingStreak} day record
                  </div>
                )}
              </div>
              
              <div className={cn(
                "p-4 rounded-lg border border-primary/20 bg-primary/5",
                "flex items-start gap-3"
              )}>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getWritingTimePattern() === "morning" ? (
                    <SunIcon className="h-4 w-4 text-primary" />
                  ) : getWritingTimePattern() === "evening" ? (
                    <MoonIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <CalendarClockIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
                
                <div className="space-y-1 text-sm leading-relaxed">
                  <p className="font-medium">Writing Pattern Analysis</p>
                  <p>Your journaling is most consistent in the <span className="font-medium text-primary">{getWritingTimePattern()}</span>.</p>
                  <p>Maintaining this routine helps establish a healthy reflection habit. {
                    getWritingTimePattern() === "evening" ? 
                    "Evening journaling has been shown to improve sleep quality and reduce next-day anxiety." :
                    getWritingTimePattern() === "morning" ? 
                    "Morning journaling can set a positive tone for your day and improve focus." :
                    "Consistent journaling at any time helps build self-awareness."
                  }</p>
                  
                  {entries.length > 5 && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <p className="font-medium text-xs text-primary">ACHIEVEMENT</p>
                      <p className="font-medium">Consistent Journaler</p>
                      <p>You've created {entries.length} entries, placing you in the top 20% of dedicated journal users!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {entries.length > 1 && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getMoodTrend() === "improving" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : getMoodTrend() === "declining" ? (
                      <LineChartIcon className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-accent-foreground" />
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm leading-relaxed">
                    <p className="font-medium">Mood Trend Analysis</p>
                    <p>
                      {getMoodTrend() === "improving" ? 
                        "Your mood has been improving in recent entries. Keep up the positive momentum!" :
                        getMoodTrend() === "declining" ?
                        "We've noticed a slight dip in your mood recently. Consider trying a guided meditation or exercise to boost your spirits." :
                        "Your mood has been relatively stable lately. Consistency is a good sign of emotional regulation."
                      }
                    </p>
                    <p>
                      {Object.entries(moodDistribution).find(([_, value]) => value === Math.max(...Object.values(moodDistribution)))?.[0] === "calm" ?
                        "You've been experiencing more calm moments lately. Try the new guided breathing exercise to maintain this positive trend." :
                        Object.entries(moodDistribution).find(([_, value]) => value === Math.max(...Object.values(moodDistribution)))?.[0] === "joy" ?
                        "Joy has been your predominant mood lately. This is a great opportunity to reflect on what's working well in your life." :
                        "Reflecting on positive moments, even small ones, can help strengthen your resilience."
                      }
                    </p>
                    
                    {getMostCommonTriggers().length > 0 && (
                      <div className="mt-2 pt-2 border-t border-accent/10">
                        <p className="font-medium">Common Themes in Your Journal</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getMostCommonTriggers().map((trigger, index) => (
                            <span key={index} className="px-2 py-1 bg-accent/10 rounded-full text-xs">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {getSleepInsight() && (
                <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/30 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MoonIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="space-y-1 text-sm leading-relaxed">
                    <p className="font-medium">Sleep Pattern Insight</p>
                    <p>{getSleepInsight()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {entries.filter(e => e.text && e.text.toLowerCase().includes("sleep")).length} mentions of sleep in your journal entries
                    </p>
                  </div>
                </div>
              )}
              
              <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Dumbbell className="h-4 w-4 text-secondary-foreground" />
                </div>
                
                <div className="space-y-1 text-sm leading-relaxed">
                  <p className="font-medium">Recommended Exercise</p>
                  <p>Based on your mood patterns, we recommend trying the <span className="font-medium text-primary">{getRecommendedExercise()}</span> exercise.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/exercises')}
                  >
                    <Dumbbell className="h-3.5 w-3.5 mr-1.5" />
                    Try this exercise
                  </Button>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ListChecksIcon className="h-4 w-4 text-secondary-foreground" />
                </div>
                
                <div className="space-y-1 text-sm leading-relaxed">
                  <p className="font-medium">Action Recommendations</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      {getWritingTimePattern() === "evening" ? 
                        "Continue your evening journaling habit and try adding a gratitude practice." :
                        "Consider establishing an evening journaling routine to improve sleep quality."
                      }
                    </li>
                    <li>
                      {entries.length > 5 ? 
                        "You're building a solid journaling habit. Try exploring different prompts to deepen your reflections." :
                        "Aim for consistent journaling (3-5 times per week) to see the most benefits."
                      }
                    </li>
                    <li>Check out the guided exercises in the Exercises section for mood enhancement techniques.</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </motion.div>
        
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
        
        {isPremium ? (
          <MoodDashboard 
            moodDistribution={moodDistribution}
            weeklyMoodData={weeklyMoodData}
            entriesCount={entryCount}
          />
        ) : entries.length > 0 ? (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Basic Mood Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You've recorded {entryCount} journal entries. Upgrade to premium for detailed mood analysis and personalized insights.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(moodDistribution)
                  .filter(([mood, count]) => mood !== 'unknown' && count > 0)
                  .map(([mood, count]) => (
                    <div key={mood} className="bg-primary/10 rounded-full px-3 py-1 text-sm">
                      {mood}: {count}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>No journal entries yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Start journaling to see insights about your mood patterns. Your first entry will appear here.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/journal')}
              >
                Create your first entry
              </Button>
            </CardContent>
          </Card>
        )}
        
        {isPremium && (
          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">Health Data</h2>
            <HealthMetrics />
            
            <Card className="mt-6 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  Connect Your Fitness Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sync data from your smartwatch or fitness tracker to gain deeper insights into how your physical health affects your mood.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Enhanced Accuracy</h3>
                      <p className="text-sm text-muted-foreground">
                        Health metrics provide additional context for more accurate mood analysis.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Personalized Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Get tailored suggestions based on your combined health and mood data.
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/settings?tab=devices')} 
                  className="mt-4"
                >
                  Connect Device
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        <ReportGenerator insightsView={true} />
        
        {!isPremium && (
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
        )}
        
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

export default Insights;

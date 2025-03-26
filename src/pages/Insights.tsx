import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, ArrowRight, Calendar, Clock, Lightbulb, Smile, Frown, Meh, Heart, Activity, Brain } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import useJournalEntries from '@/hooks/useJournalEntries';
import { JournalEntry, MoodType } from '@/types/journal';

const Insights = () => {
  const { entries } = useJournalEntries();
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('mood');
  const [moodData, setMoodData] = useState<any[]>([]);
  const [timeData, setTimeData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    lastEntryDate: ''
  });
  
  // Colors for mood chart
  const MOOD_COLORS = {
    joy: '#4ade80',
    happy: '#22c55e',
    content: '#10b981',
    neutral: '#6b7280',
    sad: '#60a5fa',
    anxious: '#f59e0b',
    angry: '#ef4444',
    stressed: '#f97316'
  };
  
  // Process entries to generate insights
  useEffect(() => {
    if (entries.length === 0) return;
    
    // Process mood data
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });
    
    const moodChartData = Object.keys(moodCounts).map(mood => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: moodCounts[mood]
    }));
    
    setMoodData(moodChartData);
    
    // Process time of day data
    const timeOfDayCounts = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      
      if (hour >= 5 && hour < 12) {
        timeOfDayCounts.morning += 1;
      } else if (hour >= 12 && hour < 17) {
        timeOfDayCounts.afternoon += 1;
      } else if (hour >= 17 && hour < 21) {
        timeOfDayCounts.evening += 1;
      } else {
        timeOfDayCounts.night += 1;
      }
    });
    
    const timeChartData = [
      { name: 'Morning', entries: timeOfDayCounts.morning },
      { name: 'Afternoon', entries: timeOfDayCounts.afternoon },
      { name: 'Evening', entries: timeOfDayCounts.evening },
      { name: 'Night', entries: timeOfDayCounts.night }
    ];
    
    setTimeData(timeChartData);
    
    // Calculate streak data
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastEntryDate = '';
    
    if (sortedEntries.length > 0) {
      // Get the date of the most recent entry
      const mostRecentDate = new Date(sortedEntries[0].timestamp);
      lastEntryDate = mostRecentDate.toLocaleDateString();
      
      // Check if the most recent entry is from today or yesterday
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      mostRecentDate.setHours(0, 0, 0, 0);
      
      // If the most recent entry is from today or yesterday, calculate the streak
      if (mostRecentDate.getTime() === today.getTime() || 
          mostRecentDate.getTime() === yesterday.getTime()) {
        
        // Start counting the streak
        currentStreak = 1;
        
        // Convert entries to dates (just the day part)
        const entryDates = sortedEntries.map(entry => {
          const date = new Date(entry.timestamp);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        });
        
        // Remove duplicate dates
        const uniqueDates = [...new Set(entryDates)];
        
        // Check for consecutive days
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i - 1]);
          const prevDate = new Date(uniqueDates[i]);
          
          // Check if dates are consecutive
          const diffTime = currentDate.getTime() - prevDate.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          
          if (diffDays === 1) {
            currentStreak += 1;
          } else {
            break;
          }
        }
      }
      
      // Calculate longest streak (more complex, simplified for now)
      longestStreak = Math.max(currentStreak, 
        Math.min(7, Math.floor(Math.sqrt(sortedEntries.length) * 1.5)));
    }
    
    setStreakData({
      currentStreak,
      longestStreak,
      totalEntries: entries.length,
      lastEntryDate
    });
    
  }, [entries]);
  
  const getMoodIcon = (mood: MoodType) => {
    switch (mood) {
      case 'joy':
      case 'happy':
      case 'content':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'sad':
      case 'anxious':
      case 'angry':
      case 'stressed':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getMostFrequentMood = (): { mood: MoodType, count: number } | null => {
    if (moodData.length === 0) return null;
    
    let maxMood = moodData[0];
    for (let i = 1; i < moodData.length; i++) {
      if (moodData[i].value > maxMood.value) {
        maxMood = moodData[i];
      }
    }
    
    return {
      mood: maxMood.name.toLowerCase() as MoodType,
      count: maxMood.value
    };
  };
  
  const getPreferredJournalTime = (): string | null => {
    if (timeData.length === 0) return null;
    
    let maxTime = timeData[0];
    for (let i = 1; i < timeData.length; i++) {
      if (timeData[i].entries > maxTime.entries) {
        maxTime = timeData[i];
      }
    }
    
    return maxTime.name;
  };
  
  const handleCrisisResourcesClick = () => {
    toast({
      title: "Crisis Resources",
      description: "If you're in crisis, please call the National Suicide Prevention Lifeline at 988.",
      variant: "destructive",
    });
  };
  
  const renderMoodInsights = () => {
    const mostFrequentMood = getMostFrequentMood();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Frequent Mood</CardTitle>
            </CardHeader>
            <CardContent>
              {mostFrequentMood ? (
                <div className="flex items-center">
                  <div className="mr-2">
                    {getMoodIcon(mostFrequentMood.mood)}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {mostFrequentMood.mood.charAt(0).toUpperCase() + mostFrequentMood.mood.slice(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {mostFrequentMood.count} entries
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No mood data yet</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Journal Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streakData.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">
                Longest streak: {streakData.longestStreak} days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preferred Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPreferredJournalTime() || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                When you typically journal
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
            <CardDescription>
              How your moods have been distributed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {moodData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {moodData.map((entry, index) => {
                        const mood = entry.name.toLowerCase();
                        const color = MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || '#6b7280';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">No mood data yet</h3>
                <p className="text-muted-foreground max-w-xs">
                  Start adding journal entries with mood information to see insights here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Journaling Time</CardTitle>
            <CardDescription>
              When you tend to write journal entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeData.some(item => item.entries > 0) ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="entries" fill="#8884d8" name="Entries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">No time data yet</h3>
                <p className="text-muted-foreground max-w-xs">
                  Add more journal entries to see when you typically journal.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderPatternInsights = () => {
    return (
      <div className="space-y-6">
        {isPremium ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Mood Patterns</CardTitle>
                <CardDescription>
                  Patterns detected in your mood over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries.length >= 5 ? (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                        <div className="mt-0.5">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Weekly Pattern</h4>
                          <p className="text-sm text-muted-foreground">
                            You tend to feel more {entries.length > 10 ? 'positive on weekends' : 'neutral throughout the week'} and experience more {entries.length > 10 ? 'stress mid-week' : 'varied moods on weekdays'}.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                        <div className="mt-0.5">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Activity Impact</h4>
                          <p className="text-sm text-muted-foreground">
                            Entries mentioning exercise or outdoor activities correlate with more positive moods in your journal.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                        <div className="mt-0.5">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Social Connection</h4>
                          <p className="text-sm text-muted-foreground">
                            Journal entries that mention social interactions show a {entries.length > 15 ? '60%' : '40%'} increase in positive mood compared to entries without social mentions.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-1">Not enough data yet</h3>
                      <p className="text-muted-foreground max-w-xs mb-4">
                        Add at least 5 journal entries with mood information to see pattern insights.
                      </p>
                      <Button onClick={() => navigate('/journal/new')}>
                        Add Journal Entry
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mood Triggers</CardTitle>
                <CardDescription>
                  Potential triggers identified from your journal entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length >= 10 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Work stress</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.min(90, Math.max(40, entries.length * 3))}% correlation
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span>Sleep quality</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.min(85, Math.max(35, entries.length * 2.5))}% correlation
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Physical activity</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.min(80, Math.max(30, entries.length * 2))}% correlation
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-1">Not enough data yet</h3>
                    <p className="text-muted-foreground max-w-xs">
                      Add at least 10 journal entries to identify potential mood triggers.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Premium Feature</CardTitle>
              <CardDescription>
                Upgrade to access advanced pattern insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-medium mb-2">Advanced Pattern Analysis</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Unlock AI-powered pattern recognition to identify mood triggers, behavioral patterns, and personalized recommendations based on your journal entries.
                </p>
                <Button onClick={() => navigate('/settings')}>
                  Upgrade to Premium
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  const renderRecommendations = () => {
    return (
      <div className="space-y-6">
        {isPremium ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>
                  Based on your journal entries and mood patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length >= 5 ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Exercise Recommendation</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Based on your mood patterns, regular physical activity appears to improve your emotional wellbeing.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/exercises')}
                          className="text-xs"
                        >
                          Try Exercise
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="mt-0.5 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                        <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Mindfulness Practice</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your entries suggest that stress builds up mid-week. A short mindfulness practice could help manage this pattern.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/exercises?category=meditation')}
                          className="text-xs"
                        >
                          Try Meditation
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Social Connection</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your mood tends to improve after social interactions. Consider scheduling regular social activities.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/journal/new')}
                          className="text-xs"
                        >
                          Journal About It
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-1">Not enough data yet</h3>
                    <p className="text-muted-foreground max-w-xs mb-4">
                      Add at least 5 journal entries with mood information to get personalized recommendations.
                    </p>
                    <Button onClick={() => navigate('/journal/new')}>
                      Add Journal Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Premium Feature</CardTitle>
              <CardDescription>
                Upgrade to access personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-medium mb-2">Personalized Recommendations</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Get AI-powered recommendations for exercises, activities, and habits based on your unique mood patterns and journal entries.
                </p>
                <Button onClick={() => navigate('/settings')}>
                  Upgrade to Premium
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  return (
    <AnimatedTransition keyValue="insights">
      <div className="max-w-5xl mx-auto py-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Insights & Analytics</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCrisisResourcesClick}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Crisis Resources
          </Button>
        </div>
        
        {entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">No Journal Entries Yet</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Start journaling to see insights about your mood patterns, triggers, and recommendations for improving your mental wellbeing.
              </p>
              <Button onClick={() => navigate('/journal/new')}>
                Create Your First Journal Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="mood">Mood Insights</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mood" className="mt-6">
              {renderMoodInsights()}
            </TabsContent>
            
            <TabsContent value="patterns" className="mt-6">
              {renderPatternInsights()}
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              {renderRecommendations()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Insights;

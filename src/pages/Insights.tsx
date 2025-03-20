
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
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import HealthMetrics from '@/components/HealthMetrics';
import ReportGenerator from '@/components/ReportGenerator';

const Insights = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
        
        {!isPremium && (
          <Card className="glass-morphism mood-journal-card p-4 mb-4 bg-blue-50/30 border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-grow">
                <h3 className="font-medium text-primary">Premium Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to premium to access advanced health insights and AI-powered recommendations.
                </p>
              </div>
              <Button 
                onClick={handlePremiumClick}
                className="shrink-0 bg-gradient-to-r from-primary to-primary/80"
              >
                Upgrade Now
              </Button>
            </div>
          </Card>
        )}
        
        {isPremium ? (
          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced AI analysis of your journal entries and health data to provide personalized insights into your emotional wellbeing.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Mood Trends</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Analysis of your mood patterns over time
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Activity Impact</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        How your activities affect your emotional state
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
        
            <div className="space-y-4">
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
              
              <ReportGenerator insightsView={true} />
            </div>
          </div>
        ) : (
          <div className="glass-morphism mood-journal-card p-5 space-y-4 relative">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-lg z-10 flex flex-col items-center justify-center p-6">
              <LockIcon className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-medium text-center mb-1">Unlock Premium Insights</h3>
              <p className="text-center text-muted-foreground mb-4">
                Upgrade to see AI trends, health data analysis, and actionable recommendations.
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
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Premium feature placeholder</p>
                </CardContent>
              </Card>
              
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Premium feature placeholder</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Insights;

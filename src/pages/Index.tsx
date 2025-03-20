import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Brain, Shield, Calendar, ChevronRight, Watch } from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isPremium } = useAuth();

  return (
    <AnimatedTransition keyValue="home">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Track Your Mood, Transform Your Life
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Your personal space for emotional well-being, self-reflection, and growth.
            </p>
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate('/journal')}
                className="rounded-full px-8"
              >
                Go to Journal
              </Button>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="rounded-full px-8"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="rounded-full px-8"
                >
                  Sign In
                </Button>
              </div>
            )}
          </motion.div>
        </section>

        <section className="py-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Features</h2>
            <p className="text-muted-foreground">Tools to support your mental wellness journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border rounded-xl p-6 shadow-sm"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mood Tracking</h3>
              <p className="text-muted-foreground mb-4">
                Record your moods, thoughts, and feelings with easy-to-use tools.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(user ? '/journal' : '/register')}
              >
                Start Journaling <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border rounded-xl p-6 shadow-sm"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Insights</h3>
              <p className="text-muted-foreground mb-4">
                Get personalized insights and patterns based on your journal entries.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(user ? '/insights' : '/register')}
              >
                View Insights <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card border rounded-xl p-6 shadow-sm"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Exercises</h3>
              <p className="text-muted-foreground mb-4">
                Access guided exercises for mindfulness, reflection, and stress reduction.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(user ? '/exercises' : '/register')}
              >
                Try Exercises <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="py-10 my-8 bg-primary/5 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Watch className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Connect Your Devices</h2>
              <p className="text-muted-foreground mb-4">
                Sync your smartwatch or fitness tracker to gain powerful insights into how your physical health affects your mood and emotional wellbeing.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm">Correlate mood with sleep, activity, and heart rate data</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm">Get personalized recommendations based on your health patterns</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm">Identify activities that positively impact your mental wellbeing</p>
                </div>
              </div>
              {isPremium ? (
                <Button onClick={() => navigate('/settings?tab=devices')}>
                  Connect Your Device
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate('/settings')}>
                    Upgrade to Premium
                  </Button>
                  <span className="text-xs text-muted-foreground">Premium feature</span>
                </div>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center">
                  <Watch className="h-32 w-32 text-primary/30" />
                </div>
                <div className="absolute top-0 right-0 bg-card border shadow-sm rounded-lg p-3 max-w-[160px]">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Heart className="h-4 w-4 text-red-500" />
                    Heart Rate
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Connected to your mood data</p>
                </div>
                <div className="absolute bottom-0 left-0 bg-card border shadow-sm rounded-lg p-3 max-w-[160px]">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4 text-green-500" />
                    Steps & Activity
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Track impact on emotional wellbeing</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="py-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Why MoodMemo?</h2>
            <p className="text-muted-foreground">Benefits of regular journaling and mood tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Mental Health Support</h3>
                <p className="text-muted-foreground">
                  Regular journaling helps reduce stress, manage anxiety, and improve mood by providing a healthy outlet for emotions.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-4"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Self-Awareness</h3>
                <p className="text-muted-foreground">
                  Track patterns in your thoughts and emotions to gain insights into your triggers, behaviors, and reactions.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-4"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  See your growth over time and celebrate small wins on your journey toward better mental health.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Holistic Wellness</h3>
                <p className="text-muted-foreground">
                  Connect your mental, emotional and physical health data for a complete picture of your wellbeing.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {!isAuthenticated && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="py-10 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Start Your Wellness Journey Today</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join thousands of users who are improving their mental health one journal entry at a time.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="rounded-full px-8"
            >
              Create Your Account
            </Button>
          </motion.section>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Index;

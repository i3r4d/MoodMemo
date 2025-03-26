import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  SmileIcon,
  BrainCircuitIcon,
  Dumbbell as DumbbellIcon,
  LockIcon
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isPremium } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-primary text-white">
        <div className="container px-4 mx-auto text-center">
          <motion.h1
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            Welcome to MoodMemo
          </motion.h1>
          <motion.p
            className="text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          >
            Your personal mental wellbeing companion. Track your mood, gain insights, and discover exercises to improve your mental health.
          </motion.p>
          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {!isAuthenticated ? (
              <>
                <Button size="lg" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features section with text and icons */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mood Tracking */}
            <div className="rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-8 text-center h-full flex flex-col">
                <div className="mx-auto bg-blue-200 dark:bg-blue-800/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <SmileIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mood Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Track your emotional states over time with our intuitive mood journal.
                  Identify patterns and triggers affecting your mental wellbeing.
                </p>
                <div className="mt-auto pt-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                    <div className="text-sm text-left">
                      <p className="font-medium mb-2">Example:</p>
                      <p className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                        "Today I felt calm during my morning meditation, but anxious during the team meeting. I'll try deep breathing tomorrow before meetings."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-8 text-center h-full flex flex-col">
                <div className="mx-auto bg-purple-200 dark:bg-purple-800/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <BrainCircuitIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Gain personalized insights about your emotional patterns with our AI analysis.
                  Discover connections between activities, people, and your mental state.
                </p>
                <div className="mt-auto pt-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                    <div className="text-sm text-left">
                      <p className="font-medium mb-2">Example:</p>
                      <p className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-100 dark:border-purple-800">
                        "Your mood tends to improve after exercise. In the last month, you've reported feeling 'calm' or 'joy' in 85% of entries following physical activity."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercises */}
            <div className="rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
              <div className="bg-green-100 dark:bg-green-900/30 p-8 text-center h-full flex flex-col">
                <div className="mx-auto bg-green-200 dark:bg-green-800/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <DumbbellIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Exercises</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Access a library of guided meditation, breathing exercises, and relaxation techniques
                  to help manage stress and improve mental wellbeing.
                </p>
                <div className="mt-auto pt-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                    <div className="text-sm text-left">
                      <p className="font-medium mb-2">Example:</p>
                      <p className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
                        "Deep Breathing (5 min): A simple breathing exercise to reduce stress and anxiety. Practice daily for best results."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Benefits Section */}
      {!isPremium && (
        <section className="py-16 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Unlock Premium Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Ad-Free Experience */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="mx-auto bg-yellow-200 dark:bg-yellow-800/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                  <LockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ad-Free Experience</h3>
                <p className="text-gray-600 dark:text-gray-300">Enjoy an uninterrupted experience without any ads.</p>
              </div>

              {/* Unlimited Access */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="mx-auto bg-yellow-200 dark:bg-yellow-800/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                  <LockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Unlimited Access</h3>
                <p className="text-gray-600 dark:text-gray-300">Get unlimited access to all exercises, insights, and features.</p>
              </div>

              {/* Priority Support */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="mx-auto bg-yellow-200 dark:bg-yellow-800/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                  <LockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Priority Support</h3>
                <p className="text-gray-600 dark:text-gray-300">Receive priority support and faster assistance.</p>
              </div>
            </div>
            <Button className="mt-8" size="lg" onClick={() => navigate('/settings?tab=premium')}>
              Upgrade to Premium
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-6 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="container px-4 mx-auto text-center text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} MoodMemo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

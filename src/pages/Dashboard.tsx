
import React from 'react';
import { motion } from 'framer-motion';
import MoodDashboard from '@/components/MoodDashboard';
import AnimatedTransition from '@/components/AnimatedTransition';

const Dashboard = () => {
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

  return (
    <AnimatedTransition keyValue="dashboard">
      <div className="max-w-3xl mx-auto py-4">
        <h1 className="text-2xl font-bold mb-6">Your Mood Insights</h1>
        
        <MoodDashboard 
          moodDistribution={moodDistribution}
          weeklyMoodData={weeklyMoodData}
          entriesCount={entriesCount}
        />
      </div>
    </AnimatedTransition>
  );
};

export default Dashboard;

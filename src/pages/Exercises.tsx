
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ExerciseCard, { Exercise } from '@/components/ExerciseCard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, LockIcon } from 'lucide-react';

const Exercises = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Mock exercises data
  const exercises: Exercise[] = [
    {
      id: '1',
      title: 'Deep Breathing',
      description: 'A simple breathing exercise to help reduce stress and anxiety.',
      duration: 5,
      category: 'breathing',
      isPremium: false
    },
    {
      id: '2',
      title: 'Body Scan Meditation',
      description: 'Gradually scan your body for sensations, tension, and relaxation.',
      duration: 10,
      category: 'meditation',
      isPremium: false
    },
    {
      id: '3',
      title: 'Sleep Story: Ocean Waves',
      description: 'Gentle narration with ocean sounds to help you fall asleep.',
      duration: 20,
      category: 'sleep',
      isPremium: true
    },
    {
      id: '4',
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and relax different muscle groups to release physical tension.',
      duration: 15,
      category: 'relaxation',
      isPremium: false
    },
    {
      id: '5',
      title: 'Mindful Walking',
      description: 'A guided meditation to practice mindfulness while walking.',
      duration: 10,
      category: 'meditation',
      isPremium: false
    },
    {
      id: '6',
      title: 'Anxiety Relief',
      description: 'Quick techniques to help manage moments of high anxiety.',
      duration: 8,
      category: 'breathing',
      isPremium: true
    },
    {
      id: '7',
      title: 'Loving-Kindness Meditation',
      description: 'Cultivate feelings of goodwill, kindness, and warmth towards others.',
      duration: 12,
      category: 'meditation',
      isPremium: true
    },
    {
      id: '8',
      title: 'Morning Energizer',
      description: 'Start your day with positive energy and mindfulness.',
      duration: 7,
      category: 'meditation',
      isPremium: true
    },
    {
      id: '9',
      title: 'Stress Relief Visualization',
      description: 'Guided visualization to help you reduce stress and find calm.',
      duration: 15,
      category: 'relaxation',
      isPremium: true
    },
    {
      id: '10',
      title: '4-7-8 Breathing Technique',
      description: 'A breathing pattern that promotes relaxation and better sleep.',
      duration: 5,
      category: 'breathing',
      isPremium: false
    }
  ];
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'breathing', name: 'Breathing' },
    { id: 'relaxation', name: 'Relaxation' },
    { id: 'sleep', name: 'Sleep' }
  ];
  
  const filteredExercises = selectedCategory && selectedCategory !== 'all'
    ? exercises.filter(ex => ex.category === selectedCategory)
    : exercises;
    
  const handleExerciseClick = (exercise: Exercise) => {
    if (exercise.isPremium) {
      toast({
        title: "Premium Exercise",
        description: "This exercise is available with the premium subscription.",
        variant: "default",
      });
    } else {
      toast({
        title: "Starting Exercise",
        description: `Starting ${exercise.title} (${exercise.duration} min)`,
      });
    }
  };
  
  const handlePremiumClick = () => {
    toast({
      title: "Premium Subscription",
      description: "Upgrade to premium for $9.99/month to access all exercises and remove ads.",
    });
  };
  
  const handleCrisisResourcesClick = () => {
    toast({
      title: "Crisis Resources",
      description: "If you're in crisis, please call the National Suicide Prevention Lifeline at 988.",
      variant: "destructive",
    });
  };
  
  const freeExercisesCount = exercises.filter(ex => !ex.isPremium).length;
  const premiumExercisesCount = exercises.filter(ex => ex.isPremium).length;

  return (
    <AnimatedTransition keyValue="exercises">
      <div className="max-w-5xl mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Guided Exercises</h1>
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
        
        <div className="glass-morphism mood-journal-card p-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <span>Exercise Library</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                  {freeExercisesCount} Free
                </span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                  <LockIcon className="h-3 w-3" />
                  {premiumExercisesCount} Premium
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Guided meditations and exercises to improve mental wellbeing
              </p>
            </div>
            <Button onClick={handlePremiumClick} className="bg-gradient-to-r from-primary to-primary/80">
              Unlock All Exercises
            </Button>
          </div>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedCategory === category.id || (category.id === 'all' && !selectedCategory) 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary/30 text-secondary-foreground hover:bg-secondary/50'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Exercises grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map(exercise => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onClick={handleExerciseClick} 
            />
          ))}
        </div>
        
        {filteredExercises.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No exercises found in this category.
          </div>
        )}
        
        {/* Free version ad placeholder */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500 mt-10">
          <p>Free version supported by ethical ads. <span className="text-primary font-medium">Go premium to remove.</span></p>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Exercises;

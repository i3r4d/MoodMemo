
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ExerciseCard, { Exercise } from '@/components/ExerciseCard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { toast } from '@/hooks/use-toast';

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

  return (
    <AnimatedTransition keyValue="exercises">
      <div className="max-w-5xl mx-auto py-4">
        <h1 className="text-2xl font-bold mb-6">Guided Exercises</h1>
        
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
      </div>
    </AnimatedTransition>
  );
};

export default Exercises;

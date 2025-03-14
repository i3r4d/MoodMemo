
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: 'meditation' | 'breathing' | 'relaxation' | 'sleep';
  audioUrl?: string;
  isPremium: boolean;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  // Category icons
  const getCategoryIcon = (category: Exercise['category']) => {
    switch (category) {
      case 'meditation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="M2 12h10"></path>
            <path d="M12 2v10"></path>
            <path d="M12 12 8 8"></path>
          </svg>
        );
      case 'breathing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M3 16c0-1 2-2 2-2"></path>
            <path d="M7 19c0-1 2-2 2-2"></path>
            <path d="M11 18c0-1 2-2 2-2"></path>
            <path d="M15 17c0-1 2-2 2-2"></path>
            <path d="M3 12h10"></path>
            <path d="m13 12 4-4"></path>
          </svg>
        );
      case 'relaxation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M21 12h-3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a1 1 0 0 0-1-1h-2a1 1 0 0 1-1-1V8a1 1 0 0 0-1-1h-1"></path>
            <path d="M7 9h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h1"></path>
          </svg>
        );
      case 'sleep':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "glass-morphism mood-journal-card cursor-pointer",
        "transition-all duration-300 hover:shadow-xl",
        "flex flex-col justify-between h-full"
      )}
      onClick={() => onClick(exercise)}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center",
            "bg-primary/10 text-primary"
          )}>
            {getCategoryIcon(exercise.category)}
          </div>
          
          {exercise.isPremium && (
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              "bg-amber-100 text-amber-700"
            )}>
              Premium
            </span>
          )}
        </div>
        
        <div>
          <h3 className="font-medium line-clamp-1">{exercise.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {exercise.description}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-border text-sm">
        <span className="text-muted-foreground">
          {exercise.duration} min
        </span>
        
        <div className={cn(
          "flex items-center gap-1.5 text-primary",
          "hover:text-primary/80"
        )}>
          <span>Listen</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseCard;


import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MoodType, getMoodColor, getMoodDescription } from '@/utils/moodAnalysis';

interface MoodPickerProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType | null) => void;
}

const MoodPicker: React.FC<MoodPickerProps> = ({ selected, onSelect }) => {
  // Available moods from the MoodType
  const moods: MoodType[] = ['joy', 'calm', 'neutral', 'sad', 'stress'];

  // Variants for animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {moods.map((mood, index) => (
        <motion.div key={mood} variants={itemVariants} custom={index}>
          <Button
            type="button"
            variant={selected === mood ? "default" : "outline"}
            className="relative rounded-full px-3 py-1 text-sm transition-all duration-300 hover:shadow-md"
            style={{
              backgroundColor: selected === mood ? getMoodColor(mood) : 'transparent',
              color: selected === mood ? 'white' : getMoodColor(mood),
              borderColor: getMoodColor(mood)
            }}
            onClick={() => onSelect(mood)}
          >
            {getMoodDescription(mood)}
            {selected === mood && (
              <motion.span
                className="absolute inset-0 rounded-full bg-white opacity-20"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Button>
        </motion.div>
      ))}
      
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            type="button"
            variant="ghost"
            className="px-2 text-xs text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors"
            onClick={() => onSelect(null)}
          >
            Clear
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MoodPicker;

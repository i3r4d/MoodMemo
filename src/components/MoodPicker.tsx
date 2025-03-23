
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoodType, getMoodColor, getMoodDescription } from '@/utils/moodAnalysis';

interface MoodPickerProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType | null) => void;
}

const MoodPicker: React.FC<MoodPickerProps> = ({ selected, onSelect }) => {
  // Available moods from the MoodType
  const moods: MoodType[] = ['joy', 'calm', 'neutral', 'sad', 'stress'];

  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <Button
          key={mood}
          type="button"
          variant={selected === mood ? "default" : "outline"}
          className="relative rounded-full px-3 py-1 text-sm"
          style={{
            backgroundColor: selected === mood ? getMoodColor(mood) : 'transparent',
            color: selected === mood ? 'white' : getMoodColor(mood),
            borderColor: getMoodColor(mood)
          }}
          onClick={() => onSelect(mood)}
        >
          {getMoodDescription(mood)}
        </Button>
      ))}
      
      {selected && (
        <Button
          type="button"
          variant="ghost"
          className="px-2 text-xs text-muted-foreground"
          onClick={() => onSelect(null)}
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default MoodPicker;

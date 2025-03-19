
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodType } from '@/utils/moodAnalysis';
import MoodPicker from './MoodPicker';

interface TextJournalProps {
  onSaveEntry: (content: string, mood: MoodType | null) => void;
  isLoading?: boolean;
}

const TextJournal: React.FC<TextJournalProps> = ({ onSaveEntry, isLoading = false }) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Empty Journal Entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }
    
    onSaveEntry(content, selectedMood);
    setContent('');
    setSelectedMood(null);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Write in your journal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea 
            placeholder="How are you feeling today? What's on your mind?"
            className="min-h-[200px] resize-none focus-visible:ring-1"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
          
          <div>
            <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
            <MoodPicker selected={selectedMood} onSelect={setSelectedMood} />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Entry'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TextJournal;

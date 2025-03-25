
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/AnimatedTransition';
import MoodPicker from '@/components/MoodPicker';
import useJournalEntries from '@/hooks/useJournalEntries';
import { MoodType } from '@/types/journal';

const JournalEntry = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { entries, addEntry, updateEntry, deleteEntry } = useJournalEntries();
  const isNewEntry = id === 'new' || !id;
  
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodType | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!isNewEntry && id) {
      const entry = entries.find(e => e.id === id);
      if (entry) {
        setText(entry.text || '');
        setMood(entry.mood || null);
        setDate(new Date(entry.timestamp));
      } else {
        toast({
          title: "Entry not found",
          description: "The journal entry you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/journal');
      }
    }
  }, [id, entries, navigate, isNewEntry, toast]);
  
  const handleSave = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please add text for your journal entry.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const entryData = {
        id: isNewEntry ? crypto.randomUUID() : id!,
        text,
        audioUrl: null,
        mood,
        timestamp: date.toISOString(),
        tags: [],
      };
      
      if (isNewEntry) {
        addEntry(entryData);
        toast({
          title: "Entry saved",
          description: "Your journal entry has been saved successfully.",
        });
      } else {
        updateEntry(entryData);
        toast({
          title: "Entry updated",
          description: "Your journal entry has been updated successfully.",
        });
      }
      
      navigate('/journal');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Error",
        description: "There was an error saving your journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (isNewEntry) {
      navigate('/journal');
      return;
    }
    
    setIsLoading(true);
    
    try {
      deleteEntry(id!);
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted successfully.",
      });
      navigate('/journal');
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: "Error",
        description: "There was an error deleting your journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AnimatedTransition keyValue="journal-entry">
      <div className="max-w-3xl mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/journal')}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
          
          <div className="flex gap-2">
            {!isNewEntry && (
              <Button 
                variant="outline" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Entry
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <Input
              placeholder="Journal Entry"
              value={text.split('\n')[0] || ''}
              onChange={(e) => setText(e.target.value ? e.target.value + (text.indexOf('\n') > -1 ? text.substring(text.indexOf('\n')) : '') : '')}
              className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-sm font-medium mb-1.5">How are you feeling?</p>
              <MoodPicker 
                selected={mood} 
                onSelect={setMood} 
              />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1.5">Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <Textarea
              placeholder="Write your journal entry here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] resize-none"
            />
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default JournalEntry;


import React, { useState, useEffect } from 'react';
import AnimatedTransition from '@/components/AnimatedTransition';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  ChevronLeftIcon, 
  PlusIcon, 
  MicIcon, 
  PenIcon,
  TrashIcon,
  SpeakerIcon
} from 'lucide-react';
import MoodPicker from '@/components/MoodPicker';
import { useJournalStorage, JournalEntry } from '@/hooks/useJournalStorage';
import { format, isToday, isYesterday } from 'date-fns';
import TextJournal from '@/components/TextJournal';
import VoiceJournal from '@/components/VoiceJournal';
import { MoodType, analyzeMood, getMoodColor, getMoodDescription } from '@/utils/moodAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import ReportGenerator from '@/components/ReportGenerator';

type JournalMode = 'list' | 'create-text' | 'create-voice';

const Journal = () => {
  const [mode, setMode] = useState<JournalMode>('list');
  const [activeTab, setActiveTab] = useState<'recent' | 'moods'>('recent');
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodType>(null);
  const { toast } = useToast();
  const { entries, isLoading, addEntry, deleteEntry } = useJournalStorage();
  const { isPremium } = useAuth();

  // Reset form when changing to create mode
  useEffect(() => {
    if (mode === 'create-text' || mode === 'create-voice') {
      setText('');
      setMood(null);
    }
  }, [mode]);

  const handleCreateEntry = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Analyze mood if not manually selected
      const detectedMood = mood || await analyzeMood(text);
      
      // Add entry to journal storage
      await addEntry({
        text,
        audioUrl: null,
        timestamp: new Date().toISOString(),
        mood: detectedMood,
      });
      
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully.",
      });
      
      // Return to list view
      setMode('list');
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceJournalComplete = async (audioUrl: string | null, text: string) => {
    setSubmitting(true);
    
    try {
      if (!text && !audioUrl) {
        toast({
          title: "Empty Entry",
          description: "Please record audio or enter text for your journal entry.",
          variant: "destructive",
        });
        return;
      }
      
      // Analyze mood
      const detectedMood = await analyzeMood(text);
      
      // Add entry to journal storage
      await addEntry({
        text,
        audioUrl,
        timestamp: new Date().toISOString(),
        mood: detectedMood,
      });
      
      toast({
        title: "Entry Saved",
        description: "Your voice journal entry has been saved successfully.",
      });
      
      // Return to list view
      setMode('list');
    } catch (error) {
      console.error('Error creating voice journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your voice journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      toast({
        title: "Entry Deleted",
        description: "Your journal entry has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete your journal entry.",
        variant: "destructive",
      });
    }
  };

  const formatEntryDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy - h:mm a');
    }
  };

  const groupEntriesByDay = () => {
    const groups: Record<string, JournalEntry[]> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(entry);
    });
    
    return Object.entries(groups).map(([date, entries]) => ({
      date,
      formattedDate: format(new Date(date), 'EEEE, MMMM d, yyyy'),
      entries,
    }));
  };

  const renderContent = () => {
    if (mode === 'create-text') {
      return (
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => setMode('list')}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Journal
          </Button>
          
          <h2 className="text-xl font-semibold">New Journal Entry</h2>
          
          <TextJournal
            value={text}
            onChange={setText}
            onSubmit={handleCreateEntry}
            isSubmitting={submitting}
          />
          
          <div>
            <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
            <MoodPicker
              selected={mood}
              onSelect={setMood}
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleCreateEntry}
              disabled={submitting || !text.trim()}
            >
              {submitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </div>
      );
    }
    
    if (mode === 'create-voice') {
      return (
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => setMode('list')}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Journal
          </Button>
          
          <h2 className="text-xl font-semibold">Voice Journal</h2>
          <p className="text-muted-foreground">Record your thoughts and they'll be transcribed automatically.</p>
          
          <VoiceJournal
            onComplete={handleVoiceJournalComplete}
            isSubmitting={submitting}
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Journal</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => setMode('create-voice')}
            >
              <MicIcon className="h-4 w-4 mr-1" />
              Voice
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center"
              onClick={() => setMode('create-text')}
            >
              <PenIcon className="h-4 w-4 mr-1" />
              Write
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="recent" value={activeTab} onValueChange={(v) => setActiveTab(v as 'recent' | 'moods')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Entries</TabsTrigger>
            <TabsTrigger value="moods">Mood Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4 py-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="bg-secondary/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <PenIcon className="h-6 w-6 text-primary/60" />
                </div>
                <h3 className="font-medium text-lg">No journal entries yet</h3>
                <p className="text-muted-foreground">Start writing or recording to create your first entry.</p>
                <Button
                  variant="default"
                  onClick={() => setMode('create-text')}
                  className="mt-2"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create First Entry
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-8">
                  {groupEntriesByDay().map(group => (
                    <div key={group.date} className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {group.formattedDate}
                      </h3>
                      
                      <div className="space-y-3">
                        {group.entries.map(entry => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                              "glass-morphism mood-journal-card",
                              "relative group"
                            )}
                          >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {entry.mood && (
                              <div 
                                className="absolute -left-1 top-3 w-2 h-16 rounded-full" 
                                style={{ backgroundColor: getMoodColor(entry.mood) }}
                              />
                            )}
                            
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatEntryDate(entry.timestamp)}
                              </span>
                              {entry.mood && (
                                <span 
                                  className="text-xs font-medium px-2 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: `${getMoodColor(entry.mood)}30`,
                                    color: getMoodColor(entry.mood) 
                                  }}
                                >
                                  {getMoodDescription(entry.mood)}
                                </span>
                              )}
                            </div>
                            
                            <div className="whitespace-pre-wrap">
                              {entry.text}
                            </div>
                            
                            {entry.audioUrl && (
                              <div className="mt-3 pt-2 border-t flex items-center text-sm text-muted-foreground">
                                <SpeakerIcon className="h-4 w-4 mr-1" />
                                Audio recording available
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="moods" className="py-2">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Track your mood patterns over time to gain insights into your emotional well-being.
              </p>
              
              {entries.length < 3 ? (
                <div className="bg-secondary/20 rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-1">Not enough data</h3>
                  <p className="text-sm text-muted-foreground">
                    Add at least 3 journal entries to see your mood trends.
                  </p>
                </div>
              ) : (
                <div className="glass-morphism mood-journal-card">
                  <h3 className="font-medium mb-3">Recent Mood Distribution</h3>
                  
                  <div className="space-y-2">
                    {(['joy', 'calm', 'neutral', 'sad', 'stress'] as MoodType[]).map(moodType => {
                      if (!moodType) return null;
                      const count = entries.filter(entry => entry.mood === moodType).length;
                      const percentage = Math.round((count / entries.length) * 100);
                      
                      return (
                        <div key={moodType} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{getMoodDescription(moodType)}</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: getMoodColor(moodType)
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <ReportGenerator />
              
              {!isPremium && (
                <div className="relative mt-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">ADVERTISEMENT</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <AnimatedTransition keyValue="journal">
      <div className="max-w-3xl mx-auto py-4">
        {renderContent()}
      </div>
    </AnimatedTransition>
  );
};

export default Journal;

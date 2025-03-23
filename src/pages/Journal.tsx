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
  SpeakerIcon,
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ImageIcon,
  TagIcon,
  Plus,
  X,
  Watch,
  HeartPulse
} from 'lucide-react';
import MoodPicker from '@/components/MoodPicker';
import useJournalStorage from '@/hooks/useJournalStorage';
import { JournalEntry, MoodType, Prompt } from '@/types/journal';
import { format, isToday, isYesterday } from 'date-fns';
import TextJournal from '@/components/TextJournal';
import VoiceJournal from '@/components/VoiceJournal';
import { analyzeMood, getMoodColor, getMoodDescription } from '@/utils/moodAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import ReportGenerator from '@/components/ReportGenerator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import GuidedPrompts from '@/components/GuidedPrompts';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

type JournalMode = 'list' | 'create-text' | 'create-voice';

const Journal = () => {
  const [mode, setMode] = useState<JournalMode>('list');
  const [activeTab, setActiveTab] = useState<'recent' | 'moods'>('recent');
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodType | null>(null);
  const { toast } = useToast();
  const { entries, isLoading, addEntry, deleteEntry } = useJournalStorage();
  const { isPremium } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [moodIntensity, setMoodIntensity] = useState<number>(5);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [template, setTemplate] = useState<string>('');
  const [formatting, setFormatting] = useState({ bold: false, italic: false, list: false });
  const [showPrompts, setShowPrompts] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<{
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: string[];
    suggestions: string[];
    summary: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'create-text' || mode === 'create-voice') {
      setText('');
      setMood(null);
    }
  }, [mode]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const analyzeSentiment = async (text: string) => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { text }
      });

      if (error) throw error;
      setSentimentAnalysis(data);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze sentiment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    toast({
      title: 'Suggestion Applied',
      description: 'The suggestion has been added to your entry.',
    });
  };

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
      await analyzeSentiment(text);
      
      const detectedMood = mood || await analyzeMood(text);
      
      const entryId = await addEntry({
        text,
        audioUrl: null,
        timestamp: new Date().toISOString(),
        mood: detectedMood,
        moodIntensity,
        tags,
        template: selectedTemplate,
        formatting,
        sentimentAnalysis: sentimentAnalysis,
      });
      
      console.log('Journal entry saved with ID:', entryId);
      
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully.",
      });
      
      setText('');
      setMood(null);
      setMoodIntensity(5);
      setTags([]);
      setSelectedTemplate(null);
      setMode('list');
      setFormatting({ bold: false, italic: false, list: false });
      setSentimentAnalysis(null);
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
      
      const detectedMood = await analyzeMood(text);
      
      await addEntry({
        text,
        audioUrl,
        timestamp: new Date().toISOString(),
        mood: detectedMood,
        tags: [],
        formatting,
      });
      
      toast({
        title: "Entry Saved",
        description: "Your voice journal entry has been saved successfully.",
      });
      
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

  const templates = [
    { id: 'gratitude', name: 'Gratitude Journal', content: 'Today I am grateful for:\n\n1.\n2.\n3.' },
    { id: 'reflection', name: 'Daily Reflection', content: 'Today\'s Highlights:\n\nChallenges:\n\nTomorrow\'s Goals:' },
    { id: 'mood', name: 'Mood Analysis', content: 'Current Mood:\n\nTriggers:\n\nCoping Strategies:' },
  ];

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setTemplate(templateId);
      setText(selectedTemplate.content);
    }
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setText(prompt.prompt_text || prompt.content);
    setShowPrompts(false);
    toast({
      title: 'Prompt Selected',
      description: 'Start writing your response to the prompt.',
    });
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
          
          {isPremium && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <div className="flex gap-2">
                <Select value={template} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowPrompts(!showPrompts)}
                >
                  {showPrompts ? 'Hide Prompts' : 'Show Guided Prompts'}
                </Button>
              </div>
            </div>
          )}

          {showPrompts && (
            <GuidedPrompts
              currentMood={mood}
              onSelectPrompt={handlePromptSelect}
            />
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Mood</label>
            <div className="flex gap-2">
              <Button
                variant={mood === 'joy' ? 'default' : 'outline'}
                onClick={() => setMood('joy')}
              >
                😊 Joyful
              </Button>
              <Button
                variant={mood === 'neutral' ? 'default' : 'outline'}
                onClick={() => setMood('neutral')}
              >
                😐 Neutral
              </Button>
              <Button
                variant={mood === 'sad' ? 'default' : 'outline'}
                onClick={() => setMood('sad')}
              >
                😢 Sad
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1 border-b pb-2">
              <ToggleGroup type="multiple" size="sm">
                <ToggleGroupItem value="bold" aria-label="Toggle bold">
                  <BoldIcon className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic">
                  <ItalicIcon className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Toggle list">
                  <ListIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TextJournal
              value={text}
              onChange={setText}
              onSubmit={handleCreateEntry}
              isSubmitting={submitting}
              formatting={formatting}
              onFormattingChange={setFormatting}
            />
          </div>
          
          {sentimentAnalysis && (
            <SentimentAnalysis
              {...sentimentAnalysis}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
              <MoodPicker
                selected={mood}
                onSelect={setMood}
              />
            </div>
            
            {mood && (
              <div className="space-y-2">
                <Label>Mood Intensity (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={moodIntensity}
                    onChange={(e) => setMoodIntensity(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{moodIntensity}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary/80"
                  >
                    ×
                  </button>
                </span>
              ))}
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-24"
              />
            </div>
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMode('create-voice')}
              className="gap-2"
            >
              <MicIcon className="h-4 w-4" />
              Voice Entry
            </Button>
            <Button
              onClick={() => setMode('create-text')}
              className="gap-2"
            >
              <PenIcon className="h-4 w-4" />
              Text Entry
            </Button>
          </div>
        </div>

        <div className="glass-morphism mood-journal-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <textarea
                placeholder="How are you feeling today? Write your thoughts here..."
                className="w-full min-h-[100px] p-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleCreateEntry}
                disabled={submitting || !text.trim()}
                className="h-full"
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode('create-voice')}
                className="h-full"
              >
                <MicIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
            <MoodPicker
              selected={mood}
              onSelect={setMood}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'recent' | 'moods')}>
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
                  {console.log('Rendering entries:', entries)}
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
        
        {isPremium ? (
          <Card className="mt-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Connect Your Health Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-3/4">
                  <p className="text-muted-foreground mb-4">
                    Take your journaling to the next level by connecting your smartwatch or fitness tracker. Sync health data to gain deeper insights into how your physical wellbeing affects your mood.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm">See how your sleep quality affects your next-day mood</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm">Identify how exercise impacts your emotional wellbeing</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm">Get deeper AI insights combining health data and journal entries</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/settings?tab=devices')}
                    className="mt-2"
                  >
                    <Watch className="h-4 w-4 mr-2" />
                    Connect Device
                  </Button>
                </div>
                <div className="md:w-1/4 flex justify-center items-center">
                  <div className="bg-primary/5 rounded-full p-6">
                    <Watch className="h-16 w-16 text-primary/40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Premium Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Upgrade to premium to connect your smartwatch or fitness tracker and gain deeper insights into how your physical wellbeing affects your mood.
              </p>
              <Button 
                onClick={() => navigate('/settings')}
                className="mt-2"
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Journal;

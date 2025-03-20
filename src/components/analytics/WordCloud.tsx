
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface WordCloudProps {
  dateRange: { start: Date; end: Date } | null;
}

interface WordData {
  text: string;
  value: number;
}

export function WordCloud({ dateRange }: WordCloudProps) {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchWordCloudData();
  }, [dateRange]);

  const fetchWordCloudData = async () => {
    try {
      setLoading(true);

      // Get journal entries and process the words
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('text')
        .gte('timestamp', dateRange?.start.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('timestamp', dateRange?.end.toISOString() || new Date().toISOString());

      if (error) throw error;

      // Process text to get word frequencies
      const wordCount: Record<string, number> = {};
      const stopWords = ['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'for', 'was', 'on', 'with', 'my'];
      
      entries.forEach((entry: any) => {
        if (!entry.text) return;
        
        const words = entry.text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((word: string) => word.length > 2 && !stopWords.includes(word));
          
        words.forEach((word: string) => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
      });
      
      // Convert to array and sort by frequency
      const wordData = Object.entries(wordCount)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50); // Get top 50 words

      setWords(wordData);
    } catch (error) {
      console.error('Error fetching word cloud data:', error);
      toast({
        title: t('analytics.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {t('analytics.no_data')}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-wrap justify-center items-center p-4">
      {words.map((word, index) => (
        <div
          key={word.text}
          className="m-2 p-2 rounded-md"
          style={{
            fontSize: `${Math.max(1, Math.min(5, word.value / 2))}rem`,
            opacity: 0.6 + (word.value / (words[0].value * 2)),
            color: index % 5 === 0 ? '#3b82f6' : 
                   index % 5 === 1 ? '#10b981' : 
                   index % 5 === 2 ? '#6366f1' : 
                   index % 5 === 3 ? '#f59e0b' : 
                   '#ef4444',
          }}
        >
          {word.text}
        </div>
      ))}
    </div>
  );
}

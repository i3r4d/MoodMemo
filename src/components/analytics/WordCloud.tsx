import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import ReactWordcloud from 'react-wordcloud';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

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

      const { data, error } = await supabase
        .rpc('get_word_cloud_data', {
          start_date: dateRange?.start.toISOString(),
          end_date: dateRange?.end.toISOString(),
        });

      if (error) throw error;

      const wordData: WordData[] = data.map((word: any) => ({
        text: word.word,
        value: word.count,
      }));

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
    <div className="w-full h-full">
      <ReactWordcloud
        words={words}
        options={{
          rotations: 2,
          rotationAngles: [0, 90],
          fontSizes: [12, 60],
          padding: 5,
          fontFamily: 'Inter, sans-serif',
          colors: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'],
          enableTooltip: true,
          deterministic: true,
        }}
      />
    </div>
  );
} 
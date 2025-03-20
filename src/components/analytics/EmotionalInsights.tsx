import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, Calendar } from 'lucide-react';

interface EmotionalInsightsProps {
  dateRange: { start: Date; end: Date } | null;
}

interface EmotionalData {
  dominant_emotion: string;
  emotion_percentage: number;
  trend: 'up' | 'down' | 'stable';
  peak_time: string;
  peak_day: string;
  emotional_stability: number;
}

export function EmotionalInsights({ dateRange }: EmotionalInsightsProps) {
  const [data, setData] = useState<EmotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchEmotionalData();
  }, [dateRange]);

  const fetchEmotionalData = async () => {
    try {
      setLoading(true);

      const { data: emotionalData, error } = await supabase
        .rpc('get_emotional_insights', {
          start_date: dateRange?.start.toISOString(),
          end_date: dateRange?.end.toISOString(),
        });

      if (error) throw error;

      setData(emotionalData);
    } catch (error) {
      console.error('Error fetching emotional data:', error);
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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {t('analytics.no_data')}
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('analytics.dominant_emotion')}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">{data.dominant_emotion}</span>
            {getTrendIcon(data.trend)}
          </div>
        </div>
        <Progress value={data.emotion_percentage} className="h-2" />
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-4 h-4" />
          <h3 className="font-semibold">{t('analytics.peak_time')}</h3>
        </div>
        <p className="text-lg">{data.peak_time}</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4" />
          <h3 className="font-semibold">{t('analytics.peak_day')}</h3>
        </div>
        <p className="text-lg">{data.peak_day}</p>
      </Card>

      <Card className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold">{t('analytics.emotional_stability')}</h3>
        </div>
        <Progress value={data.emotional_stability} className="h-2" />
        <p className="text-sm text-muted-foreground mt-1">
          {t('analytics.stability_description')}
        </p>
      </Card>
    </div>
  );
} 
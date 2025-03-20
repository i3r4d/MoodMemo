
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface WritingPatternsProps {
  dateRange: { start: Date; end: Date } | null;
}

interface PatternData {
  hour: number;
  count: number;
  average_sentiment: number;
}

export function WritingPatterns({ dateRange }: WritingPatternsProps) {
  const [data, setData] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatternData();
  }, [dateRange]);

  const fetchPatternData = async () => {
    try {
      setLoading(true);

      // Simplified query to get hour distribution without using RPC
      const { data: journalEntries, error } = await supabase
        .from('journal_entries')
        .select('timestamp, sentiment_score')
        .gte('timestamp', dateRange?.start.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('timestamp', dateRange?.end.toISOString() || new Date().toISOString());

      if (error) throw error;

      // Process data to group by hour
      const hourData: Record<number, {count: number, sentiment_total: number}> = {};
      
      // Initialize all hours
      for (let i = 0; i < 24; i++) {
        hourData[i] = {count: 0, sentiment_total: 0};
      }
      
      // Fill with actual data
      journalEntries.forEach((entry: any) => {
        const hour = new Date(entry.timestamp).getHours();
        hourData[hour].count += 1;
        
        if (entry.sentiment_score !== null) {
          hourData[hour].sentiment_total += entry.sentiment_score;
        }
      });
      
      // Transform to array format
      const formattedData = Object.entries(hourData).map(([hour, data]) => ({
        hour: `${hour}:00`,
        count: data.count,
        average_sentiment: data.count > 0 ? data.sentiment_total / data.count : 0
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching pattern data:', error);
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

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {t('analytics.no_data')}
      </div>
    );
  }

  const chartData = data.map(item => ({
    hour: item.hour,
    entries: item.count,
    sentiment: item.average_sentiment,
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="hour"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value}
          />
          <PolarRadiusAxis
            orientation="left"
            tick={{ fontSize: 12 }}
            domain={[0, 'dataMax']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const sentimentValue = typeof payload[1]?.value === 'number' 
                  ? payload[1].value.toFixed(2) 
                  : payload[1]?.value || '0';
                  
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm">
                      {t('analytics.entries')}: {payload[0].value}
                    </p>
                    <p className="text-sm">
                      {t('analytics.sentiment')}: {sentimentValue}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            name={t('analytics.entries')}
            dataKey="entries"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Radar
            name={t('analytics.sentiment')}
            dataKey="sentiment"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

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

      const { data: patternData, error } = await supabase
        .rpc('get_writing_patterns', {
          start_date: dateRange?.start.toISOString(),
          end_date: dateRange?.end.toISOString(),
        });

      if (error) throw error;

      const formattedData = patternData.map((item: any) => ({
        hour: item.hour,
        count: item.count,
        average_sentiment: item.average_sentiment,
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
    hour: `${item.hour}:00`,
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
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 12 }}
            domain={[0, 'dataMax']}
          />
          <PolarRadiusAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            domain={[-1, 1]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm">
                      {t('analytics.entries')}: {payload[0].value}
                    </p>
                    <p className="text-sm">
                      {t('analytics.sentiment')}: {payload[1].value.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            yAxisId="left"
            name={t('analytics.entries')}
            dataKey="entries"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Radar
            yAxisId="right"
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
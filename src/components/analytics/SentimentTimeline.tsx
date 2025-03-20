
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SentimentTimelineProps {
  dateRange: { start: Date; end: Date } | null;
}

interface SentimentData {
  date: string;
  sentiment: number;
  count: number;
}

export function SentimentTimeline({ dateRange }: SentimentTimelineProps) {
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchSentimentData();
  }, [dateRange]);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);

      // For now, using a query that doesn't require an RPC function
      const { data: journalEntries, error } = await supabase
        .from('journal_entries')
        .select('timestamp, sentiment_score')
        .gte('timestamp', dateRange?.start.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('timestamp', dateRange?.end.toISOString() || new Date().toISOString());

      if (error) throw error;

      // Process the data to group by date
      const dataByDate = journalEntries.reduce((acc: Record<string, {total: number, count: number}>, entry: any) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 };
        }
        if (entry.sentiment_score !== null) {
          acc[date].total += entry.sentiment_score;
          acc[date].count += 1;
        }
        return acc;
      }, {});

      const formattedData = Object.entries(dataByDate).map(([date, values]) => ({
        date,
        sentiment: values.count > 0 ? values.total / values.count : 0,
        count: values.count,
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
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

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 12 }}
            domain={[-1, 1]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            domain={[0, 'dataMax']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const sentimentValue = typeof payload[0].value === 'number' 
                  ? payload[0].value.toFixed(2) 
                  : payload[0].value;
                  
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm">
                      {t('analytics.sentiment')}: {sentimentValue}
                    </p>
                    <p className="text-sm">
                      {t('analytics.entries')}: {payload[1].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sentiment"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name={t('analytics.sentiment')}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name={t('analytics.entries')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

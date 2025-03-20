import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MoodTagCorrelationProps {
  dateRange: { start: Date; end: Date } | null;
}

interface CorrelationData {
  tag: string;
  mood: string;
  count: number;
  correlation: number;
}

export function MoodTagCorrelation({ dateRange }: MoodTagCorrelationProps) {
  const [data, setData] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchCorrelationData();
  }, [dateRange]);

  const fetchCorrelationData = async () => {
    try {
      setLoading(true);

      const { data: correlationData, error } = await supabase
        .rpc('get_mood_tag_correlation', {
          start_date: dateRange?.start.toISOString(),
          end_date: dateRange?.end.toISOString(),
        });

      if (error) throw error;

      const formattedData = correlationData.map((item: any) => ({
        tag: item.tag,
        mood: item.mood,
        count: item.count,
        correlation: item.correlation,
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching correlation data:', error);
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

  // Group data by tag for stacked bar chart
  const groupedData = data.reduce((acc: any, item) => {
    if (!acc[item.tag]) {
      acc[item.tag] = { tag: item.tag };
    }
    acc[item.tag][item.mood] = item.count;
    return acc;
  }, {});

  const chartData = Object.values(groupedData);
  const moods = [...new Set(data.map(item => item.mood))];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="tag"
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 'dataMax']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any) => (
                      <p key={entry.name} className="text-sm">
                        {entry.name}: {entry.value}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {moods.map((mood, index) => (
            <Bar
              key={mood}
              dataKey={mood}
              stackId="a"
              fill={`hsl(${index * (360 / moods.length)}, 70%, 50%)`}
              name={mood}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 
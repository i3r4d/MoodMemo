import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Activity, Heart, Moon, TrendingUp } from 'lucide-react';

interface HealthMetric {
  timestamp: string;
  metric_type: string;
  value: number;
  unit: string;
  source: string;
}

interface Correlation {
  metric_type: string;
  correlation: number;
  sample_size: number;
}

const HealthMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('heart_rate');
  const { toast } = useToast();

  useEffect(() => {
    fetchHealthMetrics();
    fetchCorrelations();
  }, []);

  const fetchHealthMetrics = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_health_metrics', {
          p_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          p_end_date: new Date().toISOString(),
          p_metric_type: selectedMetric
        });

      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch health metrics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCorrelations = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_health_mood_correlation', {
          p_days: 30
        });

      if (error) throw error;
      setCorrelations(data);
    } catch (error) {
      console.error('Error fetching correlations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch correlations. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'heart_rate':
        return <Heart className="h-4 w-4" />;
      case 'sleep_duration':
        return <Moon className="h-4 w-4" />;
      case 'steps':
        return <Activity className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getMetricLabel = (metricType: string) => {
    switch (metricType) {
      case 'heart_rate':
        return 'Heart Rate';
      case 'sleep_duration':
        return 'Sleep Duration';
      case 'steps':
        return 'Steps';
      default:
        return metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'bpm':
        return `${Math.round(value)} bpm`;
      case 'minutes':
        return `${Math.round(value)} min`;
      case 'count':
        return `${Math.round(value)} steps`;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getMetricIcon(selectedMetric)}
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No health metrics available. Connect a device to see your data.
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      formatValue(value, metrics[0]?.unit || ''),
                      getMetricLabel(name)
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name={selectedMetric}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Mood Correlations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {correlations.map((correlation) => (
                <div key={correlation.metric_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(correlation.metric_type)}
                    <span>{getMetricLabel(correlation.metric_type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      correlation.correlation > 0.3 ? 'text-green-600' :
                      correlation.correlation < -0.3 ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {Math.round(correlation.correlation * 100)}% correlation
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({correlation.sample_size} samples)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthMetrics; 
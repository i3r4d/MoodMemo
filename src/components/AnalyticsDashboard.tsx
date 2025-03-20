import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WordCloud } from './analytics/WordCloud';
import { SentimentTimeline } from './analytics/SentimentTimeline';
import { MoodTagCorrelation } from './analytics/MoodTagCorrelation';
import { WritingPatterns } from './analytics/WritingPatterns';
import { EmotionalInsights } from './analytics/EmotionalInsights';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Dashboard {
  id: string;
  name: string;
  layout: any[];
}

interface Widget {
  id: string;
  type: string;
  title: string;
  config: any;
  position: any;
}

const WIDGET_TYPES = {
  wordCloud: 'wordCloud',
  sentimentTimeline: 'sentimentTimeline',
  moodTagCorrelation: 'moodTagCorrelation',
  writingPatterns: 'writingPatterns',
  emotionalInsights: 'emotionalInsights',
};

const WIDGET_TITLES = {
  [WIDGET_TYPES.wordCloud]: 'Word Cloud',
  [WIDGET_TYPES.sentimentTimeline]: 'Sentiment Timeline',
  [WIDGET_TYPES.moodTagCorrelation]: 'Mood vs Tags',
  [WIDGET_TYPES.writingPatterns]: 'Writing Patterns',
  [WIDGET_TYPES.emotionalInsights]: 'Emotional Insights',
};

export function AnalyticsDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      // Fetch dashboard
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('analytics_dashboards')
        .select('*')
        .single();

      if (dashboardError) throw dashboardError;
      setDashboard(dashboardData);

      // Fetch widgets
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('analytics_widgets')
        .select('*')
        .eq('dashboard_id', dashboardData.id)
        .order('created_at');

      if (widgetsError) throw widgetsError;
      setWidgets(widgetsData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: t('analytics.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWidget = async (type: string) => {
    try {
      const newWidget = {
        type,
        title: WIDGET_TITLES[type],
        config: {},
        position: { x: 0, y: 0, w: 6, h: 4 },
      };

      const { data, error } = await supabase
        .from('analytics_widgets')
        .insert({
          dashboard_id: dashboard?.id,
          ...newWidget,
        })
        .select()
        .single();

      if (error) throw error;
      setWidgets([...widgets, data]);
    } catch (error) {
      console.error('Error adding widget:', error);
      toast({
        title: t('analytics.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from('analytics_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;
      setWidgets(widgets.filter(w => w.id !== widgetId));
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: t('analytics.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLayoutChange = async (layout: any[]) => {
    try {
      // Update dashboard layout
      const { error: dashboardError } = await supabase
        .from('analytics_dashboards')
        .update({ layout })
        .eq('id', dashboard?.id);

      if (dashboardError) throw dashboardError;

      // Update widget positions
      const updates = layout.map(item => ({
        id: item.i,
        position: { x: item.x, y: item.y, w: item.w, h: item.h },
      }));

      const { error: widgetsError } = await supabase
        .from('analytics_widgets')
        .upsert(updates);

      if (widgetsError) throw widgetsError;

      setDashboard({ ...dashboard!, layout });
      setWidgets(widgets.map(w => {
        const update = updates.find(u => u.id === w.id);
        return update ? { ...w, position: update.position } : w;
      }));
    } catch (error) {
      console.error('Error updating layout:', error);
      toast({
        title: t('analytics.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      dateRange,
      key: widget.id,
    };

    switch (widget.type) {
      case WIDGET_TYPES.wordCloud:
        return <WordCloud {...commonProps} />;
      case WIDGET_TYPES.sentimentTimeline:
        return <SentimentTimeline {...commonProps} />;
      case WIDGET_TYPES.moodTagCorrelation:
        return <MoodTagCorrelation {...commonProps} />;
      case WIDGET_TYPES.writingPatterns:
        return <WritingPatterns {...commonProps} />;
      case WIDGET_TYPES.emotionalInsights:
        return <EmotionalInsights {...commonProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">{dashboard?.name || t('analytics.dashboard')}</h2>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-[300px]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditing ? t('analytics.done') : t('analytics.edit')}
          </Button>
          {isEditing && (
            <Select onValueChange={handleAddWidget}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('analytics.add_widget')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WIDGET_TITLES).map(([type, title]) => (
                  <SelectItem key={type} value={type}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: dashboard?.layout || [] }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map((widget) => (
          <Card key={widget.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{widget.title}</h3>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteWidget(widget.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {renderWidget(widget)}
          </Card>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
} 
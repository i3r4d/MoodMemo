
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { WordCloud } from './analytics/WordCloud';
import { SentimentTimeline } from './analytics/SentimentTimeline';
import { MoodTagCorrelation } from './analytics/MoodTagCorrelation';
import { WritingPatterns } from './analytics/WritingPatterns';
import { EmotionalInsights } from './analytics/EmotionalInsights';

interface Widget {
  id: string;
  type: string;
  title: string;
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
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', type: WIDGET_TYPES.wordCloud, title: WIDGET_TITLES[WIDGET_TYPES.wordCloud] },
    { id: '2', type: WIDGET_TYPES.sentimentTimeline, title: WIDGET_TITLES[WIDGET_TYPES.sentimentTimeline] }
  ]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleAddWidget = (type: string) => {
    const newWidget = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title: WIDGET_TITLES[type],
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
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
          <h2 className="text-2xl font-bold">{t('analytics.dashboard')}</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((widget) => (
          <Card key={widget.id} className="p-4 h-80">
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
            <div className="h-[calc(100%-2rem)]">
              {renderWidget(widget)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

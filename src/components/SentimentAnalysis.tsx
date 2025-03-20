import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Brain, Lightbulb, TrendingUp } from 'lucide-react';

interface SentimentAnalysisProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: string[];
  suggestions: string[];
  summary: string;
  onSuggestionClick?: (suggestion: string) => void;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  sentiment,
  confidence,
  emotions,
  suggestions,
  summary,
  onSuggestionClick,
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Emotional Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Sentiment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <h3 className="font-medium">Overall Sentiment</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSentimentColor(sentiment)}>
              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            </Badge>
            <span className={`text-sm ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
        </div>

        {/* Emotions Detected */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <h3 className="font-medium">Emotions Detected</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emotion, index) => (
              <Badge key={index} variant="secondary">
                {emotion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <h3 className="font-medium">Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <h3 className="font-medium">Personalized Suggestions</h3>
          </div>
          <ScrollArea className="h-[100px]">
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis; 
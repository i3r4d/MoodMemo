import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, StarHalf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Prompt {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt_text: string;
  follow_up_questions: string[];
  relevance_score: number;
}

interface GuidedPromptsProps {
  currentMood: 'happy' | 'neutral' | 'sad';
  onSelectPrompt: (prompt: Prompt) => void;
}

const GuidedPrompts: React.FC<GuidedPromptsProps> = ({ currentMood, onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPrompts();
  }, [currentMood]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_personalized_prompts', {
          p_user_id: user?.id,
          p_mood: currentMood,
          p_limit: 5
        });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load journaling prompts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (promptId: string, rating: number) => {
    try {
      const { error } = await supabase
        .rpc('update_prompt_preferences', {
          p_user_id: user?.id,
          p_prompt_id: promptId,
          p_rating: rating
        });

      if (error) throw error;
      
      // Update local state
      setPrompts(prev => prev.map(prompt => 
        prompt.id === promptId 
          ? { ...prompt, user_rating: rating }
          : prompt
      ));

      toast({
        title: 'Success',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      console.error('Error updating prompt rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to update prompt rating.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onSelectPrompt(prompt)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{prompt.title}</h3>
                  <Badge variant="secondary">{prompt.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{prompt.description}</p>
                <p className="font-medium">{prompt.prompt_text}</p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRating(prompt.id, rating);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {rating <= (prompt.user_rating || 0) ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarHalf className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            {prompt.follow_up_questions && prompt.follow_up_questions.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p className="font-medium">Follow-up questions:</p>
                <ul className="list-disc list-inside">
                  {prompt.follow_up_questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GuidedPrompts; 
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url?: string;
  video_url?: string;
  order_index: number;
}

export function OnboardingTutorial() {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadTutorialSteps();
  }, []);

  const loadTutorialSteps = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_onboarding_tutorial');

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error loading tutorial steps:', error);
      toast({
        title: t('tutorial.error'),
        description: t('tutorial.error_description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markStepCompleted = async (stepId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('mark_tutorial_completed', {
          p_user_id: user.id,
          p_content_id: stepId,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking step as completed:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      await markStepCompleted(steps[currentStep].id);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      // Mark all remaining steps as completed
      const remainingSteps = steps.slice(currentStep);
      await Promise.all(
        remainingSteps.map(step => markStepCompleted(step.id))
      );
      
      toast({
        title: t('tutorial.skipped'),
        description: t('tutorial.skipped_description'),
      });
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Progress value={progress} className="w-full" />

        <div className="space-y-4">
          {currentStepData.image_url && (
            <img
              src={currentStepData.image_url}
              alt={currentStepData.title}
              className="w-full rounded-lg"
            />
          )}
          {currentStepData.video_url && (
            <video
              src={currentStepData.video_url}
              controls
              className="w-full rounded-lg"
            />
          )}
          <div className="prose prose-sm max-w-none">
            {currentStepData.content}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('tutorial.previous')}
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              t('tutorial.finish')
            ) : (
              <>
                {t('tutorial.next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
} 
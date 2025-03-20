import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const InsightsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { toast } = useToast();
  const router = useRouter();

  const handleUpgradeClick = () => {
    router.push('/settings?tab=premium');
  };

  const handleExerciseClick = () => {
    router.push('/exercises/breathing');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold">{t('insights.title')}</h1>
        <p className="text-muted-foreground">{t('insights.description')}</p>
      </motion.div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{t('insights.aiInsights')}</h2>
            {!isPremium && (
              <Button
                variant="outline"
                onClick={handleUpgradeClick}
                className="text-sm"
              >
                {t('insights.upgradeToPremium')}
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            <div className={cn(
              "p-4 rounded-lg border border-primary/20 bg-primary/5",
              "flex items-start gap-3"
            )}>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm leading-relaxed">
                  {t('insights.moodTrend')}
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-primary hover:text-primary/80"
                  onClick={handleExerciseClick}
                >
                  {t('insights.tryBreathingExercise')} →
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-accent-foreground">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                </svg>
              </div>
              
              <div className="space-y-1 text-sm leading-relaxed">
                <p>{t('insights.journalingPattern')}</p>
                <p>{t('insights.sleepQuality')}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* AI Insights Report Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{t('insights.aiReport')}</h2>
            {!isPremium && (
              <Button
                variant="outline"
                onClick={handleUpgradeClick}
                className="text-sm"
              >
                {t('insights.upgradeToPremium')}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('insights.reportDescription')}
            </p>

            {!user ? (
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <p className="text-sm text-destructive">
                  {t('insights.loginRequired')}
                </p>
              </div>
            ) : !isPremium ? (
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <p className="text-sm text-destructive">
                  {t('insights.premiumRequired')}
                </p>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  toast({
                    title: t('insights.reportGenerationStarted'),
                    description: t('insights.reportGenerationDescription'),
                  });
                }}
              >
                {t('insights.generateReport')}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default InsightsPage; 
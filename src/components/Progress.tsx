import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Gift, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  icon_url: string;
  progress: number;
  completed_at: string | null;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: string;
  value: string;
  unlocked_at: string | null;
}

const LEVEL_COLORS = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-500',
};

export function Progress() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .order('completed_at', { ascending: false });

      if (achievementsError) throw achievementsError;

      const formattedAchievements = achievementsData.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        level: ua.achievement.level,
        requirement: ua.achievement.requirement,
        icon_url: ua.achievement.icon_url,
        progress: ua.progress,
        completed_at: ua.completed_at,
      }));

      setAchievements(formattedAchievements);

      // Fetch streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .single();

      if (streakError) throw streakError;
      setStreak(streakData);

      // Fetch rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:rewards(*)
        `)
        .order('unlocked_at', { ascending: false });

      if (rewardsError) throw rewardsError;

      const formattedRewards = rewardsData.map(ur => ({
        id: ur.reward.id,
        name: ur.reward.name,
        description: ur.reward.description,
        type: ur.reward.type,
        value: ur.reward.value,
        unlocked_at: ur.unlocked_at,
      }));

      setRewards(formattedRewards);
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast({
        title: t('progress.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    <Tabs defaultValue="streak" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="streak">
          <Flame className="w-4 h-4 mr-2" />
          {t('progress.streak')}
        </TabsTrigger>
        <TabsTrigger value="achievements">
          <Trophy className="w-4 h-4 mr-2" />
          {t('progress.achievements')}
        </TabsTrigger>
        <TabsTrigger value="rewards">
          <Gift className="w-4 h-4 mr-2" />
          {t('progress.rewards')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="streak" className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('progress.current_streak')}</h3>
              <Badge variant="secondary" className="text-lg">
                {streak?.current_streak || 0} {t('progress.days')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('progress.longest_streak')}</h3>
              <Badge variant="secondary" className="text-lg">
                {streak?.longest_streak || 0} {t('progress.days')}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('progress.next_achievement')}</span>
                <span>{streak?.current_streak || 0}/7 {t('progress.days')}</span>
              </div>
              <ProgressBar value={((streak?.current_streak || 0) / 7) * 100} />
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="achievements" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <Badge className={LEVEL_COLORS[achievement.level]}>
                    {achievement.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                {!achievement.completed_at && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('progress.progress')}</span>
                      <span>{achievement.progress}/{achievement.requirement}</span>
                    </div>
                    <ProgressBar
                      value={(achievement.progress / achievement.requirement) * 100}
                    />
                  </div>
                )}
                {achievement.completed_at && (
                  <div className="flex items-center text-sm text-green-500">
                    <Target className="w-4 h-4 mr-1" />
                    {t('progress.completed')}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="rewards" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{reward.name}</h3>
                  {reward.unlocked_at ? (
                    <Badge variant="secondary">{t('progress.unlocked')}</Badge>
                  ) : (
                    <Badge variant="outline">{t('progress.locked')}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reward.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
} 
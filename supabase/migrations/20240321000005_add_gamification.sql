-- Create enum for achievement types
CREATE TYPE achievement_type AS ENUM (
  'streak',
  'entries',
  'exercises',
  'mood_tracking',
  'special'
);

-- Create enum for achievement levels
CREATE TYPE achievement_level AS ENUM (
  'bronze',
  'silver',
  'gold',
  'platinum'
);

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type achievement_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  level achievement_level NOT NULL,
  requirement INTEGER NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create user_streaks table
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'theme', 'template', 'feature'
  value TEXT NOT NULL, -- e.g., theme name, template id, feature flag
  required_achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, reward_id)
);

-- Create indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_reward_id ON user_rewards(reward_id);

-- Add RLS policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Achievements policies
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can view their own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Rewards are viewable by everyone"
  ON rewards FOR SELECT
  USING (true);

-- User rewards policies
CREATE POLICY "Users can view their own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
  ON user_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create functions for streak management
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_streaks (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO UPDATE
  SET
    current_streak = CASE
      WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day'
      THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_activity_date = CURRENT_DATE
      THEN user_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      CASE
        WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day'
        THEN user_streaks.current_streak + 1
        WHEN user_streaks.last_activity_date = CURRENT_DATE
        THEN user_streaks.current_streak
        ELSE 1
      END,
      user_streaks.longest_streak
    ),
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for journal entries
CREATE TRIGGER update_streak_on_entry
  AFTER INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement RECORD;
BEGIN
  FOR achievement IN
    SELECT a.*
    FROM achievements a
    LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = NEW.user_id
    WHERE ua.id IS NULL
  LOOP
    -- Check if user meets achievement requirements
    IF (
      (achievement.type = 'streak' AND NEW.current_streak >= achievement.requirement) OR
      (achievement.type = 'entries' AND (
        SELECT COUNT(*) FROM journal_entries WHERE user_id = NEW.user_id
      ) >= achievement.requirement)
    ) THEN
      -- Award achievement
      INSERT INTO user_achievements (user_id, achievement_id, progress, completed_at)
      VALUES (NEW.user_id, achievement.id, achievement.requirement, NOW());
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user streaks
CREATE TRIGGER check_achievements_on_streak_update
  AFTER UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION check_achievements();

-- Insert default achievements
INSERT INTO achievements (type, name, description, level, requirement, icon_url) VALUES
  ('streak', 'Consistency Champion', 'Maintain a 7-day journaling streak', 'bronze', 7, 'streak-7'),
  ('streak', 'Dedicated Journaler', 'Maintain a 30-day journaling streak', 'silver', 30, 'streak-30'),
  ('streak', 'Lifetime Achiever', 'Maintain a 100-day journaling streak', 'gold', 100, 'streak-100'),
  ('entries', 'Getting Started', 'Write your first journal entry', 'bronze', 1, 'entries-1'),
  ('entries', 'Regular Writer', 'Write 50 journal entries', 'silver', 50, 'entries-50'),
  ('entries', 'Prolific Author', 'Write 200 journal entries', 'gold', 200, 'entries-200'),
  ('mood_tracking', 'Mood Explorer', 'Track your mood for 7 consecutive days', 'bronze', 7, 'mood-7'),
  ('mood_tracking', 'Emotional Intelligence', 'Track your mood for 30 consecutive days', 'silver', 30, 'mood-30'),
  ('exercises', 'Mindful Beginner', 'Complete your first guided exercise', 'bronze', 1, 'exercise-1'),
  ('exercises', 'Regular Practitioner', 'Complete 10 guided exercises', 'silver', 10, 'exercise-10'),
  ('exercises', 'Mindfulness Master', 'Complete 50 guided exercises', 'gold', 50, 'exercise-50');

-- Insert default rewards
INSERT INTO rewards (name, description, type, value, required_achievement_id) VALUES
  ('Dark Theme', 'Unlock a beautiful dark theme for your journal', 'theme', 'dark', 
   (SELECT id FROM achievements WHERE name = 'Getting Started')),
  ('Premium Templates', 'Access to premium journal templates', 'template', 'premium',
   (SELECT id FROM achievements WHERE name = 'Regular Writer')),
  ('Advanced Analytics', 'Unlock detailed mood and journaling analytics', 'feature', 'analytics',
   (SELECT id FROM achievements WHERE name = 'Prolific Author')); 
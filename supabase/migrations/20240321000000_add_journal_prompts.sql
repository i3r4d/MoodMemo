-- Create enum for prompt categories
CREATE TYPE prompt_category AS ENUM (
  'gratitude',
  'self_discovery',
  'stress_relief',
  'goal_setting',
  'mood_reflection',
  'personal_growth',
  'relationships',
  'creativity'
);

-- Create table for journal prompts
CREATE TABLE journal_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category prompt_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  follow_up_questions TEXT[],
  mood_triggers TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for user prompt preferences
CREATE TABLE user_prompt_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES journal_prompts(id) ON DELETE CASCADE,
  last_used TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  PRIMARY KEY (user_id, prompt_id)
);

-- Create function to get personalized prompts
CREATE OR REPLACE FUNCTION get_personalized_prompts(
  p_user_id UUID,
  p_mood TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category prompt_category,
  title TEXT,
  description TEXT,
  prompt_text TEXT,
  follow_up_questions TEXT[],
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_mood_history AS (
    SELECT 
      mood,
      COUNT(*) as mood_count
    FROM journal_entries
    WHERE user_id = p_user_id
    AND timestamp >= NOW() - INTERVAL '30 days'
    GROUP BY mood
  ),
  user_tags AS (
    SELECT 
      unnest(tags) as tag,
      COUNT(*) as tag_count
    FROM journal_entries
    WHERE user_id = p_user_id
    AND timestamp >= NOW() - INTERVAL '30 days'
    GROUP BY unnest(tags)
  ),
  prompt_scores AS (
    SELECT 
      p.*,
      CASE 
        WHEN p.mood_triggers @> ARRAY[p_mood] THEN 1.0
        ELSE 0.0
      END as mood_match,
      CASE 
        WHEN p.tags && (SELECT array_agg(tag) FROM user_tags) THEN 1.0
        ELSE 0.0
      END as tag_match,
      CASE 
        WHEN up.rating IS NOT NULL THEN up.rating::float / 5.0
        ELSE 0.5
      END as user_rating
    FROM journal_prompts p
    LEFT JOIN user_prompt_preferences up ON up.prompt_id = p.id AND up.user_id = p_user_id
  )
  SELECT 
    ps.id,
    ps.category,
    ps.title,
    ps.description,
    ps.prompt_text,
    ps.follow_up_questions,
    (ps.mood_match * 0.4 + ps.tag_match * 0.3 + ps.user_rating * 0.3) as relevance_score
  FROM prompt_scores ps
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update prompt preferences
CREATE OR REPLACE FUNCTION update_prompt_preferences(
  p_user_id UUID,
  p_prompt_id UUID,
  p_rating INTEGER
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_prompt_preferences (user_id, prompt_id, last_used, rating)
  VALUES (p_user_id, p_prompt_id, NOW(), p_rating)
  ON CONFLICT (user_id, prompt_id)
  DO UPDATE SET
    last_used = NOW(),
    rating = p_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE journal_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prompts"
  ON journal_prompts FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own preferences"
  ON user_prompt_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_prompt_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_prompt_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert some initial prompts
INSERT INTO journal_prompts (category, title, description, prompt_text, follow_up_questions, mood_triggers, tags)
VALUES
  ('gratitude', 'Daily Gratitude', 'Focus on the positive aspects of your day', 'What are three things you''re grateful for today?', ARRAY['How did these things make you feel?', 'How can you express gratitude to others?'], ARRAY['happy', 'neutral'], ARRAY['gratitude', 'positivity']),
  ('self_discovery', 'Personal Values', 'Explore what matters most to you', 'What values guide your decisions in life?', ARRAY['How do these values influence your daily choices?', 'Are there any values you''d like to strengthen?'], ARRAY['neutral'], ARRAY['values', 'self-reflection']),
  ('stress_relief', 'Stress Management', 'Identify and address sources of stress', 'What''s causing you stress right now?', ARRAY['How does this stress affect you physically and emotionally?', 'What coping strategies have worked for you in the past?'], ARRAY['sad'], ARRAY['stress', 'coping']),
  ('goal_setting', 'Future Vision', 'Plan and visualize your goals', 'What do you want to achieve in the next month?', ARRAY['What steps can you take to reach this goal?', 'How will you measure your progress?'], ARRAY['happy', 'neutral'], ARRAY['goals', 'planning']),
  ('mood_reflection', 'Mood Analysis', 'Understand your emotional patterns', 'How has your mood changed throughout the day?', ARRAY['What factors influenced these mood changes?', 'How can you maintain or improve your mood?'], ARRAY['happy', 'sad', 'neutral'], ARRAY['mood', 'emotions']); 
-- Create enum for content types
CREATE TYPE content_type AS ENUM ('tutorial', 'article', 'guide');

-- Create enum for content categories
CREATE TYPE content_category AS ENUM (
  'getting_started',
  'journaling_techniques',
  'mental_health',
  'app_features',
  'wellness_tips'
);

-- Create table for educational content
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type content_type NOT NULL,
  category content_category NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  author TEXT,
  image_url TEXT,
  video_url TEXT,
  metadata JSONB
);

-- Create table for user progress in tutorials
CREATE TABLE tutorial_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create indexes
CREATE INDEX idx_educational_content_type ON educational_content(type);
CREATE INDEX idx_educational_content_category ON educational_content(category);
CREATE INDEX idx_educational_content_order ON educational_content(order_index);
CREATE INDEX idx_tutorial_progress_user ON tutorial_progress(user_id);

-- Create RLS policies
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read published content
CREATE POLICY "Allow authenticated users to read published content"
  ON educational_content
  FOR SELECT
  TO authenticated
  USING (published_at IS NOT NULL);

-- Allow users to read their own tutorial progress
CREATE POLICY "Allow users to read their own tutorial progress"
  ON tutorial_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own tutorial progress
CREATE POLICY "Allow users to insert their own tutorial progress"
  ON tutorial_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to get onboarding tutorial content
CREATE OR REPLACE FUNCTION get_onboarding_tutorial()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  content TEXT,
  order_index INTEGER,
  image_url TEXT,
  video_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ec.id,
    ec.title,
    ec.description,
    ec.content,
    ec.order_index,
    ec.image_url,
    ec.video_url
  FROM educational_content ec
  WHERE ec.type = 'tutorial'
    AND ec.category = 'getting_started'
    AND ec.published_at IS NOT NULL
  ORDER BY ec.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get educational content by category
CREATE OR REPLACE FUNCTION get_educational_content_by_category(
  p_category content_category
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  content TEXT,
  type content_type,
  order_index INTEGER,
  author TEXT,
  image_url TEXT,
  video_url TEXT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ec.id,
    ec.title,
    ec.description,
    ec.content,
    ec.type,
    ec.order_index,
    ec.author,
    ec.image_url,
    ec.video_url,
    ec.metadata
  FROM educational_content ec
  WHERE ec.category = p_category
    AND ec.published_at IS NOT NULL
  ORDER BY ec.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's tutorial progress
CREATE OR REPLACE FUNCTION get_user_tutorial_progress(p_user_id UUID)
RETURNS TABLE (
  content_id UUID,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.content_id,
    tp.completed_at
  FROM tutorial_progress tp
  WHERE tp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark tutorial content as completed
CREATE OR REPLACE FUNCTION mark_tutorial_completed(
  p_user_id UUID,
  p_content_id UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO tutorial_progress (user_id, content_id)
  VALUES (p_user_id, p_content_id)
  ON CONFLICT (user_id, content_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
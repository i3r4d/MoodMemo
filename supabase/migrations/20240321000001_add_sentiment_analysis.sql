-- Create table for sentiment analysis
CREATE TABLE sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  emotions TEXT[] NOT NULL,
  suggestions TEXT[] NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_sentiment_analysis_user_id ON sentiment_analysis(user_id);
CREATE INDEX idx_sentiment_analysis_created_at ON sentiment_analysis(created_at);

-- Add RLS policies
ALTER TABLE sentiment_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sentiment analysis"
  ON sentiment_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sentiment analysis"
  ON sentiment_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to get sentiment trends
CREATE OR REPLACE FUNCTION get_sentiment_trends(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  sentiment TEXT,
  count BIGINT,
  avg_confidence FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    sentiment,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence
  FROM sentiment_analysis
  WHERE user_id = p_user_id
  AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at), sentiment
  ORDER BY date DESC, sentiment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get emotional insights
CREATE OR REPLACE FUNCTION get_emotional_insights(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  emotion TEXT,
  frequency INTEGER,
  avg_confidence FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH emotion_counts AS (
    SELECT 
      unnest(emotions) as emotion,
      COUNT(*) as frequency,
      AVG(confidence) as avg_confidence
    FROM sentiment_analysis
    WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY unnest(emotions)
  )
  SELECT 
    emotion,
    frequency,
    avg_confidence
  FROM emotion_counts
  ORDER BY frequency DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get personalized suggestions
CREATE OR REPLACE FUNCTION get_personalized_suggestions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  suggestion TEXT,
  frequency INTEGER,
  last_used TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH suggestion_counts AS (
    SELECT 
      unnest(suggestions) as suggestion,
      COUNT(*) as frequency,
      MAX(created_at) as last_used
    FROM sentiment_analysis
    WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY unnest(suggestions)
  )
  SELECT 
    suggestion,
    frequency,
    last_used
  FROM suggestion_counts
  ORDER BY frequency DESC, last_used DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
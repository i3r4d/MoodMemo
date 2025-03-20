-- Create analytics_dashboards table
CREATE TABLE analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create analytics_widgets table
CREATE TABLE analytics_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  position JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analytics_dashboards_user_id ON analytics_dashboards(user_id);
CREATE INDEX idx_analytics_widgets_dashboard_id ON analytics_widgets(dashboard_id);

-- Add RLS policies
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_widgets ENABLE ROW LEVEL SECURITY;

-- Dashboard policies
CREATE POLICY "Users can view their own dashboards"
  ON analytics_dashboards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboards"
  ON analytics_dashboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards"
  ON analytics_dashboards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards"
  ON analytics_dashboards FOR DELETE
  USING (auth.uid() = user_id);

-- Widget policies
CREATE POLICY "Users can view their own widgets"
  ON analytics_widgets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards
      WHERE id = analytics_widgets.dashboard_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own widgets"
  ON analytics_widgets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analytics_dashboards
      WHERE id = analytics_widgets.dashboard_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own widgets"
  ON analytics_widgets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards
      WHERE id = analytics_widgets.dashboard_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own widgets"
  ON analytics_widgets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards
      WHERE id = analytics_widgets.dashboard_id
      AND user_id = auth.uid()
    )
  );

-- Create function to get word cloud data
CREATE OR REPLACE FUNCTION get_word_cloud_data(
  user_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  word TEXT,
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH words AS (
    SELECT unnest(regexp_split_to_array(lower(content), '\s+')) as word
    FROM journal_entries
    WHERE journal_entries.user_id = $1
    AND ($2 IS NULL OR journal_entries.created_at >= $2)
    AND ($3 IS NULL OR journal_entries.created_at <= $3)
  )
  SELECT word, COUNT(*) as count
  FROM words
  WHERE length(word) > 2
  AND word NOT IN (
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  )
  GROUP BY word
  ORDER BY count DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Create function to get sentiment timeline
CREATE OR REPLACE FUNCTION get_sentiment_timeline(
  user_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  sentiment TEXT,
  confidence FLOAT,
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(je.created_at) as date,
    sa.sentiment,
    sa.confidence,
    COUNT(*) as count
  FROM journal_entries je
  LEFT JOIN sentiment_analysis sa ON je.id = sa.journal_entry_id
  WHERE je.user_id = $1
  AND ($2 IS NULL OR je.created_at >= $2)
  AND ($3 IS NULL OR je.created_at <= $3)
  GROUP BY DATE(je.created_at), sa.sentiment, sa.confidence
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get mood vs tags correlation
CREATE OR REPLACE FUNCTION get_mood_tag_correlation(
  user_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  tag TEXT,
  mood_avg FLOAT,
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.name as tag,
    AVG(je.mood) as mood_avg,
    COUNT(*) as count
  FROM journal_entries je
  JOIN journal_entry_tags jet ON je.id = jet.journal_entry_id
  JOIN tags t ON jet.tag_id = t.id
  WHERE je.user_id = $1
  AND ($2 IS NULL OR je.created_at >= $2)
  AND ($3 IS NULL OR je.created_at <= $3)
  GROUP BY t.name
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get writing patterns
CREATE OR REPLACE FUNCTION get_writing_patterns(
  user_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  hour INTEGER,
  count INTEGER,
  avg_length INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(HOUR FROM created_at)::INTEGER as hour,
    COUNT(*) as count,
    AVG(length(content))::INTEGER as avg_length
  FROM journal_entries
  WHERE user_id = $1
  AND ($2 IS NULL OR created_at >= $2)
  AND ($3 IS NULL OR created_at <= $3)
  GROUP BY EXTRACT(HOUR FROM created_at)
  ORDER BY hour;
END;
$$ LANGUAGE plpgsql;

-- Create function to get emotional insights
CREATE OR REPLACE FUNCTION get_emotional_insights(
  user_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  emotion TEXT,
  count INTEGER,
  avg_confidence FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    unnest(sa.emotions) as emotion,
    COUNT(*) as count,
    AVG(sa.confidence) as avg_confidence
  FROM journal_entries je
  JOIN sentiment_analysis sa ON je.id = sa.journal_entry_id
  WHERE je.user_id = $1
  AND ($2 IS NULL OR je.created_at >= $2)
  AND ($3 IS NULL OR je.created_at <= $3)
  GROUP BY unnest(sa.emotions)
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql; 
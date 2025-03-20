-- Create enum for device types
CREATE TYPE device_type AS ENUM ('fitbit', 'apple_watch', 'garmin');

-- Create table for device connections
CREATE TABLE device_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type device_type NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_type)
);

-- Create table for health metrics
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type device_type NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  metric_type TEXT NOT NULL,
  value FLOAT NOT NULL,
  unit TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_type, timestamp, metric_type)
);

-- Create indexes for faster queries
CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_timestamp ON health_metrics(timestamp);
CREATE INDEX idx_health_metrics_metric_type ON health_metrics(metric_type);

-- Add RLS policies
ALTER TABLE device_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own device connections"
  ON device_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device connections"
  ON device_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device connections"
  ON device_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device connections"
  ON device_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own health metrics"
  ON health_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics"
  ON health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to get health metrics for a date range
CREATE OR REPLACE FUNCTION get_health_metrics(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_metric_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  timestamp TIMESTAMPTZ,
  metric_type TEXT,
  value FLOAT,
  unit TEXT,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hm.timestamp,
    hm.metric_type,
    hm.value,
    hm.unit,
    hm.source
  FROM health_metrics hm
  WHERE hm.user_id = p_user_id
  AND hm.timestamp BETWEEN p_start_date AND p_end_date
  AND (p_metric_type IS NULL OR hm.metric_type = p_metric_type)
  ORDER BY hm.timestamp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get correlation between health metrics and mood
CREATE OR REPLACE FUNCTION get_health_mood_correlation(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  metric_type TEXT,
  correlation FLOAT,
  sample_size INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH mood_data AS (
    SELECT 
      DATE(timestamp) as date,
      CASE 
        WHEN mood = 'joy' THEN 5
        WHEN mood = 'calm' THEN 4
        WHEN mood = 'neutral' THEN 3
        WHEN mood = 'sad' THEN 2
        WHEN mood = 'stress' THEN 1
        ELSE 3
      END as mood_score
    FROM journal_entries
    WHERE user_id = p_user_id
    AND timestamp >= NOW() - (p_days || ' days')::INTERVAL
  ),
  health_data AS (
    SELECT 
      DATE(timestamp) as date,
      metric_type,
      AVG(value) as avg_value
    FROM health_metrics
    WHERE user_id = p_user_id
    AND timestamp >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY DATE(timestamp), metric_type
  )
  SELECT 
    hd.metric_type,
    CORR(hd.avg_value, md.mood_score) as correlation,
    COUNT(*) as sample_size
  FROM health_data hd
  JOIN mood_data md ON hd.date = md.date
  GROUP BY hd.metric_type
  HAVING COUNT(*) > 1
  ORDER BY ABS(CORR(hd.avg_value, md.mood_score)) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
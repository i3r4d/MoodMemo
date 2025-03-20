-- Create integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create integration_settings table
CREATE TABLE integration_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, integration_id, setting_key)
);

-- Create integration_syncs table
CREATE TABLE integration_syncs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integration_settings_user_id ON integration_settings(user_id);
CREATE INDEX idx_integration_syncs_user_id ON integration_syncs(user_id);

-- Add RLS policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_syncs ENABLE ROW LEVEL SECURITY;

-- Integration policies
CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Integration settings policies
CREATE POLICY "Users can view their own integration settings"
  ON integration_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integration settings"
  ON integration_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration settings"
  ON integration_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration settings"
  ON integration_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Integration syncs policies
CREATE POLICY "Users can view their own integration syncs"
  ON integration_syncs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integration syncs"
  ON integration_syncs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to get user's integrations
CREATE OR REPLACE FUNCTION get_user_integrations(user_id UUID)
RETURNS TABLE (
  id UUID,
  provider TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.provider,
    i.access_token,
    i.refresh_token,
    i.expires_at,
    i.metadata,
    jsonb_object_agg(is.setting_key, is.setting_value) as settings
  FROM integrations i
  LEFT JOIN integration_settings is ON i.id = is.integration_id
  WHERE i.user_id = $1
  GROUP BY i.id, i.provider, i.access_token, i.refresh_token, i.expires_at, i.metadata;
END;
$$ LANGUAGE plpgsql;

-- Create function to get integration sync history
CREATE OR REPLACE FUNCTION get_integration_sync_history(
  user_id UUID,
  integration_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  integration_id UUID,
  sync_type TEXT,
  status TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    is.id,
    is.integration_id,
    is.sync_type,
    is.status,
    is.started_at,
    is.completed_at,
    is.error,
    is.metadata
  FROM integration_syncs is
  WHERE is.user_id = $1
  AND ($2 IS NULL OR is.integration_id = $2)
  ORDER BY is.started_at DESC
  LIMIT $3;
END;
$$ LANGUAGE plpgsql;

-- Create function to create calendar event from journal entry
CREATE OR REPLACE FUNCTION create_calendar_event_from_entry(
  user_id UUID,
  entry_id UUID,
  calendar_id TEXT
)
RETURNS UUID AS $$
DECLARE
  integration_id UUID;
  event_id UUID;
BEGIN
  -- Get Google Calendar integration
  SELECT id INTO integration_id
  FROM integrations
  WHERE user_id = $1
  AND provider = 'google_calendar'
  LIMIT 1;

  IF integration_id IS NULL THEN
    RAISE EXCEPTION 'Google Calendar integration not found';
  END IF;

  -- Create calendar event
  -- Note: This is a placeholder. The actual implementation would use the Google Calendar API
  -- through an edge function to create the event
  INSERT INTO integration_syncs (
    user_id,
    integration_id,
    sync_type,
    status,
    started_at,
    metadata
  ) VALUES (
    $1,
    integration_id,
    'create_calendar_event',
    'pending',
    NOW(),
    jsonb_build_object(
      'entry_id', $2,
      'calendar_id', $3
    )
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to create task from insight
CREATE OR REPLACE FUNCTION create_task_from_insight(
  user_id UUID,
  insight_id UUID,
  task_data JSONB
)
RETURNS UUID AS $$
DECLARE
  integration_id UUID;
  task_id UUID;
BEGIN
  -- Get Todoist integration
  SELECT id INTO integration_id
  FROM integrations
  WHERE user_id = $1
  AND provider = 'todoist'
  LIMIT 1;

  IF integration_id IS NULL THEN
    RAISE EXCEPTION 'Todoist integration not found';
  END IF;

  -- Create task
  -- Note: This is a placeholder. The actual implementation would use the Todoist API
  -- through an edge function to create the task
  INSERT INTO integration_syncs (
    user_id,
    integration_id,
    sync_type,
    status,
    started_at,
    metadata
  ) VALUES (
    $1,
    integration_id,
    'create_task',
    'pending',
    NOW(),
    jsonb_build_object(
      'insight_id', $2,
      'task_data', $3
    )
  ) RETURNING id INTO task_id;

  RETURN task_id;
END;
$$ LANGUAGE plpgsql; 
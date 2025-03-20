-- Create enum for reminder types
CREATE TYPE reminder_type AS ENUM ('journal', 'mood', 'exercise');

-- Create enum for reminder frequency
CREATE TYPE reminder_frequency AS ENUM ('daily', 'weekly', 'custom');

-- Create table for reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  frequency reminder_frequency NOT NULL,
  time TIME NOT NULL,
  days_of_week INTEGER[], -- 0-6 for Sunday-Saturday
  is_active BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, time)
);

-- Create table for notification preferences
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_type ON reminders(type);
CREATE INDEX idx_reminders_time ON reminders(time);

-- Add RLS policies
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to get active reminders for a user
CREATE OR REPLACE FUNCTION get_active_reminders(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type reminder_type,
  title TEXT,
  message TEXT,
  frequency reminder_frequency,
  time TIME,
  days_of_week INTEGER[],
  sound_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.type,
    r.title,
    r.message,
    r.frequency,
    r.time,
    r.days_of_week,
    r.sound_enabled
  FROM reminders r
  WHERE r.user_id = p_user_id
  AND r.is_active = true
  ORDER BY r.time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get notification preferences for a user
CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_id UUID)
RETURNS TABLE (
  push_enabled BOOLEAN,
  email_enabled BOOLEAN,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.push_enabled,
    np.email_enabled,
    np.quiet_hours_start,
    np.quiet_hours_end,
    np.timezone
  FROM notification_preferences np
  WHERE np.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
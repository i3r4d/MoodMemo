-- Function to get active reminders for the current user
CREATE OR REPLACE FUNCTION get_active_reminders()
RETURNS TABLE (
  id UUID,
  type reminder_type,
  title TEXT,
  message TEXT,
  frequency reminder_frequency,
  time TIME,
  days_of_week INTEGER[],
  is_active BOOLEAN,
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
    r.is_active,
    r.sound_enabled
  FROM reminders r
  WHERE r.user_id = auth.uid()
  AND r.is_active = true
  ORDER BY r.time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification preferences for the current user
CREATE OR REPLACE FUNCTION get_notification_preferences()
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
  WHERE np.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a reminder should be triggered
CREATE OR REPLACE FUNCTION should_trigger_reminder(reminder_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  reminder_record RECORD;
  current_time TIME;
  current_day INTEGER;
  is_quiet_hour BOOLEAN;
BEGIN
  -- Get reminder details
  SELECT * INTO reminder_record
  FROM reminders
  WHERE id = reminder_id;

  -- Get current time and day
  current_time := CURRENT_TIME;
  current_day := EXTRACT(DOW FROM CURRENT_TIMESTAMP);

  -- Check if it's quiet hours
  SELECT EXISTS (
    SELECT 1
    FROM notification_preferences
    WHERE user_id = reminder_record.user_id
    AND quiet_hours_start IS NOT NULL
    AND quiet_hours_end IS NOT NULL
    AND current_time BETWEEN quiet_hours_start AND quiet_hours_end
  ) INTO is_quiet_hour;

  -- Return false if it's quiet hours
  IF is_quiet_hour THEN
    RETURN false;
  END IF;

  -- Check frequency conditions
  CASE reminder_record.frequency
    WHEN 'daily' THEN
      RETURN current_time = reminder_record.time;
    WHEN 'weekly' THEN
      RETURN current_time = reminder_record.time 
        AND current_day = ANY(reminder_record.days_of_week);
    WHEN 'custom' THEN
      -- Add custom frequency logic here
      RETURN false;
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming reminders
CREATE OR REPLACE FUNCTION get_upcoming_reminders(hours_ahead INTEGER DEFAULT 24)
RETURNS TABLE (
  id UUID,
  type reminder_type,
  title TEXT,
  message TEXT,
  time TIME,
  sound_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.type,
    r.title,
    r.message,
    r.time,
    r.sound_enabled
  FROM reminders r
  WHERE r.user_id = auth.uid()
  AND r.is_active = true
  AND should_trigger_reminder(r.id)
  AND r.time BETWEEN CURRENT_TIME AND CURRENT_TIME + (hours_ahead || ' hours')::INTERVAL
  ORDER BY r.time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a reminder as triggered
CREATE OR REPLACE FUNCTION mark_reminder_triggered(reminder_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE reminders
  SET last_triggered = CURRENT_TIMESTAMP
  WHERE id = reminder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
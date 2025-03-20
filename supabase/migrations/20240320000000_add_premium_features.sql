-- Add premium features to journal_entries table
ALTER TABLE journal_entries
ADD COLUMN mood_intensity INTEGER CHECK (mood_intensity >= 1 AND mood_intensity <= 10),
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN formatting JSONB DEFAULT '{"bold": false, "italic": false, "list": false}'::jsonb;

-- Create an index for faster tag searches
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN (tags);

-- Add RLS policies for premium features
ALTER POLICY "Users can view their own entries" ON journal_entries
USING (auth.uid() = user_id);

ALTER POLICY "Users can insert their own entries" ON journal_entries
WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can update their own entries" ON journal_entries
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can delete their own entries" ON journal_entries
USING (auth.uid() = user_id);

-- Create a function to check premium status
CREATE OR REPLACE FUNCTION is_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = $1
    AND status = 'active'
    AND current_period_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to enforce premium feature access
CREATE OR REPLACE FUNCTION enforce_premium_features()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mood_intensity IS NOT NULL OR NEW.tags IS NOT NULL OR NEW.formatting IS NOT NULL THEN
    IF NOT is_premium_user(NEW.user_id) THEN
      RAISE EXCEPTION 'Premium features require an active subscription';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to enforce premium features
CREATE TRIGGER enforce_premium_features_trigger
BEFORE INSERT OR UPDATE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION enforce_premium_features(); 
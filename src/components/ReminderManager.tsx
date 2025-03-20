import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Bell, Clock, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Reminder {
  id: string;
  type: 'journal' | 'mood' | 'exercise';
  title: string;
  message: string;
  frequency: 'daily' | 'weekly' | 'custom';
  time: string;
  days_of_week: number[];
  is_active: boolean;
  sound_enabled: boolean;
}

interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
}

const ReminderManager: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    quiet_hours_start: null,
    quiet_hours_end: null,
    timezone: 'UTC'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReminders();
    fetchPreferences();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_active_reminders');

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reminders. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_notification_preferences');

      if (error) throw error;
      if (data && data[0]) {
        setPreferences(data[0]);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notification preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          type: formData.get('type'),
          title: formData.get('title'),
          message: formData.get('message'),
          frequency: formData.get('frequency'),
          time: formData.get('time'),
          days_of_week: formData.get('frequency') === 'weekly' 
            ? Array.from(formData.getAll('days')).map(Number)
            : null,
          sound_enabled: formData.get('sound') === 'true'
        });

      if (error) throw error;

      toast({
        title: 'Reminder Added',
        description: 'Your new reminder has been created successfully.',
      });

      setShowAddForm(false);
      fetchReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reminder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Reminder Deleted',
        description: 'The reminder has been deleted successfully.',
      });

      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reminder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          ...preferences,
          ...updates
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...updates }));
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been updated.',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'journal':
        return '📝';
      case 'mood':
        return '😊';
      case 'exercise':
        return '🧘';
      default:
        return '🔔';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return 'Custom';
      default:
        return frequency;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications for reminders
              </p>
            </div>
            <Switch
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => handleUpdatePreferences({ push_enabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for reminders
              </p>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handleUpdatePreferences({ email_enabled: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label>Quiet Hours</Label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={preferences.quiet_hours_start || ''}
                onChange={(e) => handleUpdatePreferences({ quiet_hours_start: e.target.value })}
                className="w-32"
              />
              <span>to</span>
              <Input
                type="time"
                value={preferences.quiet_hours_end || ''}
                onChange={(e) => handleUpdatePreferences({ quiet_hours_end: e.target.value })}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reminders
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddReminder} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journal">Journal Entry</SelectItem>
                      <SelectItem value="mood">Mood Check-in</SelectItem>
                      <SelectItem value="exercise">Guided Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select name="frequency" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input name="message" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input type="time" name="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sound">Sound</Label>
                  <Select name="sound" defaultValue="true">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit">Add Reminder</Button>
            </form>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reminders set. Add one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getReminderIcon(reminder.type)}</span>
                    <div>
                      <div className="font-medium">{reminder.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {reminder.message} • {format(new Date(`2000-01-01T${reminder.time}`), 'h:mm a')} • {getFrequencyLabel(reminder.frequency)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderManager; 
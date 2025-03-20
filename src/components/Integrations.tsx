import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, ListTodo, Activity } from 'lucide-react';

interface Integration {
  id: string;
  provider: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  metadata: any;
  settings: any;
}

interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  scopes: string[];
}

const PROVIDERS: IntegrationProvider[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync journal entries as calendar events',
    icon: <Calendar className="w-5 h-5" />,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Create tasks from journal insights',
    icon: <ListTodo className="w-5 h-5" />,
    scopes: ['task:add', 'task:read'],
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    description: 'Correlate physical activity with mood',
    icon: <Activity className="w-5 h-5" />,
    scopes: ['activity', 'mood'],
  },
];

export function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc('get_user_integrations', {
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: t('integrations.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      // Generate OAuth URL
      const { data, error } = await supabase.functions.invoke('oauth-init', {
        body: {
          provider: provider.id,
          scopes: provider.scopes,
        },
      });

      if (error) throw error;

      // Redirect to OAuth provider
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      toast({
        title: t('integrations.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      setIntegrations(integrations.filter(i => i.id !== integrationId));
      toast({
        title: t('integrations.disconnected'),
        description: t('integrations.disconnected_message'),
      });
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: t('integrations.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleSetting = async (
    integrationId: string,
    settingKey: string,
    value: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          integration_id: integrationId,
          setting_key: settingKey,
          setting_value: value,
        });

      if (error) throw error;

      setIntegrations(integrations.map(i => {
        if (i.id === integrationId) {
          return {
            ...i,
            settings: {
              ...i.settings,
              [settingKey]: value,
            },
          };
        }
        return i;
      }));

      toast({
        title: t('integrations.settings_updated'),
        description: t('integrations.settings_updated_message'),
      });
    } catch (error) {
      console.error('Error updating integration settings:', error);
      toast({
        title: t('integrations.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('integrations.title')}</h2>
        <p className="text-muted-foreground">
          {t('integrations.description')}
        </p>
      </div>

      <div className="grid gap-4">
        {PROVIDERS.map((provider) => {
          const integration = integrations.find(i => i.provider === provider.id);
          const isConnected = !!integration;

          return (
            <Card key={provider.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isConnected ? 'destructive' : 'default'}
                  onClick={() =>
                    isConnected
                      ? handleDisconnect(integration.id)
                      : handleConnect(provider)
                  }
                >
                  {isConnected
                    ? t('integrations.disconnect')
                    : t('integrations.connect')}
                </Button>
              </div>

              {isConnected && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {t('integrations.sync_entries')}
                    </label>
                    <Switch
                      checked={integration.settings?.sync_entries || false}
                      onCheckedChange={(checked) =>
                        handleToggleSetting(
                          integration.id,
                          'sync_entries',
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {t('integrations.create_tasks')}
                    </label>
                    <Switch
                      checked={integration.settings?.create_tasks || false}
                      onCheckedChange={(checked) =>
                        handleToggleSetting(
                          integration.id,
                          'create_tasks',
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
} 
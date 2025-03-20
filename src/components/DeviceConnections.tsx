import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Activity, Heart, Moon, Watch } from 'lucide-react';

interface DeviceConnection {
  id: string;
  device_type: 'fitbit' | 'apple_watch' | 'garmin';
  last_sync_at: string;
  token_expires_at: string;
}

const DeviceConnections: React.FC = () => {
  const [connections, setConnections] = useState<DeviceConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('device_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching device connections:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch device connections. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (deviceType: string) => {
    try {
      // Redirect to device-specific OAuth flow
      const response = await supabase.functions.invoke('sync-wearable-data', {
        body: {
          device_type: deviceType,
          action: 'connect'
        }
      });

      if (response.error) throw response.error;

      // Open OAuth URL in new window
      window.open(response.data.auth_url, '_blank');

      toast({
        title: 'Device Connection',
        description: 'Please complete the authentication in the new window.',
      });
    } catch (error) {
      console.error('Error connecting device:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect device. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('device_connections')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setConnections(connections.filter(conn => conn.id !== deviceId));
      toast({
        title: 'Device Disconnected',
        description: 'Your device has been disconnected successfully.',
      });
    } catch (error) {
      console.error('Error disconnecting device:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect device. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSync = async (deviceId: string) => {
    try {
      const connection = connections.find(conn => conn.id === deviceId);
      if (!connection) throw new Error('Device connection not found');

      const { error } = await supabase.functions.invoke('sync-wearable-data', {
        body: {
          device_type: connection.device_type,
          action: 'sync'
        }
      });

      if (error) throw error;

      toast({
        title: 'Sync Complete',
        description: 'Your device data has been synced successfully.',
      });

      fetchConnections(); // Refresh connections to update last_sync_at
    } catch (error) {
      console.error('Error syncing device:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync device data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'fitbit':
        return <Watch className="h-4 w-4" />;
      case 'apple_watch':
        return <Watch className="h-4 w-4" />;
      case 'garmin':
        return <Watch className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getDeviceName = (deviceType: string) => {
    switch (deviceType) {
      case 'fitbit':
        return 'Fitbit';
      case 'apple_watch':
        return 'Apple Watch';
      case 'garmin':
        return 'Garmin';
      default:
        return deviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Connected Devices
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : connections.length === 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your fitness tracker or smartwatch to sync health data with your journal entries.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleConnect('fitbit')}
              >
                <Watch className="h-4 w-4" />
                Connect Fitbit
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleConnect('apple_watch')}
              >
                <Watch className="h-4 w-4" />
                Connect Apple Watch
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleConnect('garmin')}
              >
                <Watch className="h-4 w-4" />
                Connect Garmin
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(connection.device_type)}
                  <div>
                    <div className="font-medium">
                      {getDeviceName(connection.device_type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last synced: {new Date(connection.last_sync_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(connection.id)}
                  >
                    Sync Now
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(connection.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceConnections; 

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Activity, Heart, Moon, Watch } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceConnection {
  id: string;
  device_type: 'fitbit' | 'apple_watch' | 'garmin';
  last_sync_at: string;
  token_expires_at: string;
}

// Mock device connections for demo purposes
const mockConnections: DeviceConnection[] = [
  {
    id: '1',
    device_type: 'apple_watch',
    last_sync_at: new Date().toISOString(),
    token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const DeviceConnections: React.FC = () => {
  const [connections, setConnections] = useState<DeviceConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isPremium } = useAuth();
  
  const [mockLoaded, setMockLoaded] = useState(false);

  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      if (isPremium) {
        setConnections(mockConnections);
      } else {
        setConnections([]);
      }
      setIsLoading(false);
      setMockLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isPremium]);

  const handleConnect = async (deviceType: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newConnection: DeviceConnection = {
        id: Date.now().toString(),
        device_type: deviceType as 'fitbit' | 'apple_watch' | 'garmin',
        last_sync_at: new Date().toISOString(),
        token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      setConnections([...connections, newConnection]);
      
      toast({
        title: 'Device Connected',
        description: `Your ${getDeviceName(deviceType)} has been connected successfully.`,
      });
    } catch (error) {
      console.error('Error connecting device:', error);
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to device. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (deviceId: string) => {
    try {
      const connection = connections.find(conn => conn.id === deviceId);
      if (!connection) throw new Error('Device connection not found');
      
      toast({
        title: 'Syncing...',
        description: `Syncing data from your ${getDeviceName(connection.device_type)}...`,
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last sync time
      setConnections(connections.map(conn => 
        conn.id === deviceId 
          ? { ...conn, last_sync_at: new Date().toISOString() } 
          : conn
      ));
      
      toast({
        title: 'Sync Complete',
        description: 'Your device data has been synced successfully.',
      });
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

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Connected Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
              <Watch className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="font-medium text-lg">Premium Feature</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect your fitness tracker or smartwatch to sync health data with your journal entries.
              Upgrade to premium to unlock this feature.
            </p>
            <Button className="mt-2" onClick={() => toast({
              title: "Premium Required",
              description: "Please upgrade to premium to use this feature.",
            })}>
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Connected Devices
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !mockLoaded ? (
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

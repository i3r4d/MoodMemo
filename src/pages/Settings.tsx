import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangleIcon, 
  FingerprintIcon, 
  ShieldIcon, 
  LockIcon, 
  CreditCardIcon, 
  EyeIcon, 
  KeyIcon, 
  CheckCircleIcon,
  CalendarIcon,
  LogOut,
  User,
  Bell,
  Shield
} from 'lucide-react';
import ReportGenerator from '@/components/ReportGenerator';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PremiumCheckout from '@/components/PremiumCheckout';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useJournalStorage } from '@/hooks/useJournalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import DeviceConnections from '@/components/DeviceConnections';
import HealthMetrics from '@/components/HealthMetrics';
import ReminderManager from '@/components/ReminderManager';
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { localStorageOnly, toggleStoragePreference } = useJournalStorage();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [encryptData, setEncryptData] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, isPremium, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      toast({
        title: "Premium Subscription Activated",
        description: "Thank you for subscribing! Your premium features are now active.",
      });
      navigate('/settings', { replace: true });
    }
  }, [searchParams, navigate, toast]);
  
  const handleReset = async () => {
    if (!user) return;
    
    try {
      if (isPremium && !localStorageOnly) {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
      localStorage.removeItem('moodmemo_journal_entries');
      
      toast({
        title: "Data Cleared",
        description: "All your journal entries have been reset.",
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Error",
        description: "Failed to clear your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = () => {
    setIsPremiumDialogOpen(true);
  };
  
  const handleEnableBiometric = () => {
    if (window.PublicKeyCredential) {
      if (navigator.credentials && 'create' in navigator.credentials) {
        toast({
          title: "Biometric Authentication",
          description: "Your device supports biometric authentication. Enabling now.",
        });
        setBiometricEnabled(!biometricEnabled);
      } else {
        toast({
          title: "Biometric Authentication",
          description: "Your device does not support biometric authentication.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Biometric Authentication",
        description: "Your browser does not support WebAuthn for biometric authentication.",
        variant: "destructive",
      });
    }
  };
  
  const handleSetPin = () => {
    if (pinCode.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN code.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      localStorage.setItem('moodmemo_pin', btoa(pinCode));
      setPinEnabled(true);
      toast({
        title: "PIN Enabled",
        description: "Your journal is now protected with a PIN.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set PIN code. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCrisisResourcesClick = () => {
    window.open('https://988lifeline.org/', '_blank');
    toast({
      title: "Crisis Resources",
      description: "If you're in crisis, please call the National Suicide Prevention Lifeline at 988 or 1-800-273-8255.",
      variant: "destructive",
    });
  };

  const handleExportJSON = () => {
    if (!user) {
      toast({
        title: "Export Failed",
        description: "You must be logged in to export your data.",
        variant: "destructive",
      });
      return;
    }
    
    const mockData = {
      entries: localStorage.getItem('moodmemo_journal_entries') || '[]',
      timestamp: new Date().toISOString(),
      user: user.id,
    };
    
    const dataStr = JSON.stringify(mockData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `moodmemo-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Successful",
      description: "Your journal data has been exported as JSON.",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleThemeChange = (value: Theme) => {
    setTheme(value);
    toast({
      title: 'Theme Updated',
      description: `Theme changed to ${value} mode.`,
    });
  };

  return (
    <AnimatedTransition keyValue="settings">
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="health">Health Data</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Theme</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('light')}
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('dark')}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('system')}
                    >
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for daily reminders and updates.
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly email summaries of your journal entries.
                    </p>
                  </div>
                  <Switch
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <DeviceConnections />
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <HealthMetrics />
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <Separator />
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <PremiumCheckout 
        isOpen={isPremiumDialogOpen} 
        onClose={() => setIsPremiumDialogOpen(false)} 
      />
      
    </AnimatedTransition>
  );
};

export default Settings;

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
  Shield,
  Cloud,
  CloudOff,
  Trash2,
  CreditCard
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReportGenerator from '@/components/ReportGenerator';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PremiumCheckout from '@/components/PremiumCheckout';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import useJournalStorage from '@/hooks/useJournalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import DeviceConnections from '@/components/DeviceConnections';
import ReminderManager from '@/components/ReminderManager';
import { Separator } from "@/components/ui/separator";

type Theme = 'light' | 'dark' | 'system';

const Settings = () => {
  const { localStorageOnly, toggleStoragePreference } = useJournalStorage();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [encryptData, setEncryptData] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { user, profile, isPremium, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['general', 'devices', 'account'].includes(tab)) {
      setActiveTab(tab);
    }
    
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

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangePasswordDialogOpen(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change your password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete user data
      if (isPremium) {
        const { error: dataError } = await supabase
          .from('journal_entries')
          .delete()
          .eq('user_id', user.id);
          
        if (dataError) throw dataError;
      }
      
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      // Clear local storage
      localStorage.clear();
      
      // Sign out
      await signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account and all related data have been permanently deleted.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = () => {
    setIsPremiumDialogOpen(true);
  };
  
  const handleCancelSubscription = async () => {
    if (!user || !isPremium) return;
    
    try {
      // In a real app, this would call to a server endpoint to cancel the subscription
      toast({
        title: "Subscription Canceled",
        description: "Your premium subscription has been canceled. You will have access until the end of your billing period.",
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel your subscription. Please try again.",
        variant: "destructive",
      });
    }
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
    
    const exportFileDefaultName = `moodmemo-export-${format(new Date(), 'yyyy-MM-dd')}.json';
    
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
  };

  return (
    <AnimatedTransition keyValue="settings">
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
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
                <CardTitle>Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Local Storage Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Store journal entries only on this device without cloud syncing
                    </p>
                  </div>
                  <Switch
                    checked={localStorageOnly}
                    onCheckedChange={toggleStoragePreference}
                    aria-label="Toggle local storage"
                  />
                </div>
                <div className="p-3 rounded-md bg-blue-50 text-blue-700 text-sm flex items-start gap-2">
                  {localStorageOnly ? (
                    <>
                      <CloudOff className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Local Storage Enabled</p>
                        <p>Your entries are stored only on this device and won't sync across your devices.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Cloud className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Cloud Storage Enabled</p>
                        <p>Your entries will sync across all your devices when logged in.</p>
                      </div>
                    </>
                  )}
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
            
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Health Data Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By connecting your fitness tracker or smartwatch, you'll unlock powerful insights:
                </p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Correlate your mood with your physical activity and sleep patterns</li>
                  <li>Receive personalized recommendations based on your health metrics</li>
                  <li>Track how different activities impact your emotional wellbeing</li>
                  <li>Get AI-powered insights that combine journal entries with health data</li>
                </ul>
                {!isPremium && (
                  <div className="mt-4 p-4 border rounded-lg bg-primary/5">
                    <p className="font-medium text-primary">Premium Feature</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Health data integration is available with a premium subscription.
                    </p>
                    <Button 
                      onClick={handleSubscribe} 
                      className="mt-3"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <KeyIcon className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Your Password</DialogTitle>
                        <DialogDescription>
                          Enter your new password below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleChangePassword}>Change Password</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPremium ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Premium Active</p>
                          <p className="text-sm text-green-700">You have access to all premium features</p>
                          {profile?.premium_expires_at && (
                            <p className="text-sm text-green-700 mt-2 flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" /> 
                              Next billing: {format(new Date(profile.premium_expires_at), 'MMMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                        Update
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      onClick={handleCancelSubscription}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">Free Plan</p>
                      <p className="text-sm text-muted-foreground">Upgrade to premium for advanced features</p>
                    </div>
                    
                    <Button
                      onClick={handleSubscribe}
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
                    >
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Actions in this area are irreversible. Please proceed with caution.
                </p>
                
                <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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

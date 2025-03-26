import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import {
  MoonIcon,
  SunIcon,
  UserIcon,
  LogOutIcon,
  CreditCardIcon,
  Trash2Icon,
  CheckCircleIcon,
  ShieldCheckIcon,
  Copy,
  MailIcon,
  HelpCircle,
  ArrowRight,
  ChevronsUpDown,
} from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import DeviceConnections from '@/components/DeviceConnections';

const Settings = () => {
  const { user, signOut, updateUserEmail } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isPremium, subscriptionStatus, cancelSubscription } = usePremium();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isCancelling, setIsCancelling] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const tab = searchParams.get('tab');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleEmailUpdate = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your new email address.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      await updateUserEmail(email);
      toast({
        title: "Email Updated",
        description: "Your email address has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled.",
      });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AnimatedTransition keyValue="settings">
      <div className="container max-w-3xl mx-auto py-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Account
              </CardTitle>
              <CardDescription>Manage your account details and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="flex items-center">
                  <Input
                    id="email"
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isUpdatingEmail}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={handleEmailUpdate}
                    disabled={isUpdatingEmail}
                  >
                    {isUpdatingEmail ? "Updating..." : "Update Email"}
                  </Button>
                </div>
              </div>

              <Button variant="destructive" onClick={handleSignOut}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoonIcon className="h-4 w-4" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of MoodMemo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(theme === 'light' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}
                    onClick={() => handleThemeChange('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(theme === 'dark' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}
                    onClick={() => handleThemeChange('dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(theme === 'system' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}
                    onClick={() => handleThemeChange('system')}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <DeviceConnections />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription and billing details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPremium ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Subscription Status</p>
                    <p className="text-muted-foreground">{subscriptionStatus === 'active' ? 'Active' : 'Inactive'}</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                    <CreditCardIcon className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-medium text-lg">Unlock Premium Features</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Upgrade to premium to access advanced features, remove ads, and support MoodMemo.
                  </p>
                  <Button onClick={() => toast({
                    title: "Premium Required",
                    description: "Please upgrade to premium to use this feature.",
                  })}>
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Settings;

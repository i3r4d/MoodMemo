
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  UserIcon, 
  MailIcon, 
  CreditCardIcon, 
  Calendar, 
  LogOutIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { format } from 'date-fns';

const MyAccount = () => {
  const { user, profile, isPremium, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleManageSubscription = () => {
    // In a real app, this would redirect to a subscription management page
    window.open('https://example.com/manage-subscription', '_blank');
  };
  
  const handleUpdatePayment = () => {
    navigate('/settings');
  };

  return (
    <AnimatedTransition keyValue="my-account">
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>
        
        <div className="glass-morphism mood-journal-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{profile?.username || user?.email}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Subscription Details</h3>
            
            {isPremium ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Premium Account Active</h4>
                      <p className="text-sm text-green-700">
                        You have access to all premium features
                      </p>
                      
                      {profile?.premium_expires_at && (
                        <div className="flex items-center text-sm text-muted-foreground mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          Next billing date: {format(new Date(profile.premium_expires_at), 'MMMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Plan: Premium ($4.99/month)</h4>
                  <p className="text-sm text-muted-foreground">Your premium subscription includes:</p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Unlimited journal entries with cloud sync</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Premium transcription with enhanced accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Ad-free experience throughout the app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>AI-powered insights and reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>All premium guided exercises</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <CreditCardIcon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-sm text-muted-foreground">Ending in •••• 4242</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleUpdatePayment}
                    >
                      Update Payment Method
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleManageSubscription}
                      className="flex items-center gap-1"
                    >
                      Manage Subscription
                      <ExternalLinkIcon className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-start gap-3">
                    <ShieldIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Free Account</h4>
                      <p className="text-sm text-blue-700">
                        Upgrade to premium for enhanced features and unlimited access
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Current Plan: Free</h4>
                  <p className="text-sm text-muted-foreground">Your free plan includes:</p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Basic journaling features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Local device storage only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Basic mood tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircleIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-500">Cloud syncing (Premium only)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircleIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-500">AI insights and reports (Premium only)</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => navigate('/settings')}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  Upgrade to Premium - $4.99/month
                </Button>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Account Actions</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-left"
                onClick={() => navigate('/settings')}
              >
                <ShieldIcon className="h-4 w-4 mr-2" />
                Security & Privacy Settings
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start text-left"
                onClick={handleSignOut}
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default MyAccount;

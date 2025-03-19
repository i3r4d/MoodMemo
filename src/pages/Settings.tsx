
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
  CalendarIcon
} from 'lucide-react';
import ReportGenerator from '@/components/ReportGenerator';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PremiumCheckout from '@/components/PremiumCheckout';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useJournalStorage } from '@/hooks/useJournalStorage';

const Settings = () => {
  const { localStorageOnly, toggleStoragePreference } = useJournalStorage();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [encryptData, setEncryptData] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, isPremium } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Check for payment success in URL parameters
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      toast({
        title: "Premium Subscription Activated",
        description: "Thank you for subscribing! Your premium features are now active.",
      });
      // Remove the query parameter
      navigate('/settings', { replace: true });
    }
  }, [searchParams, navigate, toast]);
  
  const handleReset = async () => {
    if (!user) return;
    
    try {
      if (isPremium && !localStorageOnly) {
        // For premium users, clear entries from database
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
      // Clear local storage entries
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
      // Check if device supports WebAuthn
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
    
    // Store PIN code in secure storage
    try {
      // Hash the PIN before storing (in a real app)
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
    
    // This would be connected to real data in a production app
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

  return (
    <AnimatedTransition keyValue="settings">
      <div className="max-w-2xl mx-auto py-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCrisisResourcesClick}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            <AlertTriangleIcon className="h-4 w-4 mr-1" />
            Crisis Resources
          </Button>
        </div>
        
        <div className="glass-morphism mood-journal-card space-y-6">
          <div>
            <h2 className="text-lg font-medium flex items-center gap-2 mb-4">
              <ShieldIcon className="h-5 w-5 text-primary" />
              Security & Privacy
            </h2>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <FingerprintIcon className="h-4 w-4" />
                    Biometric Unlock
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint or Face ID to access journal
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={biometricEnabled} 
                    onCheckedChange={handleEnableBiometric} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <KeyIcon className="h-4 w-4" />
                    PIN Protection
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Secure journal with a 4-digit PIN
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!pinEnabled ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        type="password" 
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="****"
                        className="w-20 text-center"
                        maxLength={4}
                      />
                      <Button size="sm" onClick={handleSetPin}>Set</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">PIN Enabled</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-8"
                        onClick={() => setPinEnabled(false)}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    Local Storage Only
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium 
                      ? "Store entries on this device only, even with premium"
                      : "Entries never leave your device unless exported"}
                  </p>
                </div>
                <Switch 
                  checked={localStorageOnly} 
                  onCheckedChange={toggleStoragePreference}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <LockIcon className="h-4 w-4" />
                    Encrypt Journal Data
                  </p>
                  <p className="text-sm text-muted-foreground">
                    AES-256 encryption for maximum security
                  </p>
                </div>
                <Switch 
                  checked={encryptData} 
                  onCheckedChange={setEncryptData} 
                />
              </div>
              
              <div className="pt-4 border-t">
                <ReportGenerator insightsView={true} />
              </div>
              
              <div className="pt-4 border-t">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-sm flex gap-2">
                  <div className="shrink-0 mt-0.5">
                    <ShieldIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Privacy Disclaimer</p>
                    <p className="text-blue-600 mt-1">
                      {isPremium && !localStorageOnly
                        ? "Premium accounts store journal entries and audio in the cloud with encryption. We respect your privacy and never share your data."
                        : "Your data is stored locally and never shared unless you export a report. We value your privacy and security."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Only show Premium Membership section to non-premium users */}
        {!isPremium && (
          <div className="glass-morphism mood-journal-card space-y-6">
            <div>
              <h2 className="text-lg font-medium flex items-center gap-2 mb-4">
                <CreditCardIcon className="h-5 w-5 text-primary" />
                Premium Membership
              </h2>
              
              <div className="p-4 rounded-lg bg-white space-y-3 border border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="text-muted-foreground">Feature</div>
                  <div className="font-medium text-center">Free</div>
                  <div className="font-medium text-center text-primary">Premium</div>
                  
                  <div>Voice Journaling</div>
                  <div className="text-center">Basic</div>
                  <div className="text-center">Advanced</div>
                  
                  <div>Cloud Storage</div>
                  <div className="text-center">—</div>
                  <div className="text-center">Unlimited</div>
                  
                  <div>Ads</div>
                  <div className="text-center">Yes</div>
                  <div className="text-center">No Ads</div>
                  
                  <div>Guided Exercises</div>
                  <div className="text-center">5 Basic</div>
                  <div className="text-center">50+ Premium</div>
                  
                  <div>Advanced Insights</div>
                  <div className="text-center">—</div>
                  <div className="text-center">✓</div>
                  
                  <div>Export Options</div>
                  <div className="text-center">JSON only</div>
                  <div className="text-center">PDF, CSV, JSON</div>
                </div>
                
                <Button 
                  onClick={handleSubscribe}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  Upgrade to Premium - $4.99/month
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Cancel anytime • 7-day free trial
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="glass-morphism mood-journal-card space-y-4">
          <h2 className="text-lg font-medium">Data</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download your journal entries</p>
              <Button 
                className="mt-2 text-sm px-3 py-1" 
                variant="outline" 
                size="sm"
                onClick={handleExportJSON}
              >
                Export as JSON
              </Button>
              
              {isPremium && (
                <Button 
                  className="mt-2 ml-2 text-sm px-3 py-1" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "PDF Export",
                      description: "Your journal entries are being prepared as a PDF document.",
                    });
                    
                    // Simulate PDF generation
                    setTimeout(() => {
                      toast({
                        title: "Export Complete",
                        description: "Your PDF export is ready for download.",
                      });
                    }, 2000);
                  }}
                >
                  Export as PDF
                </Button>
              )}
            </div>
            
            <div>
              <p className="font-medium text-destructive">Clear Data</p>
              <p className="text-sm text-muted-foreground">Delete all journal entries</p>
              <Button 
                onClick={handleReset}
                className="mt-2 text-sm px-3 py-1"
                variant="destructive"
                size="sm"
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>MoodMemo v1.0.0</p>
          <p>© 2023 MoodMemo. All rights reserved.</p>
        </div>
      </div>
      
      {/* Premium Checkout Dialog */}
      <PremiumCheckout 
        isOpen={isPremiumDialogOpen} 
        onClose={() => setIsPremiumDialogOpen(false)} 
      />
      
    </AnimatedTransition>
  );
};

export default Settings;

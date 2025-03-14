import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedTransition from '@/components/AnimatedTransition';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangleIcon, FingerprintIcon, ShieldIcon, LockIcon, CreditCardIcon, EyeIcon, KeyIcon } from 'lucide-react';
import ReportGenerator from '@/components/ReportGenerator';

const Settings = () => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [localStorageOnly, setLocalStorageOnly] = useState(true);
  const [encryptData, setEncryptData] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  
  const handleReset = () => {
    toast({
      title: "Data Cleared",
      description: "All your journal entries have been reset.",
    });
  };

  const handleSubscribe = () => {
    toast({
      title: "Subscription Coming Soon",
      description: "Premium subscription options will be available soon!",
    });
  };
  
  const handleEnableBiometric = () => {
    // Mock biometric authentication
    toast({
      title: "Biometric Authentication",
      description: "On a real device, this would prompt for fingerprint or Face ID.",
    });
    setBiometricEnabled(!biometricEnabled);
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
    
    setPinEnabled(true);
    toast({
      title: "PIN Enabled",
      description: "Your journal is now protected with a PIN.",
    });
  };
  
  const handleCrisisResourcesClick = () => {
    toast({
      title: "Crisis Resources",
      description: "If you're in crisis, please call the National Suicide Prevention Lifeline at 988.",
      variant: "destructive",
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
                    Entries never leave your device unless exported
                  </p>
                </div>
                <Switch 
                  checked={localStorageOnly} 
                  onCheckedChange={setLocalStorageOnly} 
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
                <ReportGenerator isPremium={false} />
              </div>
              
              <div className="pt-4 border-t">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-sm flex gap-2">
                  <div className="shrink-0 mt-0.5">
                    <ShieldIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Privacy Disclaimer</p>
                    <p className="text-blue-600 mt-1">Your data is stored locally and never shared unless you export a report. We value your privacy and security.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
                <div className="text-center">✓</div>
                <div className="text-center">✓</div>
                
                <div>Basic Mood Tracking</div>
                <div className="text-center">✓</div>
                <div className="text-center">✓</div>
                
                <div>Ads</div>
                <div className="text-center">Yes</div>
                <div className="text-center">No Ads</div>
                
                <div>Guided Exercises</div>
                <div className="text-center">5 Basic</div>
                <div className="text-center">50+ Premium</div>
                
                <div>Advanced Insights</div>
                <div className="text-center">—</div>
                <div className="text-center">✓</div>
                
                <div>PDF Export</div>
                <div className="text-center">—</div>
                <div className="text-center">✓</div>
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
        
        <div className="glass-morphism mood-journal-card space-y-4">
          <h2 className="text-lg font-medium">Data</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download your journal entries</p>
              <Button className="mt-2 text-sm px-3 py-1" variant="outline" size="sm">
                Export as JSON
              </Button>
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
          <p>MoodMemo v0.1.0</p>
          <p>© 2023 MoodMemo. All rights reserved.</p>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Settings;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LockIcon, MailIcon, Shield, ShieldIcon } from 'lucide-react';

interface AuthScreenProps {
  onComplete: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'welcome' | 'signup' | 'security'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [enablePin, setEnablePin] = useState(false);
  const [pin, setPin] = useState('');
  
  const handleContinue = () => {
    setStep('signup');
  };
  
  const handleSignupWithEmail = () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreedToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "You must agree to the privacy policy and terms of service.",
        variant: "destructive",
      });
      return;
    }
    
    // Move to security setup step
    setStep('security');
  };
  
  const handleSignupWithGoogle = () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "You must agree to the privacy policy and terms of service.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Google Sign Up",
      description: "This would connect to Firebase Auth in a production app.",
    });
    
    // Move to security setup step
    setStep('security');
  };
  
  const handleSecuritySetup = () => {
    if (enablePin && pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN code.",
        variant: "destructive",
      });
      return;
    }
    
    if (enableBiometric) {
      toast({
        title: "Biometric Authentication",
        description: "On a real device, this would enable fingerprint or Face ID.",
      });
    }
    
    if (enablePin) {
      toast({
        title: "PIN Protection",
        description: "Your journal is now protected with a PIN.",
      });
    }
    
    // Complete the onboarding process
    onComplete();
  };
  
  if (step === 'welcome') {
    return (
      <motion.div 
        className="h-full flex flex-col items-center justify-center p-6 text-center space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="relative h-24 w-24 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary/10"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
            />
            <div className="relative h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
              <ShieldIcon className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Welcome to MoodMemo</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            A safe space to journal your thoughts and track your mental wellbeing
          </p>
        </div>
        
        <div className="glass-morphism mood-journal-card p-5 max-w-md w-full">
          <h2 className="text-lg font-medium mb-3">Privacy First</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your data is stored locally on your device and never shared unless you explicitly export it. 
            We prioritize your privacy and security.
          </p>
          
          <div className="flex flex-col space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                <LockIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">End-to-end encryption</p>
                <p className="text-xs text-muted-foreground">Your journal entries are encrypted and secure</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Local storage</p>
                <p className="text-xs text-muted-foreground">Data stays on your device by default</p>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleContinue}
          className="w-full max-w-md"
        >
          Get Started
        </Button>
        
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our privacy policy and terms of service.
        </p>
      </motion.div>
    );
  }
  
  if (step === 'signup') {
    return (
      <motion.div 
        className="h-full flex flex-col items-center justify-center p-6 space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground max-w-md">
            Secure your journal with an account
          </p>
        </div>
        
        <div className="glass-morphism mood-journal-card p-5 max-w-md w-full space-y-6">
          <Button 
            onClick={handleSignupWithGoogle}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Sign up with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or with email
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <p className="text-sm text-muted-foreground">
                I agree to the privacy policy and encryption terms. My data will be stored locally and never shared unless I export it.
              </p>
            </label>
          </div>
          
          <Button 
            onClick={handleSignupWithEmail}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="h-full flex flex-col items-center justify-center p-6 space-y-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold mb-2">Secure Your Journal</h1>
        <p className="text-muted-foreground max-w-md">
          Add an extra layer of protection to your personal thoughts
        </p>
      </div>
      
      <div className="glass-morphism mood-journal-card p-5 max-w-md w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Enable Biometric Authentication
            </p>
            <p className="text-sm text-muted-foreground">
              Use fingerprint or Face ID to unlock
            </p>
          </div>
          <Checkbox 
            checked={enableBiometric}
            onCheckedChange={(checked) => setEnableBiometric(checked as boolean)}
          />
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium flex items-center gap-1">
                <LockIcon className="h-4 w-4" />
                Create PIN Code
              </p>
              <p className="text-sm text-muted-foreground">
                4-digit code to access your journal
              </p>
            </div>
            <Checkbox 
              checked={enablePin}
              onCheckedChange={(checked) => setEnablePin(checked as boolean)}
            />
          </div>
          
          {enablePin && (
            <div className="mt-4">
              <Label htmlFor="pin">Enter 4-digit PIN</Label>
              <Input 
                id="pin" 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="text-center text-lg mt-1"
              />
            </div>
          )}
        </div>
      </div>
      
      <Button 
        onClick={handleSecuritySetup}
        className="w-full max-w-md"
      >
        Complete Setup
      </Button>
      
      <Button 
        variant="link" 
        onClick={onComplete}
        className="text-muted-foreground"
      >
        Skip for now (Not recommended)
      </Button>
    </motion.div>
  );
};

export default AuthScreen;

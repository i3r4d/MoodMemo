import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangleIcon, BookOpenIcon, BarChart2Icon, WindIcon, ShieldIcon, LockIcon, LogInIcon, UserPlusIcon } from 'lucide-react';
import AuthScreen from '@/components/AuthScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // If user is already logged in, don't show onboarding
    if (isAuthenticated) {
      return;
    }
    
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasVisitedBefore', 'true');
    setShowOnboarding(false);
    toast({
      title: "Welcome to MoodMemo!",
      description: "Your mental health journal is set up and ready to use.",
    });
  };
  
  const handleCrisisResourcesClick = () => {
    toast({
      title: "Crisis Resources",
      description: "If you're in crisis, please call the National Suicide Prevention Lifeline at 988 (1-800-273-8255).",
      variant: "destructive",
    });
  };
  
  const handlePremiumClick = () => {
    navigate('/settings');
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate('/journal');
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showOnboarding) {
    return <AuthScreen onComplete={handleOnboardingComplete} />;
  }

  const features = [
    {
      icon: <BookOpenIcon className="h-6 w-6" />,
      title: 'Voice Journaling',
      description: 'Record your thoughts effortlessly with voice-to-text technology.',
      link: '/journal',
      premium: false
    },
    {
      icon: <BarChart2Icon className="h-6 w-6" />,
      title: 'Mood Tracking',
      description: 'Visualize your emotional patterns with AI-powered insights.',
      link: '/dashboard',
      premium: false
    },
    {
      icon: <WindIcon className="h-6 w-6" />,
      title: 'Guided Exercises',
      description: 'Access meditation and breathing exercises for mental wellbeing.',
      link: '/exercises',
      premium: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col justify-center items-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto text-center px-4 space-y-8"
      >
        <div className="absolute top-4 right-4">
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
        
        <motion.div variants={itemVariants} className="space-y-2">
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
          >
            <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{ 
                  boxShadow: ["0 0 0 0px rgba(124, 178, 241, 0.2)", "0 0 0 10px rgba(124, 178, 241, 0)"],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  repeatDelay: 0.5
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary">
                <path d="M21 15V6"></path>
                <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                <path d="M12 12H3"></path>
                <path d="M16 6H3"></path>
                <path d="M12 18H3"></path>
              </svg>
            </div>
          </motion.div>
          
          <motion.span
            className="inline-block text-sm font-medium text-primary px-3 py-1 rounded-full bg-primary/10"
            variants={itemVariants}
          >
            MoodMemo Journal
          </motion.span>
          
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            variants={itemVariants}
          >
            Capture your thoughts, understand your mind
          </motion.h1>
          
          <motion.p
            className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            A mindful journaling app that helps you track emotions, gain insights, and improve your mental wellbeing through voice journaling and guided exercises.
          </motion.p>
        </motion.div>
        
        {/* Login/Signup buttons section */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth?tab=login">
            <motion.button
              className={cn(
                "px-6 py-3 rounded-lg text-white font-medium",
                "bg-primary shadow-lg shadow-primary/20 w-full sm:w-auto",
                "hover:bg-primary/90 focus-ring flex items-center justify-center gap-2"
              )}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <LogInIcon className="h-4 w-4" />
              Sign In
            </motion.button>
          </Link>
          
          <Link to="/auth?tab=signup">
            <motion.button
              className={cn(
                "px-6 py-3 rounded-lg font-medium w-full sm:w-auto",
                "bg-secondary text-secondary-foreground",
                "hover:bg-secondary/80 focus-ring flex items-center justify-center gap-2"
              )}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <UserPlusIcon className="h-4 w-4" />
              Create Account
            </motion.button>
          </Link>
        </motion.div>
        
        {/* Returning users login form - moved down below the main buttons */}
        <motion.div 
          variants={itemVariants} 
          className="glass-morphism mood-journal-card p-6 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Returning User?</h2>
            <LogInIcon className="h-5 w-5 text-primary" />
          </div>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <Link to="/auth?tab=signup" className="flex-1">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </form>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
          <Link to="/journal">
            <motion.button
              className={cn(
                "px-6 py-3 rounded-lg text-white font-medium",
                "bg-primary shadow-lg shadow-primary/20",
                "hover:bg-primary/90 focus-ring"
              )}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Start Journaling
            </motion.button>
          </Link>
          
          <Link to="/dashboard">
            <motion.button
              className={cn(
                "px-6 py-3 rounded-lg font-medium",
                "bg-secondary text-secondary-foreground",
                "hover:bg-secondary/80 focus-ring"
              )}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              View Insights
            </motion.button>
          </Link>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <Link key={feature.title} to={feature.link}>
              <motion.div
                className={cn(
                  "glass-morphism mood-journal-card text-left h-full relative",
                  "transition-all duration-300 hover:shadow-xl"
                )}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {feature.premium && (
                  <div className="absolute top-2 right-2 bg-amber-200 text-amber-800 font-medium px-2 py-0.5 rounded-full text-xs">
                    PREMIUM
                  </div>
                )}
                
                <div className="flex flex-col h-full">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    {feature.title}
                    {feature.premium && <LockIcon className="h-3 w-3 text-amber-600" />}
                  </h3>
                  <p className="text-muted-foreground text-sm flex-grow">{feature.description}</p>
                  
                  <div className="flex items-center gap-1 text-primary mt-4 text-sm font-medium">
                    <span>Get started</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="glass-morphism mood-journal-card text-left p-5 max-w-lg mx-auto mt-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Unlock Premium Features</h3>
              <p className="text-sm text-muted-foreground">
                Ad-free experience, unlimited exercises, and AI-powered insights
              </p>
            </div>
            <Button 
              onClick={handlePremiumClick}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              $4.99/month
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <div className="glass-morphism px-6 py-4 rounded-lg inline-block">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Your data is stored locally and never shared unless you export it.
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="mt-4 text-center"
        >
          <div className="glass-morphism px-6 py-4 rounded-lg inline-block">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">
                If you're in crisis, please call the National Suicide Prevention Lifeline at <strong>1-800-273-8255 (988)</strong>
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="fixed bottom-20 left-0 right-0 p-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Free version supported by ethical ads. <span className="text-primary font-medium cursor-pointer" onClick={handlePremiumClick}>Go premium to remove.</span></p>
      </div>
    </div>
  );
};

export default Index;

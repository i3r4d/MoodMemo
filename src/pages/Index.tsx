
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Index = () => {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      ),
      title: 'Voice Journaling',
      description: 'Record your thoughts effortlessly with voice-to-text technology.',
      link: '/journal'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      title: 'Mood Tracking',
      description: 'Visualize your emotional patterns with AI-powered insights.',
      link: '/dashboard'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
        </svg>
      ),
      title: 'Guided Exercises',
      description: 'Access meditation and breathing exercises for mental wellbeing.',
      link: '/exercises'
    }
  ];

  // Animation variants
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
                  "glass-morphism mood-journal-card text-left h-full",
                  "transition-all duration-300 hover:shadow-xl"
                )}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col h-full">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
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
          className="mt-8 text-center"
        >
          <div className="glass-morphism px-6 py-4 rounded-lg inline-block">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-destructive">
                <rect width="16" height="16" x="4" y="4" rx="1"></rect>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
              <span className="text-sm text-muted-foreground">
                If you're in crisis, please call the National Suicide Prevention Lifeline at <strong>988</strong>
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;

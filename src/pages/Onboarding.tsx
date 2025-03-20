
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Here you would typically update the user's profile to mark onboarding as complete
      // For now, we'll just navigate to the home page
      toast({
        title: "Welcome!",
        description: "Your account setup is complete. Start journaling now!",
      });
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Welcome to MindfulJournal</h3>
            <p className="text-muted-foreground">
              Your personal space for reflection, growth, and mindfulness.
            </p>
            <div className="py-4">
              <div className="rounded-full bg-primary/10 p-8 mx-auto w-24 h-24 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary">
                  <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
                  <path d="M6 2v20"></path>
                  <path d="M10 2v20"></path>
                </svg>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Track Your Mood</h3>
            <p className="text-muted-foreground">
              Record your daily emotional state and discover patterns over time.
            </p>
            <div className="py-4">
              <div className="rounded-full bg-primary/10 p-8 mx-auto w-24 h-24 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Get Started</h3>
            <p className="text-muted-foreground">
              You're all set! Begin your mindfulness journey today.
            </p>
            <div className="py-4">
              <div className="rounded-full bg-primary/10 p-8 mx-auto w-24 h-24 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Setup Your Account</CardTitle>
          <CardDescription className="text-center">
            Step {currentStep} of {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          <div className="flex items-center justify-center mt-6">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full mx-1 ${
                  idx + 1 === currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isCompleting}
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isCompleting}
          >
            {currentStep < totalSteps ? "Next" : "Finish"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;

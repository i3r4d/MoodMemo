
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const OnboardingStep = ({ 
  title, 
  children, 
  onNext, 
  onBack,
  isLastStep = false,
  isFirstStep = false
}: { 
  title: string; 
  children: React.ReactNode; 
  onNext: () => void; 
  onBack: () => void;
  isLastStep?: boolean;
  isFirstStep?: boolean;
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <div className="flex justify-between pt-4">
          {!isFirstStep && (
            <Button variant="outline" onClick={onBack}>Back</Button>
          )}
          {isFirstStep && <div />}
          <Button onClick={onNext}>
            {isLastStep ? 'Complete' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goals, setGoals] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (step === 3) {
      // Complete onboarding
      toast({
        title: 'Onboarding Complete',
        description: 'Welcome to the app! Your preferences have been saved.',
      });
      navigate('/');
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome to MoodMemo</h1>
          <p className="text-muted-foreground mt-2">Let's get you set up in just a few steps</p>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i === step ? 'bg-primary text-primary-foreground' : 
                  i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-muted -mt-5 z-0 relative">
            <div 
              className="h-full bg-primary transition-all" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <OnboardingStep 
            title="Tell us about yourself" 
            onNext={handleNext} 
            onBack={handleBack}
            isFirstStep
          >
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
              />
            </div>
          </OnboardingStep>
        )}

        {step === 2 && (
          <OnboardingStep 
            title="What are your goals?" 
            onNext={handleNext} 
            onBack={handleBack}
          >
            <div className="space-y-2">
              <Label htmlFor="goals">What do you hope to achieve with journaling?</Label>
              <Textarea 
                id="goals" 
                value={goals} 
                onChange={(e) => setGoals(e.target.value)} 
                placeholder="I want to track my moods and understand patterns..."
                rows={4}
              />
            </div>
          </OnboardingStep>
        )}

        {step === 3 && (
          <OnboardingStep 
            title="Privacy preferences" 
            onNext={handleNext} 
            onBack={handleBack}
            isLastStep
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data storage</Label>
                <div className="text-sm text-muted-foreground">
                  Your entries will be stored securely. Premium users can enable end-to-end encryption.
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  We'll send you gentle reminders to journal. You can customize this later.
                </div>
              </div>
            </div>
          </OnboardingStep>
        )}
      </div>
    </div>
  );
};

export default Onboarding;

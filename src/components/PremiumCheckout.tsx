
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangleIcon, CheckIcon, XIcon } from 'lucide-react';

// Initialize Stripe with publishable key
// This is a test key, so it's safe to include in client-side code
const stripePromise = loadStripe('pk_test_51NVAjYHh82AzVlWMtdAuGZfP6NQoAXK4rIaoHtpMsLnGfkJpuQGjN5LNxHtE6X9dTIZ8ciVTGHbWyGZkxNrhq8qR00T2eD3b5I');

interface PremiumCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PriceOption {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

const PremiumCheckout: React.FC<PremiumCheckoutProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState<PriceOption | null>(null);
  
  // Premium plan options
  const priceOptions: PriceOption[] = [
    {
      id: 'price_monthly',
      name: 'Monthly',
      price: 499,
      interval: 'month',
      features: [
        'Unlimited journal entries',
        'Advanced AI analysis',
        'Premium guided exercises',
        'Cloud storage',
        'Ad-free experience',
      ]
    },
    {
      id: 'price_yearly',
      name: 'Yearly (Save 17%)',
      price: 4999,
      interval: 'year',
      features: [
        'All monthly features',
        'Priority support',
        'Advanced exports (PDF, CSV)',
        'Extended data retention',
        'Early access to new features',
      ]
    }
  ];

  // Setup Stripe elements options
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0f172a',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  // Handle plan selection
  const handleSelectPlan = (plan: PriceOption) => {
    setSelectedPrice(plan);
    setActiveStep(1);
  };

  // Initialize payment intent
  const initializePayment = async () => {
    if (!user || !selectedPrice) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { 
          userId: user.id,
          priceId: selectedPrice.id,
          amount: selectedPrice.price,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      toast({
        title: 'Payment Setup Failed',
        description: err.message || 'An error occurred setting up payment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup payment intent when moving to payment step
  useEffect(() => {
    if (activeStep === 1 && selectedPrice && !clientSecret) {
      initializePayment();
    }
  }, [activeStep, selectedPrice]);

  // Handle successful payment
  const handlePaymentSuccess = () => {
    toast({
      title: 'Premium Subscription Activated',
      description: 'Thank you for subscribing! Your premium features are now active.',
    });
    onClose();
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setActiveStep(0);
    setSelectedPrice(null);
    setClientSecret('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade to MoodMemo Premium</DialogTitle>
          <DialogDescription>
            {activeStep === 0 ? 
              'Choose a subscription plan to unlock all premium features.' : 
              'Complete your payment information to activate premium.'
            }
          </DialogDescription>
        </DialogHeader>

        {activeStep === 0 && (
          <div className="grid gap-4">
            {priceOptions.map((option) => (
              <div 
                key={option.id}
                className={`border rounded-lg p-4 hover:border-primary cursor-pointer transition-all ${
                  selectedPrice?.id === option.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleSelectPlan(option)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{option.name}</h3>
                  <span className="text-lg font-bold text-primary">${(option.price / 100).toFixed(2)}/{option.interval}</span>
                </div>
                
                <ul className="text-sm space-y-1">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => handleSelectPlan(option)}
                >
                  Select Plan
                </Button>
              </div>
            ))}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <AlertTriangleIcon className="h-3 w-3" />
              <span>This is a test mode - no real payments will be processed.</span>
            </div>
          </div>
        )}

        {activeStep === 1 && clientSecret && (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm 
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setActiveStep(0)}
              amount={selectedPrice?.price || 499}
              interval={selectedPrice?.interval || 'month'}
            />
          </Elements>
        )}

        {activeStep === 1 && !clientSecret && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-muted-foreground">Preparing payment form...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumCheckout;

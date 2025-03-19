
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
  interval: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  clientSecret, 
  onSuccess, 
  onCancel,
  amount,
  interval
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings?payment_success=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred processing your payment.",
          variant: "destructive",
        });
      } else {
        // The payment succeeded
        toast({
          title: "Payment Successful",
          description: "Your premium subscription is now active!",
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message);
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <div className="text-lg font-semibold mb-1">
          {interval === 'month' ? 'Monthly' : 'Annual'} Subscription
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">${(amount / 100).toFixed(2)}</span>
          <span className="text-muted-foreground ml-1">/{interval}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          You'll be charged ${(amount / 100).toFixed(2)} {interval === 'month' ? 'monthly' : 'annually'}.
          Cancel anytime.
        </p>
      </div>

      <PaymentElement />

      <div className="flex justify-between mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Subscribe Now'
          )}
        </Button>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-500 mt-2">
          {errorMessage}
        </div>
      )}
    </form>
  );
};

export default PaymentForm;

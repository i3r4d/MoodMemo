
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoaderIcon } from 'lucide-react';

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
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    // Check the payment intent status when the component loads
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onSuccess();
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Please provide payment details.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/settings?payment_success=true",
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "Payment failed");
          toast({
            title: "Payment Failed",
            description: error.message || "An error occurred during payment processing",
            variant: "destructive",
          });
        } else {
          setMessage("An unexpected error occurred.");
          toast({
            title: "Payment Error",
            description: "An unexpected error occurred during payment processing",
            variant: "destructive",
          });
        }
      } else {
        // Payment succeeded, update user's premium status
        if (user) {
          const { error: userUpdateError } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_expires_at: null, // Permanent premium
            })
            .eq('id', user.id);

          if (userUpdateError) {
            console.error('Error updating premium status:', userUpdateError);
            toast({
              title: "Account Update Failed",
              description: "Your payment was successful, but we couldn't update your account status. Please contact support.",
              variant: "destructive",
            });
          } else {
            setMessage("Payment succeeded!");
            toast({
              title: "Payment Successful",
              description: "Thank you for subscribing to MoodMemo Premium!",
            });
            onSuccess();
          }
        }
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setMessage("An error occurred during payment processing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement id="payment-element" options={{
          layout: 'tabs'
        }} />
        
        <AddressElement options={{
          mode: 'billing',
          fields: {
            phone: 'always',
          },
          validation: {
            phone: {
              required: 'always',
            },
          },
        }} />
      </div>

      <div className="bg-muted/30 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Total:</span>
          <span className="font-bold text-primary">${(amount / 100).toFixed(2)} / {interval}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          You can cancel your subscription at any time through the Settings page.
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="bg-primary"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Subscribe</>
          )}
        </Button>
      </div>

      {message && (
        <div className={`text-sm mt-2 ${message.includes("succeeded") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </div>
      )}
    </form>
  );
};

export default PaymentForm;

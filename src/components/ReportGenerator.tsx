
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LockIcon, FileTextIcon, AlertTriangleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ReportGeneratorProps {
  isPremium?: boolean;
  className?: string;
  insightsView?: boolean;
}

interface Report {
  id: string;
  user_id: string;
  timeframe: string;
  content: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const timeframeOptions = [
  { value: 'recent', label: 'Most Recent Entries', days: 7 },
  { value: 'week', label: 'Past Week', days: 7 },
  { value: 'twoWeeks', label: 'Past Two Weeks', days: 14 },
  { value: 'month', label: 'Past Month', days: 30 },
  { value: 'sixMonths', label: 'Past 180 Days', days: 180 },
  { value: 'year', label: 'Past Year', days: 365 },
];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ 
  className = '',
  insightsView = false
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  
  const isPremium = profile?.is_premium || false;

  const handleGenerateReport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate an AI insights report.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const selectedOption = timeframeOptions.find(option => option.value === timeframe);
      if (!selectedOption) {
        throw new Error("Invalid timeframe selected");
      }
      
      toast({
        title: "Report Generation Initiated",
        description: `Generating AI insights report for ${selectedOption.label.toLowerCase()}. This will be ready shortly.`,
      });
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedOption.days);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-ai-report', {
        body: {
          userId: user.id,
          timeframe: selectedOption.label,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      
      if (error) {
        console.error('Error generating report:', error);
        setError(error.message || "An error occurred while generating your report");
        toast({
          title: "Report Generation Failed",
          description: error.message || "An error occurred while generating your report.",
          variant: "destructive",
        });
        return;
      }
      
      if (data.error) {
        console.error('Error in response:', data.error);
        setError(data.error);
        
        // Special message for no entries
        if (data.error.includes('No journal entries found')) {
          toast({
            title: "No Journal Entries Found",
            description: "We couldn't find any journal entries for the selected timeframe. Try a different timeframe or add more entries.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Report Generation Failed",
            description: data.error || "An error occurred while generating your report.",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Handle successful report generation
      toast({
        title: "Report Ready",
        description: "Your AI insights report has been generated and is ready to view.",
      });
      
      // In a real app, you might navigate to a report viewer or open a modal
      console.log('Generated report:', data.report);
      
      // Auto-navigate to a report viewer would be ideal (future enhancement)
      // navigate(`/reports/${data.report.id}`);
    } catch (err: any) {
      console.error('Error in handleGenerateReport:', err);
      setError(err.message || "Something went wrong while generating your report");
      toast({
        title: "Error",
        description: err.message || "Something went wrong while generating your report.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePremiumClick = () => {
    // Redirect to settings page for premium upgrade
    navigate('/settings');
  };

  // If in insights view, use a different styling
  const containerClasses = insightsView 
    ? "px-4 py-3 bg-white/80 rounded-lg border border-primary/10 mb-4" 
    : "glass-morphism mood-journal-card space-y-4";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <FileTextIcon className="h-5 w-5 text-primary" />
        <h2 className={insightsView ? "text-lg font-medium" : "text-lg font-medium"}>AI Insights Report</h2>
      </div>
      
      {!isPremium ? (
        <div className="p-4 bg-white/60 rounded-lg border border-primary/10 space-y-3">
          <div className="flex items-center gap-3">
            <LockIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Premium Feature</p>
              <p className="text-sm text-muted-foreground">
                Generate detailed AI reports based on your mood patterns and journal entries
              </p>
            </div>
          </div>
          
          {/* Show premium UI in the preview even for free users */}
          <div className="space-y-4 mt-4 border-t pt-4 opacity-90">
            <p className="text-sm text-muted-foreground italic">
              Preview of premium features:
            </p>
            <div className="space-y-2">
              <Label htmlFor="timeframe-preview">Select Timeframe</Label>
              <Select disabled>
                <SelectTrigger className="w-full opacity-80">
                  <SelectValue placeholder="Past Month" />
                </SelectTrigger>
              </Select>
            </div>
            
            <Button 
              className="w-full opacity-80" 
              disabled
            >
              <FileTextIcon className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            
            <div className="text-xs text-muted-foreground opacity-80">
              Reports include sentiment analysis, common triggers, and actionable recommendations
              based on your entries during the selected timeframe.
            </div>
          </div>
          
          <Button 
            onClick={handlePremiumClick}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            Upgrade for $4.99/month
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Less than a latte per month for better mental wellness
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a detailed AI analysis of your journal entries and mood patterns
            for insights into your emotional well-being.
          </p>
          
          {error && (
            <div className="p-3 bg-red-50 rounded-md border border-red-200 flex items-start gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Error Generating Report</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="timeframe">Select Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateReport}
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <FileTextIcon className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Reports include sentiment analysis, common triggers, and actionable recommendations
            based on your entries during the selected timeframe.
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;

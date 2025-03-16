
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
import { LockIcon, FileTextIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportGeneratorProps {
  isPremium?: boolean;
  className?: string;
  insightsView?: boolean;
}

const timeframeOptions = [
  { value: 'recent', label: 'Most Recent Entries' },
  { value: 'week', label: 'Past Week' },
  { value: 'twoWeeks', label: 'Past Two Weeks' },
  { value: 'month', label: 'Past Month' },
  { value: 'sixMonths', label: 'Past 180 Days' },
  { value: 'year', label: 'Past Year' },
];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ 
  isPremium = false, 
  className = '',
  insightsView = false
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('month');

  const handleGenerateReport = () => {
    const selectedTimeframe = timeframeOptions.find(option => option.value === timeframe);
    
    toast({
      title: "Report Generation Initiated",
      description: `Generating AI insights report for ${selectedTimeframe?.label.toLowerCase()}. This will be ready shortly.`,
    });
    
    // Mock report generation - in a real app, this would call an API
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your AI insights report has been generated and is ready to download.",
      });
    }, 3000);
  };

  const handlePremiumClick = () => {
    // Redirect to settings page for premium upgrade instead of showing toast
    navigate('/settings');
  };

  // If in insights view, use a different styling
  const containerClasses = insightsView 
    ? "px-4 py-3 bg-white/80 rounded-lg border border-primary/10 mb-4" 
    : "glass-morphism mood-journal-card space-y-4";

  // For the preview window, always show the premium UI
  const showPremiumUI = true; // This is for the preview

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
          {showPremiumUI && (
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
          )}
          
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
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Generate Report
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


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FilePieChart, Download, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format, sub } from 'date-fns';
import { motion } from 'framer-motion';

interface ReportGeneratorProps {
  insightsView?: boolean;
}

interface Report {
  id: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  generated_at: string;
  content: string;
  total_entries: number;
  average_mood: number;
  mood_distribution: {
    joy?: number;
    calm?: number;
    neutral?: number;
    sad?: number;
    stress?: number;
  };
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ insightsView = false }) => {
  const [timeframe, setTimeframe] = useState('Past Month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const { toast } = useToast();
  const { user, isPremium } = useAuth();

  const getDateRange = (period: string): { startDate: string; endDate: string } => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'Past Week':
        startDate = sub(endDate, { weeks: 1 });
        break;
      case 'Past Month':
        startDate = sub(endDate, { months: 1 });
        break;
      case 'Past 3 Months':
        startDate = sub(endDate, { months: 3 });
        break;
      case 'Past Year':
        startDate = sub(endDate, { years: 1 });
        break;
      default:
        startDate = sub(endDate, { months: 1 });
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  const generateMockReport = (): Report => {
    const { startDate, endDate } = getDateRange(timeframe);
    const totalEntries = Math.floor(Math.random() * 20) + 5;
    
    return {
      id: Date.now().toString(),
      timeframe,
      start_date: startDate,
      end_date: endDate,
      generated_at: new Date().toISOString(),
      content: generateMockReportContent(timeframe),
      total_entries: totalEntries,
      average_mood: 3.5,
      mood_distribution: {
        joy: Math.floor(Math.random() * 10),
        calm: Math.floor(Math.random() * 10),
        neutral: Math.floor(Math.random() * 10),
        sad: Math.floor(Math.random() * 5),
        stress: Math.floor(Math.random() * 5)
      }
    };
  };

  const generateMockReportContent = (period: string): string => {
    return `
      # Mood Analysis Report: ${period}
      
      ## Overview
      During this period, you recorded multiple journal entries showing a range of emotions. 
      Your overall mood trend was positive, with more instances of joy and calm than stress or sadness.
      
      ## Patterns Observed
      - Mornings typically showed more optimistic entries
      - Evenings had deeper reflective content
      - Weekend entries were generally more positive than weekdays
      
      ## Language Analysis
      Words frequently associated with positive emotions included "grateful", "happy", and "relaxed".
      Words associated with challenges included "busy", "tired", and "stressed".
      
      ## Recommendations
      1. Consider morning journaling to set a positive tone for your day
      2. Try the Progressive Muscle Relaxation exercise when feeling stressed
      3. Practice gratitude journaling before bed to improve sleep quality
      
      ## Progress
      Compared to your previous reporting period, you've shown a 15% increase in positive emotion words.
      Keep up the good work!
    `;
  };

  const handleGenerateReport = async () => {
    if (!isPremium) {
      toast({
        title: 'Premium Feature',
        description: 'Please upgrade to premium to generate detailed reports.',
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReport = generateMockReport();
      setReport(mockReport);
      
      toast({
        title: 'Report Generated',
        description: `Your ${timeframe} report is ready to view.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    // Create a Blob from the report content
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link to download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-report-${format(new Date(report.generated_at), 'yyyy-MM-dd')}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Report Downloaded',
      description: 'Your report has been downloaded as a Markdown file.',
    });
  };

  if (insightsView) {
    return (
      <Card className="border-primary/20 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePieChart className="h-5 w-5 text-primary" />
            AI Mood Analysis Report
          </CardTitle>
          <CardDescription>
            Generate a comprehensive analysis of your mood patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Past Week">Past Week</SelectItem>
                <SelectItem value="Past Month">Past Month</SelectItem>
                <SelectItem value="Past 3 Months">Past 3 Months</SelectItem>
                <SelectItem value="Past Year">Past Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating || !isPremium}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
          
          {report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {report.timeframe} Report
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Generated on {format(new Date(report.generated_at), 'PPP')}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm space-y-2">
                    <p><strong>Period:</strong> {format(new Date(report.start_date), 'MMM d, yyyy')} - {format(new Date(report.end_date), 'MMM d, yyyy')}</p>
                    <p><strong>Total Entries:</strong> {report.total_entries}</p>
                    <p><strong>Mood Distribution:</strong></p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(report.mood_distribution).map(([mood, count]) => (
                        <div key={mood} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                          {mood}: {count}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="px-0 h-8" onClick={() => window.open('/reports', '_blank')}>
                    View full report
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Mood Analysis Reports</h1>
      </div>
      
      {!isPremium ? (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              Upgrade to premium to access detailed AI-powered mood analysis reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 justify-center py-6">
              <FilePieChart className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold mb-1">Unlock Advanced Insights</h3>
                <p className="text-muted-foreground">
                  Get personalized reports about your mood patterns, language usage,
                  and actionable recommendations to improve your well-being.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => toast({
              title: "Premium Required",
              description: "Please upgrade to premium to use this feature."
            })}>
              Upgrade to Premium
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Select a timeframe to analyze your journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Past Week">Past Week</SelectItem>
                    <SelectItem value="Past Month">Past Month</SelectItem>
                    <SelectItem value="Past 3 Months">Past 3 Months</SelectItem>
                    <SelectItem value="Past Year">Past Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{report.timeframe} Mood Analysis</CardTitle>
                      <CardDescription>
                        Generated on {format(new Date(report.generated_at), 'PPP')}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Period: {format(new Date(report.start_date), 'MMM d, yyyy')} - {format(new Date(report.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border">
                        <CardHeader className="py-4">
                          <CardTitle className="text-base">Entries Analyzed</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-center">
                            {report.total_entries}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border">
                        <CardHeader className="py-4">
                          <CardTitle className="text-base">Average Mood</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-center">
                            {report.average_mood.toFixed(1)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border">
                        <CardHeader className="py-4">
                          <CardTitle className="text-base">Top Mood</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-center capitalize">
                            {Object.entries(report.mood_distribution)
                              .sort((a, b) => b[1] - a[1])[0][0]}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border rounded-lg p-4 mt-6">
                      <h3 className="font-medium mb-2">Mood Distribution</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(report.mood_distribution).map(([mood, count]) => (
                          <div key={mood} className="px-3 py-1.5 bg-primary/10 rounded-full flex items-center gap-2">
                            <span className="capitalize">{mood}</span>
                            <span className="bg-primary/20 px-1.5 py-0.5 rounded-full text-xs font-medium">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 whitespace-pre-line">
                      <h3 className="font-medium mb-2">Report Summary</h3>
                      <div className="text-sm text-muted-foreground">
                        {report.content.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="mb-2">
                            {paragraph.replace(/^#+ /, '')}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportGenerator;

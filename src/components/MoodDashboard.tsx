
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MoodDistribution {
  joy: number;
  calm: number;
  neutral: number;
  sad: number;
  stress: number;
  unknown: number;
}

interface WeeklyMoodData {
  day: string;
  joy: number;
  calm: number;
  neutral: number;
  sad: number;
  stress: number;
}

interface MoodDashboardProps {
  moodDistribution: MoodDistribution;
  weeklyMoodData: WeeklyMoodData[];
  entriesCount: number;
}

const MoodDashboard: React.FC<MoodDashboardProps> = ({
  moodDistribution,
  weeklyMoodData,
  entriesCount,
}) => {
  // Prepare data for pie chart
  const pieData = [
    { name: 'Joy', value: moodDistribution.joy, color: '#89CFF0' },
    { name: 'Calm', value: moodDistribution.calm, color: '#A7C7E7' },
    { name: 'Neutral', value: moodDistribution.neutral, color: '#B6D0E2' },
    { name: 'Sad', value: moodDistribution.sad, color: '#9EB6C3' },
    { name: 'Stress', value: moodDistribution.stress, color: '#7393B3' },
  ].filter(item => item.value > 0);

  // Get the dominant mood
  const getDominantMood = () => {
    if (pieData.length === 0) return 'No entries yet';
    
    const max = Math.max(...pieData.map(d => d.value));
    const dominant = pieData.find(d => d.value === max);
    
    return dominant?.name || 'Unknown';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="glass-morphism mood-journal-card space-y-4">
        <h3 className="text-lg font-medium">Mood Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/30 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Entries</p>
            <p className="text-2xl font-semibold mt-1">{entriesCount}</p>
          </div>
          
          <div className="bg-secondary/30 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Dominant Mood</p>
            <p className="text-2xl font-semibold mt-1">{getDominantMood()}</p>
          </div>
          
          <div className="bg-secondary/30 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Most Recent</p>
            <p className="text-2xl font-semibold mt-1">
              {entriesCount > 0 ? weeklyMoodData[weeklyMoodData.length - 1]?.day : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>
      
      {pieData.length > 0 && (
        <motion.div variants={itemVariants} className="glass-morphism mood-journal-card">
          <h3 className="text-lg font-medium mb-4">Mood Distribution</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} entries`, name]}
                  contentStyle={{
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
      
      {weeklyMoodData.length > 0 && (
        <motion.div variants={itemVariants} className="glass-morphism mood-journal-card">
          <h3 className="text-lg font-medium mb-4">Weekly Mood Trends</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMoodData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="joy" name="Joy" stackId="a" fill="#89CFF0" />
                <Bar dataKey="calm" name="Calm" stackId="a" fill="#A7C7E7" />
                <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#B6D0E2" />
                <Bar dataKey="sad" name="Sad" stackId="a" fill="#9EB6C3" />
                <Bar dataKey="stress" name="Stress" stackId="a" fill="#7393B3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="glass-morphism mood-journal-card space-y-3">
        <h3 className="text-lg font-medium">AI Insights</h3>
        
        <div className={cn(
          "p-4 rounded-lg border border-primary/20 bg-primary/5",
          "flex items-start gap-3"
        )}>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          
          <div className="space-y-1 text-sm leading-relaxed">
            <p>Based on your journal entries, you've been experiencing more <span className="font-medium text-primary">calm moments</span> this week compared to last week.</p>
            <p>Try the new guided breathing exercise to maintain this positive trend.</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-accent-foreground">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
          </div>
          
          <div className="space-y-1 text-sm leading-relaxed">
            <p>Notice your journaling is most consistent in the <span className="font-medium">evenings</span>.</p>
            <p>Maintaining this routine has been shown to improve sleep quality and reduce next-day anxiety.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MoodDashboard;

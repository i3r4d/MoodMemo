import React from 'react';
import AnimatedTransition from '@/components/AnimatedTransition';
import ReportGenerator from '@/components/ReportGenerator';

const Dashboard = () => {
  return (
    <AnimatedTransition keyValue="dashboard">
      <div className="max-w-4xl mx-auto py-4">
        <ReportGenerator insightsView={true} />
      </div>
    </AnimatedTransition>
  );
};

export default Dashboard;

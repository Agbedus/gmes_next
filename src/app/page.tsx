import React from 'react';
import DashboardContainer from '@/components/ui/summary/dashboardContainer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="p-6">
        <DashboardContainer />
      </div>
    </div>
  );
}

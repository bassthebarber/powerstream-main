import React from 'react';
import RevenueSplitChart from './RevenueSplitChart';
import StreamAnalytics from './StreamAnalytics';
import PayoutHistory from './PayoutHistory';

export default function RoyaltyDashboard() {
  return (
    <div>
      <h2>Royalty Dashboard</h2>
      <StreamAnalytics />
      <RevenueSplitChart />
      <PayoutHistory />
    </div>
  );
}

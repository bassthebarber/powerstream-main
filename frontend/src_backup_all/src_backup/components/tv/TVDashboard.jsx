import React from 'react';

// Import all your TV components from the index file
import {
  PowerTVGuide,
  PowerTVPlayer,
  SouthernPowerStationCore,
  TVRoyaltyBreakdownChart,
  TVRoyaltyAlertBanner,
  TVPayoutHistory,
  GlobalDistributionTracker
} from './index';

export default function TVDashboard() {
  return (
    <div className="tv-dashboard" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>📺 PowerStream TV Station Control</h1>

      <section style={{ marginBottom: '2rem' }}>
        <TVRoyaltyAlertBanner />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <PowerTVGuide />
        </div>
        <div>
          <PowerTVPlayer />
        </div>
        <div>
          <TVRoyaltyBreakdownChart />
        </div>
        <div>
          <TVPayoutHistory />
        </div>
        <div>
          <GlobalDistributionTracker />
        </div>
        <div>
          <SouthernPowerStationCore />
        </div>
      </section>
    </div>
  );
}

// frontend/src/components/recordingStudio/contracts/RevenueSmartSplitLedger.jsx
import React from 'react';

export default function RevenueSmartSplitLedger() {
  const splits = [
    { name: 'Artist', percentage: 50 },
    { name: 'Producer', percentage: 30 },
    { name: 'Platform', percentage: 20 },
  ];

  return (
    <div className="revenue-ledger">
      <h2>💸 Revenue Smart Split Ledger</h2>
      <table>
        <thead>
          <tr>
            <th>Contributor</th>
            <th>Split (%)</th>
          </tr>
        </thead>
        <tbody>
          {splits.map((s, idx) => (
            <tr key={idx}>
              <td>{s.name}</td>
              <td>{s.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Smart ledger synced with contract payout engine.</p>
    </div>
  );
}

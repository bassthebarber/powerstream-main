import React from 'react';

const payouts = [
  { track: "Track 1", amount: "$420", date: "2025-10-01" },
  { track: "Track 2", amount: "$260", date: "2025-09-22" },
];

export default function PayoutHistory() {
  return (
    <div>
      <h4>Payout History</h4>
      <ul>
        {payouts.map((p, i) => (
          <li key={i}>{p.track} — {p.amount} — {p.date}</li>
        ))}
      </ul>
    </div>
  );
}

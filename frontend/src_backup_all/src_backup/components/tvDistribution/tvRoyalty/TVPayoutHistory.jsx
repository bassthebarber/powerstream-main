// TVPayoutHistory.jsx
import React from 'react';

const payoutData = [
  {
    creator: 'Southern Power Syndicate',
    amount: '$1,200.00',
    date: '2025-09-30',
    method: 'Direct Deposit',
    status: 'Paid',
  },
  {
    creator: 'No Limit East Houston',
    amount: '$975.00',
    date: '2025-09-15',
    method: 'ACH',
    status: 'Paid',
  },
  {
    creator: 'Texas Got Talent',
    amount: '$1,580.00',
    date: '2025-08-31',
    method: 'Wire Transfer',
    status: 'Paid',
  },
];

export default function TVPayoutHistory() {
  return (
    <div className="tv-payout-history">
      <h2>💵 TV Payout History</h2>
      <table>
        <thead>
          <tr>
            <th>Creator</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payoutData.map((payout, index) => (
            <tr key={index}>
              <td>{payout.creator}</td>
              <td>{payout.amount}</td>
              <td>{payout.date}</td>
              <td>{payout.method}</td>
              <td>{payout.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

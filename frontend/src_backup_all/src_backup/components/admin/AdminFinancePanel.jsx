// frontend/src/components/admin/AdminFinancePanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminFinancePanel() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get('/api/admin/finance/summary', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSummary(data.summary);
      } catch (err) {
        console.error('Error fetching summary:', err.message);
      }
    };
    fetchSummary();
  }, []);

  if (!summary) return <p>Loading finance data...</p>;

  return (
    <div className="admin-finance-panel">
      <h2>📊 PowerStream Finance Summary</h2>
      <ul>
        <li>Total Revenue: ${summary.totalRevenue.toLocaleString()}</li>
        <li>Total Payouts: ${summary.totalPayouts.toLocaleString()}</li>
        <li>Net Balance: ${summary.netBalance.toLocaleString()}</li>
        <li>Total Transactions: {summary.transactionCount}</li>
      </ul>
    </div>
  );
}

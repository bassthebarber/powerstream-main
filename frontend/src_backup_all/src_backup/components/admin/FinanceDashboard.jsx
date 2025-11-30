// frontend/src/components/admin/FinanceDashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FinanceDashboard.css';

export default function FinanceDashboard() {
  const [summary, setSummary] = useState({ total: 0, pending: 0, payouts: [] });

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/api/admin/finance-summary');
      setSummary(res.data);
    };
    fetchData();
  }, []);

  return (
    <div className="finance-dashboard">
      <h2>💼 Finance Dashboard</h2>
      <p>Total Revenue: ${summary.total}</p>
      <p>Pending Payouts: ${summary.pending}</p>

      <h3>Recent Transactions</h3>
      <ul>
        {summary.payouts.map((p, i) => (
          <li key={i}>
            ${p.amount} to {p.user?.email || p.userId} for {p.reason} via {p.method} on {new Date(p.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

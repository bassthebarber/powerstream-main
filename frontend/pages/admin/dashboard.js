// pages/admin/dashboard.js
import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage platform-wide analytics, stations, streams, and users here.</p>
      {/* TODO: Connect to /api/admin/analytics */}
    </div>
  );
}

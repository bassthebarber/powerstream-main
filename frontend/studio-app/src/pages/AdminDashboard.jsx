// frontend/studio-app/src/pages/AdminDashboard.jsx
// Admin Dashboard - Full overview of studio jobs, sessions, and earnings
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getJobPricing,
  getMyJobs,
  getLiveSessions,
  getMyContracts,
  updateJobStatus,
} from "../lib/studioApi.js";

/**
 * AdminDashboard - Full admin view for Marcus & No Limit Gangsta
 * 
 * Features:
 * - Overview of all jobs and earnings
 * - Platform fee tracking
 * - Session management
 * - Contract oversight
 */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    platformFees: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [pendingContracts, setPendingContracts] = useState([]);
  const [pricing, setPricing] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all data
      const [pricingRes, jobsRes, sessionsRes, contractsRes] = await Promise.all([
        getJobPricing(),
        getMyJobs({ limit: 50 }), // Admin sees all jobs
        getLiveSessions(),
        getMyContracts({ role: "admin" }),
      ]);

      setPricing(pricingRes.prices || {});
      setRecentJobs(jobsRes.jobs || []);
      setActiveSessions(sessionsRes.sessions || []);
      setPendingContracts(contractsRes.contracts || []);

      // Calculate stats from jobs
      const jobs = jobsRes.jobs || [];
      const completed = jobs.filter(j => j.status === "paid" || j.status === "completed");
      const pending = jobs.filter(j => j.status === "open" || j.status === "in_progress");

      // Calculate earnings (mock - in real app would come from backend)
      let totalEarnings = 0;
      let platformFees = 0;
      completed.forEach(job => {
        if (job.pricing) {
          totalEarnings += job.pricing.basePrice || 0;
          platformFees += job.pricing.platformFeeAmount || 0;
        }
      });

      setStats({
        totalJobs: jobs.length,
        pendingJobs: pending.length,
        completedJobs: completed.length,
        totalEarnings: totalEarnings / 100, // cents to dollars
        platformFees: platformFees / 100,
      });

    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      loadData(); // Refresh
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Status colors
  const statusColors = {
    open: "#f59e0b",
    in_progress: "#3b82f6",
    delivered: "#8b5cf6",
    approved: "#22c55e",
    paid: "#10b981",
    cancelled: "#ef4444",
    revision: "#f97316",
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #fff;
          padding: 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .admin-header h1 {
          font-size: 1.75rem;
          color: #d4af37;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-badge {
          background: #ef4444;
          color: #fff;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-card.highlight {
          border-color: #d4af37;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a1a 100%);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #d4af37;
        }

        .stat-value.money::before {
          content: '$';
          font-size: 1.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #888;
          margin-top: 0.5rem;
        }

        .section {
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 1.25rem;
          color: #d4af37;
        }

        .view-all-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d4af37;
          background: transparent;
          color: #d4af37;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .view-all-btn:hover {
          background: #d4af371a;
        }

        .table-container {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #333;
        }

        .data-table th {
          background: #0a0a0a;
          color: #888;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover {
          background: #222;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-select {
          background: #222;
          border: 1px solid #444;
          color: #fff;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .pricing-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }

        .pricing-type {
          font-size: 0.875rem;
          color: #d4af37;
          text-transform: capitalize;
          margin-bottom: 0.5rem;
        }

        .pricing-amount {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .pricing-fee {
          font-size: 0.75rem;
          color: #888;
          margin-top: 0.25rem;
        }

        .admin-dashboard.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>

      {/* Header */}
      <div className="admin-header">
        <h1>
          👑 Admin Dashboard
          <span className="admin-badge">ADMIN</span>
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-value money">{stats.platformFees.toFixed(2)}</div>
          <div className="stat-label">Platform Earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value money">{stats.totalEarnings.toFixed(2)}</div>
          <div className="stat-label">Total Job Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalJobs}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingJobs}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedJobs}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Pricing Overview */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Service Pricing</h2>
        </div>
        <div className="pricing-grid">
          {Object.entries(pricing).map(([type, data]) => (
            <div key={type} className="pricing-card">
              <div className="pricing-type">{type.replace(/_/g, " ")}</div>
              <div className="pricing-amount">{data.formatted}</div>
              <div className="pricing-fee">
                Platform: {data.platformFeePercent}% ({data.platformFeeFormatted})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Jobs</h2>
          <button className="view-all-btn" onClick={() => navigate("/studio/jobs")}>
            View All
          </button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Artist</th>
                <th>Engineer</th>
                <th>Type</th>
                <th>Value</th>
                <th>Platform Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.slice(0, 10).map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.artist?.name || "—"}</td>
                  <td>{job.engineer?.name || "Unassigned"}</td>
                  <td>{job.type}</td>
                  <td>{job.pricing?.basePriceFormatted || "—"}</td>
                  <td>{job.pricing?.platformFeeFormatted || "—"}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        background: statusColors[job.status] || "#888",
                        color: "#000"
                      }}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="status-select"
                      value={job.status}
                      onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="delivered">Delivered</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {recentJobs.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No jobs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Active Recording Sessions</h2>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Room Code</th>
                <th>Artist</th>
                <th>Engineer</th>
                <th>Tracks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map(session => (
                <tr key={session.id}>
                  <td>{session.name}</td>
                  <td><code>{session.roomCode}</code></td>
                  <td>{session.artist?.name || "—"}</td>
                  <td>{session.engineer?.name || "None"}</td>
                  <td>{session.trackCount || 0}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        background: session.status === "live" ? "#22c55e" : "#f59e0b",
                        color: "#000"
                      }}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
              {activeSessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No active sessions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Contracts */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Contracts</h2>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contract #</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Engineer</th>
                <th>Total</th>
                <th>Platform Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingContracts.slice(0, 5).map(contract => (
                <tr key={contract.id}>
                  <td><code>{contract.contractNumber}</code></td>
                  <td>{contract.title}</td>
                  <td>{contract.artist?.name || "—"}</td>
                  <td>{contract.engineer?.name || "—"}</td>
                  <td>{contract.pricingSummary?.total || "—"}</td>
                  <td>{contract.pricingSummary?.platformFee || "—"}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ background: "#8b5cf6", color: "#fff" }}
                    >
                      {contract.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pendingContracts.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No contracts yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}





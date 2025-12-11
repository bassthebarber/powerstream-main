// frontend/studio-app/src/pages/EngineerDashboard.jsx
// Engineer Dashboard - View and manage assigned jobs
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEngineerJobs,
  getOpenJobs,
  getLiveSessions,
  assignEngineerToJob,
  submitJobDeliverable,
  getPendingContracts,
  signContract,
} from "../lib/studioApi.js";

/**
 * EngineerDashboard - Main dashboard for engineers to manage their work
 * 
 * Features:
 * - View assigned jobs
 * - Pick up open jobs
 * - View active live sessions
 * - Submit deliverables
 * - Sign pending contracts
 */
export default function EngineerDashboard() {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState("my-jobs");
  const [myJobs, setMyJobs] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [pendingContracts, setPendingContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, openRes, sessionsRes, contractsRes] = await Promise.all([
        getEngineerJobs(),
        getOpenJobs(),
        getLiveSessions({ status: "live" }),
        getPendingContracts(),
      ]);

      setMyJobs(jobsRes.jobs || []);
      setOpenJobs(openRes.jobs || []);
      setLiveSessions(sessionsRes.sessions || []);
      setPendingContracts(contractsRes.pendingAsEngineer || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickUpJob = async (jobId) => {
    try {
      await assignEngineerToJob(jobId);
      loadData(); // Refresh
    } catch (err) {
      alert("Failed to pick up job: " + err.message);
    }
  };

  const handleSignContract = async (contractId) => {
    try {
      await signContract(contractId);
      loadData(); // Refresh
      alert("Contract signed successfully!");
    } catch (err) {
      alert("Failed to sign contract: " + err.message);
    }
  };

  const handleJoinSession = (sessionId) => {
    navigate(`/studio/live-room/${sessionId}`);
  };

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      open: "#f59e0b",
      in_progress: "#3b82f6",
      delivered: "#8b5cf6",
      approved: "#22c55e",
      paid: "#10b981",
      revision: "#ef4444",
    };
    return colors[status] || "#888";
  };

  if (loading) {
    return (
      <div className="engineer-dashboard loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="engineer-dashboard">
      <style>{`
        .engineer-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #fff;
          padding: 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 1.75rem;
          color: #d4af37;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stats-bar {
          display: flex;
          gap: 1.5rem;
        }

        .stat-item {
          text-align: center;
          padding: 0.75rem 1.25rem;
          background: #1a1a1a;
          border-radius: 8px;
          border: 1px solid #333;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #d4af37;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #888;
          margin-top: 0.25rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #333;
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: #888;
          cursor: pointer;
          font-size: 0.875rem;
          border-radius: 8px 8px 0 0;
          transition: all 0.2s;
          position: relative;
        }

        .tab-btn:hover {
          color: #fff;
          background: #222;
        }

        .tab-btn.active {
          color: #d4af37;
          background: #1a1a1a;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #d4af37;
        }

        .tab-badge {
          background: #d4af37;
          color: #000;
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .job-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .job-card:hover {
          border-color: #d4af37;
          transform: translateY(-2px);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .job-type {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #d4af37;
          background: #d4af371a;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .job-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 500;
        }

        .job-title {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
        }

        .job-artist {
          font-size: 0.875rem;
          color: #888;
          margin-bottom: 1rem;
        }

        .job-pricing {
          background: #0a0a0a;
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .price-row.total {
          color: #d4af37;
          font-weight: 600;
          border-top: 1px solid #333;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
        }

        .job-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-btn.primary {
          background: #d4af37;
          color: #000;
        }

        .action-btn.primary:hover {
          background: #e5c349;
        }

        .action-btn.secondary {
          background: #333;
          color: #fff;
        }

        .action-btn.secondary:hover {
          background: #444;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .empty-state .icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .session-card {
          background: #1a1a1a;
          border: 1px solid #22c55e;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #22c55e;
          font-size: 0.875rem;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .contract-card {
          background: #1a1a1a;
          border: 1px solid #8b5cf6;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .contract-number {
          font-family: monospace;
          font-size: 0.75rem;
          color: #8b5cf6;
        }

        .engineer-dashboard.loading {
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
      `}</style>

      {/* Header */}
      <div className="dashboard-header">
        <h1>🎛️ Engineer Dashboard</h1>
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-value">{myJobs.length}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{openJobs.length}</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{liveSessions.length}</div>
            <div className="stat-label">Live Sessions</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "my-jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("my-jobs")}
        >
          My Jobs
          {myJobs.length > 0 && <span className="tab-badge">{myJobs.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === "open-jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("open-jobs")}
        >
          Open Jobs
          {openJobs.length > 0 && <span className="tab-badge">{openJobs.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === "live-sessions" ? "active" : ""}`}
          onClick={() => setActiveTab("live-sessions")}
        >
          Live Sessions
          {liveSessions.length > 0 && <span className="tab-badge">{liveSessions.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === "contracts" ? "active" : ""}`}
          onClick={() => setActiveTab("contracts")}
        >
          Contracts
          {pendingContracts.length > 0 && <span className="tab-badge">{pendingContracts.length}</span>}
        </button>
      </div>

      {/* Content */}
      {activeTab === "my-jobs" && (
        <div className="jobs-grid">
          {myJobs.length > 0 ? (
            myJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <span className="job-type">{job.type}</span>
                  <span 
                    className="job-status" 
                    style={{ background: getStatusColor(job.status), color: "#000" }}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="job-title">{job.title}</div>
                <div className="job-artist">Artist: {job.artist?.name || "Unknown"}</div>
                
                <div className="job-pricing">
                  <div className="price-row">
                    <span>Your Payout:</span>
                    <span>{job.pricing?.engineerAmountFormatted}</span>
                  </div>
                  <div className="price-row">
                    <span>Revisions Used:</span>
                    <span>{job.revisionCount} / {job.maxRevisions}</span>
                  </div>
                </div>

                <div className="job-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate(`/studio/job/${job.id}`)}
                  >
                    View Details
                  </button>
                  {job.status === "in_progress" && (
                    <button 
                      className="action-btn primary"
                      onClick={() => navigate(`/studio/job/${job.id}/deliver`)}
                    >
                      Deliver Work
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>No active jobs. Check the Open Jobs tab to pick up new work!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "open-jobs" && (
        <div className="jobs-grid">
          {openJobs.length > 0 ? (
            openJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <span className="job-type">{job.type}</span>
                  <span 
                    className="job-status" 
                    style={{ background: getStatusColor(job.status), color: "#000" }}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="job-title">{job.title}</div>
                <div className="job-artist">Artist: {job.artist?.name || "Unknown"}</div>
                <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "1rem" }}>
                  {job.description || "No description provided."}
                </p>
                
                <div className="job-pricing">
                  <div className="price-row">
                    <span>Your Payout:</span>
                    <span>{job.pricing?.engineerAmountFormatted}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total Job Value:</span>
                    <span>{job.pricing?.basePriceFormatted}</span>
                  </div>
                </div>

                <div className="job-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => handlePickUpJob(job.id)}
                  >
                    Pick Up Job
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="icon">🎯</div>
              <p>No open jobs available right now. Check back later!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "live-sessions" && (
        <div className="jobs-grid">
          {liveSessions.length > 0 ? (
            liveSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div>
                    <div className="job-title">{session.name}</div>
                    <div className="job-artist">Artist: {session.artist?.name || "Unknown"}</div>
                  </div>
                  <div className="live-indicator">
                    <div className="live-dot"></div>
                    LIVE
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "1rem" }}>
                  Room Code: <code>{session.roomCode}</code>
                </p>
                <div className="job-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleJoinSession(session.id)}
                  >
                    Join Session
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="icon">🎙️</div>
              <p>No live recording sessions right now.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "contracts" && (
        <div className="jobs-grid">
          {pendingContracts.length > 0 ? (
            pendingContracts.map(contract => (
              <div key={contract.id} className="contract-card">
                <div className="contract-header">
                  <span className="contract-number">{contract.contractNumber}</span>
                  <span 
                    className="job-status" 
                    style={{ background: "#8b5cf6", color: "#fff" }}
                  >
                    {contract.status}
                  </span>
                </div>
                <div className="job-title">{contract.title}</div>
                <div className="job-artist">Artist: {contract.artist?.name || "Unknown"}</div>
                
                <div className="job-pricing">
                  <div className="price-row">
                    <span>Your Payout:</span>
                    <span>{contract.pricingSummary?.engineerPayout}</span>
                  </div>
                  <div className="price-row">
                    <span>Total:</span>
                    <span>{contract.pricingSummary?.total}</span>
                  </div>
                </div>

                <div className="job-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate(`/studio/contract/${contract.id}`)}
                  >
                    View Contract
                  </button>
                  <button 
                    className="action-btn primary"
                    onClick={() => handleSignContract(contract.id)}
                  >
                    Sign Contract
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="icon">📝</div>
              <p>No contracts pending your signature.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}




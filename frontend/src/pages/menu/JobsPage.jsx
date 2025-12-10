// frontend/src/pages/menu/JobsPage.jsx
import React from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

const APPLY_EMAIL = "SPSStreamNetwork@gmail.com";

export default function JobsPage() {
  const mockJobs = [
    { id: 1, title: "Mix Engineer Needed", company: "PowerStream Studios", type: "Freelance", rate: "$100-200", icon: "🎛️" },
    { id: 2, title: "Beat Producer", company: "Southern Power", type: "Contract", rate: "$150/beat", icon: "🎹" },
    { id: 3, title: "Vocalist for Feature", company: "No Limit Records", type: "One-time", rate: "Negotiable", icon: "🎤" },
    { id: 4, title: "Video Director", company: "Visual Arts Co", type: "Project", rate: "$500+", icon: "🎬" },
  ];

  const handleApply = (job) => {
    const subject = encodeURIComponent(`Job Application – ${job.title}`);
    const body = encodeURIComponent(
      `Hi PowerStream Team,\n\n` +
      `I am interested in applying for the "${job.title}" position at ${job.company}.\n\n` +
      `Job ID: ${job.id}\n` +
      `Rate: ${job.rate}\n` +
      `Type: ${job.type}\n\n` +
      `[Please include your name, experience, and portfolio link]\n\n` +
      `Best regards,\n[Your Name]\n[Your Contact Info]`
    );
    window.location.href = `mailto:${APPLY_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <MenuPageLayout
      icon="💼"
      title="Jobs & Gigs"
      subtitle="Find music industry opportunities"
    >
      <div className="jobs-filters">
        <select className="jobs-filter">
          <option>All Categories</option>
          <option>Production</option>
          <option>Engineering</option>
          <option>Performance</option>
          <option>Video</option>
        </select>
        <select className="jobs-filter">
          <option>All Types</option>
          <option>Freelance</option>
          <option>Contract</option>
          <option>Full-time</option>
        </select>
      </div>

      <div className="ps-menu-list">
        {mockJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-icon">{job.icon}</div>
            <div className="job-info">
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <div className="job-tags">
                <span className="job-tag">{job.type}</span>
                <span className="job-tag job-tag--rate">{job.rate}</span>
              </div>
            </div>
            <button 
              className="ps-menu-btn ps-menu-btn--primary"
              onClick={() => handleApply(job)}
            >
              ✉️ Apply
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .jobs-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .jobs-filter {
          padding: 10px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .job-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }

        .job-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: rgba(230,184,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .job-info {
          flex: 1;
        }

        .job-info h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .job-info p {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 8px 0;
        }

        .job-tags {
          display: flex;
          gap: 8px;
        }

        .job-tag {
          padding: 4px 10px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          font-size: 12px;
          color: var(--muted);
        }

        .job-tag--rate {
          background: rgba(230,184,0,0.15);
          color: var(--gold);
        }
      `}</style>
    </MenuPageLayout>
  );
}


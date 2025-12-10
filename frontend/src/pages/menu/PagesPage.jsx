// frontend/src/pages/menu/PagesPage.jsx
import React from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function PagesPage() {
  const mockPages = [
    { id: 1, name: "Southern Power Syndicate", followers: 15200, verified: true, category: "Record Label" },
    { id: 2, name: "No Limit Houston", followers: 8900, verified: true, category: "Artist" },
    { id: 3, name: "Texas Got Talent", followers: 6700, verified: false, category: "Show" },
    { id: 4, name: "PowerStream Studios", followers: 4500, verified: true, category: "Business" },
  ];

  return (
    <MenuPageLayout
      icon="📚"
      title="Pages"
      subtitle="Creator pages and channels"
    >
      <div className="pages-actions">
        <button className="ps-menu-btn ps-menu-btn--primary">+ Create Page</button>
      </div>

      <h3 className="pages-section-title">Pages You Follow</h3>
      <div className="ps-menu-list">
        {mockPages.map((page) => (
          <div key={page.id} className="page-item">
            <div className="page-avatar">
              {page.name[0]}
              {page.verified && <span className="page-verified">✓</span>}
            </div>
            <div className="page-info">
              <h4>
                {page.name}
                {page.verified && <span className="page-badge">✓</span>}
              </h4>
              <p>{page.category} • {page.followers.toLocaleString()} followers</p>
            </div>
            <button className="ps-menu-btn ps-menu-btn--secondary">View</button>
          </div>
        ))}
      </div>

      <style>{`
        .pages-actions {
          margin-bottom: 24px;
        }

        .pages-section-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: var(--muted);
        }

        .page-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }

        .page-avatar {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--gold), #ffda5c);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          position: relative;
        }

        .page-verified {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: #1da1f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;
          border: 2px solid #000;
        }

        .page-info {
          flex: 1;
        }

        .page-info h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .page-badge {
          color: #1da1f2;
          font-size: 14px;
        }

        .page-info p {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
        }
      `}</style>
    </MenuPageLayout>
  );
}




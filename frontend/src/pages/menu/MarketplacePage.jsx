// frontend/src/pages/menu/MarketplacePage.jsx
import React from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function MarketplacePage() {
  const mockItems = [
    { id: 1, name: "Custom Beat Pack", price: 49.99, seller: "Studio Pro", image: "🎵" },
    { id: 2, name: "Vocal Presets Bundle", price: 29.99, seller: "Mix Master", image: "🎤" },
    { id: 3, name: "808 Sample Kit", price: 19.99, seller: "Beat Lab", image: "🥁" },
    { id: 4, name: "Mastering Chain Preset", price: 39.99, seller: "Pro Audio", image: "🎛️" },
    { id: 5, name: "Lo-Fi Guitar Loops", price: 24.99, seller: "Chill Sounds", image: "🎸" },
    { id: 6, name: "Trap Hi-Hat Patterns", price: 14.99, seller: "Trap King", image: "🔊" },
  ];

  return (
    <MenuPageLayout
      icon="🛒"
      title="Marketplace"
      subtitle="Buy and sell beats, samples, and more"
    >
      <div className="marketplace-filters">
        <select className="marketplace-filter">
          <option>All Categories</option>
          <option>Beats</option>
          <option>Samples</option>
          <option>Presets</option>
          <option>Services</option>
        </select>
        <select className="marketplace-filter">
          <option>Sort: Popular</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
      </div>

      <div className="ps-menu-grid">
        {mockItems.map((item) => (
          <div key={item.id} className="marketplace-item">
            <div className="marketplace-item-image">{item.image}</div>
            <div className="marketplace-item-info">
              <h3 className="marketplace-item-name">{item.name}</h3>
              <p className="marketplace-item-seller">by {item.seller}</p>
              <div className="marketplace-item-footer">
                <span className="marketplace-item-price">${item.price}</span>
                <button className="ps-menu-btn ps-menu-btn--primary">Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .marketplace-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .marketplace-filter {
          padding: 10px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .marketplace-item {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .marketplace-item:hover {
          border-color: rgba(230,184,0,0.3);
          transform: translateY(-2px);
        }

        .marketplace-item-image {
          height: 140px;
          background: linear-gradient(135deg, rgba(230,184,0,0.1), rgba(230,184,0,0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .marketplace-item-info {
          padding: 16px;
        }

        .marketplace-item-name {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .marketplace-item-seller {
          font-size: 13px;
          color: var(--muted);
          margin: 0 0 12px 0;
        }

        .marketplace-item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .marketplace-item-price {
          font-size: 18px;
          font-weight: 800;
          color: var(--gold);
        }
      `}</style>
    </MenuPageLayout>
  );
}




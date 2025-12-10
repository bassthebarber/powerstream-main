// frontend/src/components/monetization/CoinHistory.jsx
// Coin transaction history component per Overlord Spec
import React, { useEffect, useState } from "react";
import { useCoins } from "../../context/CoinContext.jsx";
import { Spinner } from "../common";
import "./monetization.css";

const TYPE_ICONS = {
  earn: "📈",
  spend: "📉",
  purchase: "💳",
  tip: "💝",
  admin_adjust: "⚙️",
  refund: "↩️",
};

const TYPE_LABELS = {
  earn: "Earned",
  spend: "Spent",
  purchase: "Purchased",
  tip: "Tip",
  admin_adjust: "Adjustment",
  refund: "Refund",
};

export default function CoinHistory({ limit = 20 }) {
  const { fetchHistory, loading } = useCoins();
  const [transactions, setTransactions] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (skip = 0) => {
    const result = await fetchHistory({ limit, skip });
    if (skip === 0) {
      setTransactions(result);
    } else {
      setTransactions((prev) => [...prev, ...result]);
    }
    setHasMore(result.length === limit);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="ps-history-loading">
        <Spinner />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="ps-history-empty">
        <span className="ps-history-empty-icon">🪙</span>
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="ps-history">
      <div className="ps-history-list">
        {transactions.map((tx) => (
          <div key={tx._id || tx.id} className="ps-history-item">
            <div className="ps-history-icon">
              {TYPE_ICONS[tx.type] || "🪙"}
            </div>
            <div className="ps-history-details">
              <div className="ps-history-type">
                {TYPE_LABELS[tx.type] || tx.type}
              </div>
              <div className="ps-history-desc">{tx.description}</div>
            </div>
            <div className="ps-history-amount-col">
              <div
                className={`ps-history-amount ${
                  tx.amount > 0 ? "ps-history-amount--positive" : "ps-history-amount--negative"
                }`}
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount.toLocaleString()}
              </div>
              <div className="ps-history-time">{formatDate(tx.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          className="ps-history-load-more"
          onClick={() => loadHistory(transactions.length)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}



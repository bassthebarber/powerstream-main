// frontend/src/components/monetization/BalanceDisplay.jsx
// Coin balance display component per Overlord Spec
import React from "react";
import { useCoins } from "../../context/CoinContext.jsx";
import "./monetization.css";

export default function BalanceDisplay({
  size = "medium", // small, medium, large
  showLabel = true,
  onClick,
}) {
  const { balance, loading, claimFaucet } = useCoins();

  const handleClaimDaily = async () => {
    const result = await claimFaucet();
    if (result.success) {
      alert(`Claimed ${result.data.amount} coins! New balance: ${result.data.newBalance}`);
    } else {
      alert(result.message);
    }
  };

  return (
    <div
      className={`ps-balance ps-balance--${size}`}
      onClick={onClick}
    >
      <div className="ps-balance-main">
        <span className="ps-balance-icon">🪙</span>
        <span className="ps-balance-amount">
          {loading ? "..." : balance.toLocaleString()}
        </span>
        {showLabel && <span className="ps-balance-label">coins</span>}
      </div>
      
      <button
        className="ps-balance-claim"
        onClick={(e) => {
          e.stopPropagation();
          handleClaimDaily();
        }}
        title="Claim daily coins"
      >
        +
      </button>
    </div>
  );
}



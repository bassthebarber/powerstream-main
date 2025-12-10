// frontend/src/components/tv/global/EarningsBadge.jsx
// Universal TV Earnings Badge Component

import React from "react";
import styles from "./global.module.css";

/**
 * Earnings Badge - Shows total earnings for a video
 * 
 * @param {Object} props
 * @param {number} props.totalEarnings - Total earnings in USD
 * @param {string} props.size - "small" | "medium" | "large"
 * @param {boolean} props.showIcon - Show dollar icon
 * @param {string} props.className - Additional CSS class
 */
export default function EarningsBadge({
  totalEarnings = 0,
  size = "medium",
  showIcon = true,
  className = "",
}) {
  const formatEarnings = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    if (amount >= 1) {
      return `$${amount.toFixed(2)}`;
    }
    return `$${amount.toFixed(4)}`;
  };

  const sizeClass = {
    small: styles.earningsSmall,
    medium: styles.earningsMedium,
    large: styles.earningsLarge,
  }[size] || styles.earningsMedium;

  return (
    <div className={`${styles.earningsBadge} ${sizeClass} ${className}`}>
      {showIcon && <span className={styles.earningsIcon}>💰</span>}
      <span className={styles.earningsLabel}>Earned:</span>
      <span className={styles.earningsValue}>
        {formatEarnings(totalEarnings)}
      </span>
    </div>
  );
}

/**
 * Compact Earnings Display (for cards)
 */
export function EarningsCompact({ totalEarnings = 0, className = "" }) {
  const formatEarnings = (amount) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    if (amount > 0) return `$${amount.toFixed(2)}`;
    return "$0";
  };

  return (
    <span className={`${styles.earningsCompact} ${className}`}>
      💰 {formatEarnings(totalEarnings)}
    </span>
  );
}

/**
 * Earnings Progress Bar - Shows earnings towards a goal
 */
export function EarningsProgress({
  current = 0,
  goal = 100,
  label = "Earnings Goal",
  className = "",
}) {
  const percentage = Math.min(100, (current / goal) * 100);

  return (
    <div className={`${styles.earningsProgress} ${className}`}>
      <div className={styles.earningsProgressHeader}>
        <span className={styles.earningsProgressLabel}>{label}</span>
        <span className={styles.earningsProgressAmount}>
          ${current.toFixed(2)} / ${goal.toFixed(2)}
        </span>
      </div>
      <div className={styles.earningsProgressBar}>
        <div 
          className={styles.earningsProgressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={styles.earningsProgressPercent}>
        {percentage.toFixed(1)}% complete
      </div>
    </div>
  );
}

/**
 * Earnings Breakdown - Shows split between recipients
 */
export function EarningsBreakdown({
  platformCut = 0,
  stationOwnerCut = 0,
  artistCut = 0,
  managerCut = 0,
  className = "",
}) {
  const total = platformCut + stationOwnerCut + artistCut + managerCut;

  const items = [
    { label: "Platform", amount: platformCut, color: "#FFD700" },
    { label: "Station Owner", amount: stationOwnerCut, color: "#7B2CBF" },
    { label: "Artist", amount: artistCut, color: "#00CED1" },
    { label: "Manager", amount: managerCut, color: "#FF4500" },
  ].filter(item => item.amount > 0);

  return (
    <div className={`${styles.earningsBreakdown} ${className}`}>
      <h4 className={styles.earningsBreakdownTitle}>Earnings Breakdown</h4>
      <div className={styles.earningsBreakdownTotal}>
        Total: ${total.toFixed(4)}
      </div>
      <div className={styles.earningsBreakdownItems}>
        {items.map((item, index) => (
          <div key={index} className={styles.earningsBreakdownItem}>
            <div 
              className={styles.earningsBreakdownDot}
              style={{ backgroundColor: item.color }}
            />
            <span className={styles.earningsBreakdownLabel}>{item.label}</span>
            <span className={styles.earningsBreakdownAmount}>
              ${item.amount.toFixed(4)}
            </span>
            <span className={styles.earningsBreakdownPercent}>
              ({total > 0 ? ((item.amount / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}



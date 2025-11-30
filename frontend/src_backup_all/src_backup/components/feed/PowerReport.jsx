// src/components/feed/PowerReport.jsx
export default function PowerReport({ postId }) {
  const handleReport = () => {
    // You can implement an advanced modal later
    alert("Report sent. Thank you.");
  };

  return (
    <button onClick={handleReport} className="report-btn">🚨 Report</button>
  );
}



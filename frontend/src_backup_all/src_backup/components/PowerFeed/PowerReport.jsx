import React from "react";

export default function PowerReport({ postId }) {
  const handleReport = () => {
    console.log(`Reported post ID: ${postId}`);
  };

  return <button onClick={handleReport}>Report</button>;
}



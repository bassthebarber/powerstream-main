import React from "react";

export default function PowerShare({ postContent }) {
  const handleShare = () => {
    console.log("Shared:", postContent);
  };

  return <button onClick={handleShare}>Share</button>;
}



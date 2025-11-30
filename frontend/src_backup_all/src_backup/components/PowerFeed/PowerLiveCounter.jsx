import React, { useEffect, useState } from "react";

export default function PowerLiveCounter({ postId }) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setViews((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return <p>Live Views: {views}</p>;
}



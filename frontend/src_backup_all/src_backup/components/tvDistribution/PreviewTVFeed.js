// frontend/src/components/tvDistribution/PreviewTVFeed.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PreviewTVFeed() {
  const [roku, setRoku] = useState([]);
  const [fire, setFire] = useState([]);
  const [apple, setApple] = useState([]);

  useEffect(() => {
    async function fetchFeeds() {
      const rokuRes = await axios.get("/api/tv/roku/feed");
      const fireRes = await axios.get("/api/tv/fire/config");
      const appleRes = await axios.get("/api/tv/apple/feed");
      setRoku(rokuRes.data.categories?.[0]?.playlist || []);
      setFire(fireRes.data.content || []);
      setApple(appleRes.data.items || []);
    }
    fetchFeeds();
  }, []);

  return (
    <div>
      <h3>TV Feed Preview</h3>

      <h4>Roku:</h4>
      <ul>
        {roku.map((item, i) => (
          <li key={i}>{item.title}</li>
        ))}
      </ul>

      <h4>Fire TV:</h4>
      <ul>
        {fire.map((item, i) => (
          <li key={i}>{item.title}</li>
        ))}
      </ul>

      <h4>Apple TV:</h4>
      <ul>
        {apple.map((item, i) => (
          <li key={i}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

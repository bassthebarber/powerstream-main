// frontend/src/components/powerreel/ReelLayout.jsx
// Note: Main PowerReel page now handles the full layout
// This component is kept for backwards compatibility and embedding
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/api.js";
import ReelPlayer from "./ReelPlayer.jsx";
import ReelSidebar from "./ReelSidebar.jsx";
import "../../styles/powerreel.css";

export default function ReelLayout({ limit = 20, embedded = false }) {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const reelRefs = useRef([]);

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/powerreel?limit=${limit}`);
      if (res.data?.ok) {
        setReels(res.data.reels || []);
      } else if (res.data?.reels) {
        setReels(res.data.reels);
      } else if (Array.isArray(res.data)) {
        setReels(res.data);
      }
    } catch (err) {
      console.error("Error loading reels:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Intersection Observer
  useEffect(() => {
    if (!reels.length) return;

    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.reelIdx);
          setActiveIndex(idx);
        }
      });
    }, options);

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reels]);

  const handleLike = async (reelId) => {
    if (!user?.id) return;
    try {
      await api.post(`/powerreel/${reelId}/like`);
      fetchReels();
    } catch (err) {
      console.error("Error liking reel:", err);
    }
  };

  const containerClass = embedded ? "pr-container-embedded" : "pr-container";

  if (loading) {
    return (
      <div className="pr-loading">
        <div className="pr-loading-spinner"></div>
        <span>Loading Reels...</span>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="pr-empty">
        <div className="pr-empty-icon">🎬</div>
        <h3>No Reels Yet</h3>
        <p>Be the first to share a PowerReel!</p>
      </div>
    );
  }

  return (
    <div className={containerClass} ref={containerRef}>
      {reels.map((reel, idx) => (
        <div
          key={reel._id || reel.id || idx}
          ref={(el) => (reelRefs.current[idx] = el)}
          data-reel-idx={idx}
          className="pr-reel"
        >
          <ReelPlayer reel={reel} active={idx === activeIndex} />
          <ReelSidebar
            reel={reel}
            onLike={() => handleLike(reel._id || reel.id)}
            userId={user?.id ? String(user.id) : null}
          />
        </div>
      ))}
    </div>
  );
}

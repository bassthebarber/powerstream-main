// frontend/src/pages/menu/FriendsPage.jsx
import React, { useState, useEffect } from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";
import api from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("friends");

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await api.get("/users/friends").catch(() => ({ data: { friends: [] } }));
      setFriends(res.data?.friends || []);
      
      const reqRes = await api.get("/users/friend-requests").catch(() => ({ data: { requests: [] } }));
      setRequests(reqRes.data?.requests || []);
    } catch (err) {
      console.log("Friends API not available");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo
  const mockFriends = [
    { id: 1, name: "Southern Power", role: "Producer", avatarUrl: null, mutualFriends: 12 },
    { id: 2, name: "No Limit Houston", role: "Artist", avatarUrl: null, mutualFriends: 8 },
    { id: 3, name: "Studio Pro", role: "Engineer", avatarUrl: null, mutualFriends: 5 },
  ];

  const displayFriends = friends.length > 0 ? friends : mockFriends;

  return (
    <MenuPageLayout
      icon="👥"
      title="Friends"
      subtitle="Manage your connections on PowerStream"
    >
      <div className="friends-tabs">
        <button 
          className={`friends-tab ${tab === "friends" ? "friends-tab--active" : ""}`}
          onClick={() => setTab("friends")}
        >
          All Friends ({displayFriends.length})
        </button>
        <button 
          className={`friends-tab ${tab === "requests" ? "friends-tab--active" : ""}`}
          onClick={() => setTab("requests")}
        >
          Requests ({requests.length})
        </button>
        <button 
          className={`friends-tab ${tab === "suggestions" ? "friends-tab--active" : ""}`}
          onClick={() => setTab("suggestions")}
        >
          Suggestions
        </button>
      </div>

      {loading ? (
        <div className="ps-menu-empty">Loading...</div>
      ) : tab === "friends" ? (
        <div className="ps-menu-grid">
          {displayFriends.map((friend) => (
            <div key={friend.id || friend._id} className="ps-menu-card">
              <div className="ps-menu-card-header">
                <div className="friend-avatar">
                  {friend.avatarUrl ? (
                    <img src={friend.avatarUrl} alt={friend.name} />
                  ) : (
                    <span>{friend.name?.[0] || "U"}</span>
                  )}
                </div>
                <div>
                  <h3 className="ps-menu-card-title">{friend.name}</h3>
                  <p className="ps-menu-card-meta">{friend.role || "Artist"} • {friend.mutualFriends || 0} mutual</p>
                </div>
              </div>
              <div className="ps-menu-card-footer">
                <button className="ps-menu-btn ps-menu-btn--primary">Message</button>
                <button className="ps-menu-btn ps-menu-btn--secondary">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      ) : tab === "requests" ? (
        <div className="ps-menu-empty">
          <div className="ps-menu-empty-icon">📬</div>
          <h3>No pending requests</h3>
          <p>Friend requests will appear here</p>
        </div>
      ) : (
        <div className="ps-menu-grid">
          {mockFriends.map((friend, idx) => (
            <div key={idx} className="ps-menu-card">
              <div className="ps-menu-card-header">
                <div className="friend-avatar">
                  <span>{friend.name?.[0]}</span>
                </div>
                <div>
                  <h3 className="ps-menu-card-title">{friend.name}</h3>
                  <p className="ps-menu-card-meta">{friend.mutualFriends} mutual friends</p>
                </div>
              </div>
              <div className="ps-menu-card-footer">
                <button className="ps-menu-btn ps-menu-btn--primary">Add Friend</button>
                <button className="ps-menu-btn ps-menu-btn--secondary">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .friends-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .friends-tab {
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .friends-tab:hover {
          background: rgba(255,255,255,0.08);
        }

        .friends-tab--active {
          background: var(--gold);
          border-color: var(--gold);
          color: #000;
        }

        .friend-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), #ffda5c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: #000;
          overflow: hidden;
        }

        .friend-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </MenuPageLayout>
  );
}




// src/components/FollowButton.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function FollowButton({ targetUserId, currentUserId }) {
  const [following, setFollowing] = useState(false);
  useEffect(() => {
    if (!currentUserId || !targetUserId) return;
    supabase.from("follows").select("*")
      .eq("follower_id", currentUserId).eq("followee_id", targetUserId)
      .then(({ data }) => setFollowing((data||[]).length>0));
  }, [currentUserId, targetUserId]);
  async function toggle() {
    if (!currentUserId) return alert("Sign in to follow.");
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("followee_id", targetUserId);
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, followee_id: targetUserId });
      setFollowing(true);
    }
  }
  if (currentUserId === targetUserId) return null;
  return <button className="btn" onClick={toggle}>{following ? "Following" : "Follow"}</button>;
}



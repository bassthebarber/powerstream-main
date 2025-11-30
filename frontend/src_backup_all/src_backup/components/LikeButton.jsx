import React, { useState } from "react";
import { supabase } from "@/services/supabaseClient";

const LikeButton = ({ postId }) => {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const { error } = await supabase
      .from("feed_likes")
      .insert([{ post_id: postId }]);

    if (error) {
      console.error("Like error:", error.message);
    } else {
      setLiked(true);
    }
  };

  return (
    <button onClick={handleLike} disabled={liked}>
      {liked ? "Liked" : "Like"}
    </button>
  );
};

export default LikeButton;



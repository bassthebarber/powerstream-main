import React, { useState } from "react";

export default function PowerLike({ postId }) {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    console.log(`${liked ? "Unliked" : "Liked"} post ID: ${postId}`);
  };

  return <button onClick={toggleLike}>{liked ? "Unlike" : "Like"}</button>;
}



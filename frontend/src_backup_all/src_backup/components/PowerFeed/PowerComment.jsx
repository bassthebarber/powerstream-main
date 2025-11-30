import React, { useState } from "react";

export default function PowerComment({ postId }) {
  const [comment, setComment] = useState("");

  const handleComment = () => {
    console.log(`Comment on ${postId}: ${comment}`);
    setComment("");
  };

  return (
    <div className="comment-box">
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
      />
      <button onClick={handleComment}>Comment</button>
    </div>
  );
}



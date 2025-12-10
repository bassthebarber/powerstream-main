import React, { useState } from "react";
import { supabase } from "@/services/supabaseClient";

const CommentBox = ({ postId }) => {
  const [comment, setComment] = useState("");

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment) return;

    const { error } = await supabase
      .from("feed_comments")
      .insert([{ post_id: postId, content: comment }]);

    if (error) {
      console.error("Comment error:", error.message);
    } else {
      setComment("");
    }
  };

  return (
    <form onSubmit={handleComment}>
      <input
        type="text"
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit">Comment</button>
    </form>
  );
};

export default CommentBox;



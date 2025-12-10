import React, { useState } from "react";
import PowerSave from "./PowerSave.jsx";

export default function PostComposer() {
  const [text, setText] = useState("");
  const handlePost = () => {
    console.log("Posted:", text);
    setText("");
  };

  return (
    <div className="post-composer">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
      ></textarea>
      <button onClick={handlePost}>Post</button>
      <PowerSave postContent={text} />
    </div>
  );
}


